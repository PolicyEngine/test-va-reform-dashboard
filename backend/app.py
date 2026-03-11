import modal
from pathlib import Path
from _image_setup import snapshot_models

app = modal.App("va-reform-dashboard-workers")
_BACKEND_DIR = Path(__file__).parent
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("policyengine-us==1.554.1", "pydantic")
    .run_function(snapshot_models)
    .add_local_file(
        str(_BACKEND_DIR / "simulation.py"),
        remote_path="/root/simulation.py",
    )
)


@app.function(image=image, cpu=8.0, memory=32768, timeout=3600)
def compute_household(params: dict) -> dict:
    from simulation import run_household

    return run_household(params)


@app.function(image=image, cpu=8.0, memory=32768, timeout=3600)
def compute_statewide(params: dict) -> dict:
    from simulation import run_statewide

    return run_statewide(params)
