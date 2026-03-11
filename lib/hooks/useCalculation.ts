import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { submitJob, pollStatus } from '../api/client'
import type { StatusResponse } from '../api/client'

export function useAsyncCalculation<T>(
  queryKey: unknown[],
  endpoint: string,
  params: unknown,
  options?: { enabled?: boolean },
) {
  const [jobId, setJobId] = useState<string | null>(null)

  // Reset job when params change
  useEffect(() => {
    setJobId(null)
  }, [JSON.stringify(params)])

  // Step 1: Submit job
  const submit = useQuery({
    queryKey: [...queryKey, 'submit'],
    queryFn: async () => {
      const id = await submitJob(endpoint, params)
      setJobId(id)
      return id
    },
    enabled: options?.enabled ?? true,
  })

  // Step 2: Poll for results
  const poll = useQuery<StatusResponse>({
    queryKey: [...queryKey, 'poll', jobId],
    queryFn: () => pollStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) =>
      query.state.data?.status === 'computing' ? 2000 : false,
  })

  return {
    isLoading: submit.isPending || (!!jobId && poll.isPending),
    isComputing: poll.data?.status === 'computing',
    isError: submit.isError || poll.data?.status === 'error',
    data: poll.data?.status === 'ok' ? (poll.data.result as T) : undefined,
    error: poll.data?.message || submit.error?.message,
  }
}
