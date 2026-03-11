'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Prevent automatic refetching on window focus — the gateway+polling
            // pattern manages its own lifecycle and we don't want to re-submit
            // jobs just because the user switched tabs.
            refetchOnWindowFocus: false,

            // Don't refetch when the component remounts
            refetchOnMount: false,

            // Don't refetch on reconnect (stale data is fine; user can retry)
            refetchOnReconnect: false,

            // Keep stale data displayed while new data loads
            staleTime: Infinity,

            // Keep unused query data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,

            // Default retry: 2 attempts with exponential backoff
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
