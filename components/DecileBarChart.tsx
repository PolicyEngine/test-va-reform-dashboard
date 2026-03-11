'use client'

import { PEBarChart, ChartContainer } from '@policyengine/ui-kit'
import { formatCurrency } from '@/lib/formatters'
import type { DecileImpact } from '@/lib/api/types'

interface DecileBarChartProps {
  data: DecileImpact[]
  height?: number
}

export function DecileBarChart({ data, height = 350 }: DecileBarChartProps) {
  const chartData = data.map((d) => ({
    decile: `${d.decile}`,
    avg_income_change: d.avg_income_change,
  }))

  return (
    <ChartContainer
      title="Average income change by decile"
      subtitle="Shows how the reform affects Virginia households across the income distribution"
    >
      <PEBarChart
        data={chartData}
        xKey="decile"
        yKey="avg_income_change"
        height={height}
        colorByValue
        positiveColor="var(--chart-1)"
        negativeColor="var(--destructive)"
        xLabel="Income decile"
        yLabel="Average income change"
        formatTooltip={formatCurrency}
      />
    </ChartContainer>
  )
}
