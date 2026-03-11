'use client'

import { MetricCard } from '@policyengine/ui-kit'
import type { HouseholdSummary } from '@/lib/api/types'
import { formatCurrencySigned } from '@/lib/formatters'

interface HouseholdMetricsProps {
  summary: HouseholdSummary
}

export function HouseholdMetrics({ summary }: HouseholdMetricsProps) {
  const netChangeTrend: 'positive' | 'negative' | 'neutral' =
    summary.net_change > 0
      ? 'positive'
      : summary.net_change < 0
        ? 'negative'
        : 'neutral'

  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <h2 className="mb-3 text-base font-semibold text-foreground sm:mb-4 sm:text-lg">
        Your household impact
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <MetricCard
          label="Federal tax (baseline)"
          value={summary.baseline_federal_tax}
          format="currency"
        />
        <MetricCard
          label="Federal tax (reform)"
          value={summary.reform_federal_tax}
          format="currency"
        />
        <MetricCard
          label="VA tax (baseline)"
          value={summary.baseline_state_tax}
          format="currency"
        />
        <MetricCard
          label="VA tax (reform)"
          value={summary.reform_state_tax}
          format="currency"
        />
        <MetricCard
          label="CTC (baseline)"
          value={summary.baseline_ctc}
          format="currency"
        />
        <MetricCard
          label="CTC (reform)"
          value={summary.reform_ctc}
          format="currency"
        />
        <MetricCard
          label="EITC (baseline)"
          value={summary.baseline_eitc}
          format="currency"
        />
        <MetricCard
          label="EITC (reform)"
          value={summary.reform_eitc}
          format="currency"
        />
      </div>
      <div className="mt-4 border-t border-border pt-4">
        <MetricCard
          label="Net income change"
          value={summary.net_change}
          format="currency"
          trend={netChangeTrend}
          delta={formatCurrencySigned(summary.net_change)}
          className="max-w-xs"
        />
      </div>
    </div>
  )
}
