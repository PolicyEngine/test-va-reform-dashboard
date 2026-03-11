"""
Lightweight gateway — no policyengine dependency.
Spawns worker jobs and polls for results.
"""

import modal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = modal.App("va-reform-dashboard")

gateway_image = modal.Image.debian_slim(
    python_version="3.11"
).pip_install("fastapi", "pydantic")

WORKER_APP = "va-reform-dashboard-workers"

FUNCTION_MAP = {
    "household-impact": "compute_household",
    "statewide-impact": "compute_statewide",
}

web_app = FastAPI()
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class SubmitResponse(BaseModel):
    job_id: str


class StatusResponse(BaseModel):
    status: str  # "computing" | "ok" | "error"
    result: dict | None = None
    message: str | None = None


@web_app.post("/submit/{endpoint}")
def submit(endpoint: str, params: dict):
    if endpoint not in FUNCTION_MAP:
        raise HTTPException(
            status_code=404, detail=f"Unknown endpoint: {endpoint}"
        )
    fn = modal.Function.from_name(WORKER_APP, FUNCTION_MAP[endpoint])
    call = fn.spawn(params)
    return SubmitResponse(job_id=call.object_id)


@web_app.get("/status/{job_id}")
def status(job_id: str):
    from modal.functions import FunctionCall

    call = FunctionCall.from_id(job_id)
    try:
        result = call.get(timeout=0)
        return StatusResponse(status="ok", result=result)
    except TimeoutError:
        return StatusResponse(status="computing")
    except Exception as e:
        return StatusResponse(status="error", message=str(e))


@app.function(image=gateway_image)
@modal.asgi_app()
def fastapi_app():
    return web_app
