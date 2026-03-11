// Gateway + Polling client for custom Modal backend
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://policyengine--va-reform-dashboard-fastapi-app.modal.run'

interface JobResponse {
  job_id: string
}

export interface StatusResponse {
  status: 'computing' | 'ok' | 'error'
  result?: unknown
  message?: string
}

export async function submitJob(
  endpoint: string,
  params: unknown,
): Promise<string> {
  const res = await fetch(`${API_URL}/submit/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error(`Submit failed: ${res.status}`)
  const data: JobResponse = await res.json()
  return data.job_id
}

export async function pollStatus(jobId: string): Promise<StatusResponse> {
  const res = await fetch(`${API_URL}/status/${jobId}`)
  if (!res.ok) throw new Error(`Status check failed: ${res.status}`)
  return res.json()
}
