'use client'

import { Button } from '@policyengine/ui-kit'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({
  message = 'Computing results...',
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-12">
      <p className="text-sm font-medium text-destructive">Error</p>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-2">
          Retry
        </Button>
      )}
    </div>
  )
}

export function ComputingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <p className="text-sm text-muted-foreground">
        Running microsimulation... This may take 2-5 minutes.
      </p>
    </div>
  )
}

export function EmptyState({ message = 'Adjust your settings and results will appear here.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
