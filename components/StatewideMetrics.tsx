'use client'

import { MetricCard } from '@policyengine/ui-kit'
import type { StatewideImpactResponse } from '@/lib/api/types'

interface StatewideMetricsProps {
  data: StatewideImpactResponse
}

export function StatewideSummaryMetrics({ data }: StatewideMetricsProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Statewide impact summary
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricCard
          label="Federal revenue change (VA)"
          value={data.federal_revenue_change}
          format="currency"
          trend={
            data.federal_revenue_change > 0
              ? 'positive'
              : data.federal_revenue_change < 0
                ? 'negative'
                : 'neutral'
          }
        />
        <MetricCard
          label="State revenue change"
          value={data.state_revenue_change}
          format="currency"
          trend={
            data.state_revenue_change > 0
              ? 'positive'
              : data.state_revenue_change < 0
                ? 'negative'
                : 'neutral'
          }
        />
        <MetricCard label="Winners" value={data.winners} format="number" />
        <MetricCard label="Losers" value={data.losers} format="number" />
      </div>
    </div>
  )
}

export function PovertyMetrics({ data }: StatewideMetricsProps) {
  // For poverty, negative = good (poverty went down)
  const povertyTrend: 'positive' | 'negative' | 'neutral' =
    data.poverty_rate_change < 0
      ? 'positive'
      : data.poverty_rate_change > 0
        ? 'negative'
        : 'neutral'

  const childPovertyTrend: 'positive' | 'negative' | 'neutral' =
    data.child_poverty_rate_change < 0
      ? 'positive'
      : data.child_poverty_rate_change > 0
        ? 'negative'
        : 'neutral'

  const fmtPp = (v: number) => {
    const sign = v > 0 ? '+' : ''
    return `${sign}${v.toFixed(2)} pp`
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Poverty impact
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricCard
          label="Overall poverty rate change"
          value={fmtPp(data.poverty_rate_change)}
          format="string"
          trend={povertyTrend}
        />
        <MetricCard
          label="Child poverty rate change"
          value={fmtPp(data.child_poverty_rate_change)}
          format="string"
          trend={childPovertyTrend}
        />
      </div>
    </div>
  )
}
