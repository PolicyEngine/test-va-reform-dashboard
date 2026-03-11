import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { submitJob, pollStatus } from '../api/client'

/**
 * Stable JSON serialization for cache-key comparison.
 * Sorts object keys so { a: 1, b: 2 } and { b: 2, a: 1 } produce the same string.
 */
function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.keys(v)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = (v as Record<string, unknown>)[key]
          return acc
        }, {})
    }
    return v
  })
}

/**
 * Hook for async calculation via the gateway+polling backend.
 *
 * Flow:
 *   1. When params change, submit a new job (POST) and get a job_id.
 *   2. Poll the status endpoint until status is 'ok' or 'error'.
 *   3. Return the result typed as T.
 *
 * Key design decisions:
 *   - The submit step uses useQuery with a params-hash as part of the queryKey
 *     so React Query deduplicates identical submissions automatically.
 *   - staleTime: Infinity prevents re-submitting the same params on window focus.
 *   - The poll step uses refetchInterval to poll only while status is 'computing'.
 *   - When params change, a new queryKey triggers a fresh submit+poll cycle.
 */
export function useAsyncCalculation<T>(
  baseKey: string,
  endpoint: string,
  params: unknown,
  options?: { enabled?: boolean },
) {
  // Create a stable hash of params to use in query keys. This ensures:
  //   - Same params = same key = no redundant submissions
  //   - Changed params = new key = fresh submission
  const paramsHash = useMemo(() => stableStringify(params), [params])

  const enabled = options?.enabled ?? true

  // Step 1: Submit job and get job_id
  // This acts as a "lazy mutation" that fires once per unique params set.
  // staleTime: Infinity means we never re-submit the same params.
  const submit = useQuery({
    queryKey: [baseKey, 'submit', paramsHash],
    queryFn: () => submitJob(endpoint, params),
    enabled,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000, // Keep cached job_id for 5 minutes
    retry: 2,
    retryDelay: 1000,
  })

  const jobId = submit.data

  // Step 2: Poll for results
  const poll = useQuery({
    queryKey: [baseKey, 'poll', jobId],
    queryFn: () => pollStatus(jobId!),
    enabled: !!jobId,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      // Keep polling every 2s while computing; stop when done
      if (status === 'computing') return 2000
      return false
    },
    retry: 3,
    retryDelay: 2000,
  })

  const queryClient = useQueryClient()

  const isComputing = poll.data?.status === 'computing'
  const isError = submit.isError || poll.isError || poll.data?.status === 'error'
  const isLoading = (enabled && submit.isPending) || (!!jobId && poll.isPending)
  const data = poll.data?.status === 'ok' ? (poll.data.result as T) : undefined

  const errorMessage =
    poll.data?.status === 'error'
      ? poll.data.message ?? 'Computation failed.'
      : submit.error?.message ??
        poll.error?.message ??
        undefined

  // Retry by invalidating both the submit and poll queries for current params.
  // This forces a fresh job submission.
  const retry = useCallback(() => {
    queryClient.removeQueries({ queryKey: [baseKey, 'submit', paramsHash] })
    queryClient.removeQueries({ queryKey: [baseKey, 'poll', jobId] })
  }, [queryClient, baseKey, paramsHash, jobId])

  return {
    isLoading,
    isComputing,
    isError,
    data,
    error: errorMessage,
    retry,
  }
}
