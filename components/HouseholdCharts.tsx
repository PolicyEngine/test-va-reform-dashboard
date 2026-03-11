'use client'

import { ChartContainer } from '@policyengine/ui-kit'
import { EarningsLineChart, type SeriesConfig } from './EarningsLineChart'
import type { HouseholdImpactResponse } from '@/lib/api/types'

interface HouseholdChartsProps {
  data: HouseholdImpactResponse
  income: number
}

/**
 * Transform parallel arrays into recharts-compatible array of objects.
 */
function toChartData(
  xAxis: number[],
  seriesArrays: Record<string, number[]>,
): Record<string, unknown>[] {
  return xAxis.map((x, i) => {
    const point: Record<string, unknown> = { earnings: x }
    for (const [key, arr] of Object.entries(seriesArrays)) {
      point[key] = arr[i]
    }
    return point
  })
}

export function HouseholdCharts({ data, income }: HouseholdChartsProps) {
  const netIncomeData = toChartData(data.earnings_axis, {
    baseline: data.baseline_net_income,
    reform: data.reform_net_income,
  })

  const federalTaxData = toChartData(data.earnings_axis, {
    baseline: data.baseline_federal_tax,
    reform: data.reform_federal_tax,
  })

  const stateTaxData = toChartData(data.earnings_axis, {
    baseline: data.baseline_state_tax,
    reform: data.reform_state_tax,
  })

  const creditsData = toChartData(data.earnings_axis, {
    baseline_ctc: data.baseline_ctc,
    reform_ctc: data.reform_ctc,
    baseline_eitc: data.baseline_eitc,
    reform_eitc: data.reform_eitc,
  })

  const mtrData = toChartData(data.earnings_axis, {
    baseline_mtr: data.baseline_mtr,
    reform_mtr: data.reform_mtr,
  })

  const netIncomeSeries: SeriesConfig[] = [
    {
      dataKey: 'baseline',
      name: 'Baseline',
      color: 'var(--chart-5)',
      strokeDasharray: '6 3',
    },
    { dataKey: 'reform', name: 'Reform', color: 'var(--chart-1)' },
  ]

  const federalTaxSeries: SeriesConfig[] = [
    {
      dataKey: 'baseline',
      name: 'Baseline',
      color: 'var(--chart-5)',
      strokeDasharray: '6 3',
    },
    { dataKey: 'reform', name: 'Reform', color: 'var(--chart-1)' },
  ]

  const stateTaxSeries: SeriesConfig[] = [
    {
      dataKey: 'baseline',
      name: 'Baseline',
      color: 'var(--chart-5)',
      strokeDasharray: '6 3',
    },
    { dataKey: 'reform', name: 'Reform', color: 'var(--chart-2)' },
  ]

  const creditsSeries: SeriesConfig[] = [
    {
      dataKey: 'baseline_ctc',
      name: 'CTC (baseline)',
      color: 'var(--chart-5)',
      strokeDasharray: '6 3',
    },
    { dataKey: 'reform_ctc', name: 'CTC (reform)', color: 'var(--chart-1)' },
    {
      dataKey: 'baseline_eitc',
      name: 'EITC (baseline)',
      color: 'var(--chart-4)',
      strokeDasharray: '6 3',
    },
    {
      dataKey: 'reform_eitc',
      name: 'EITC (reform)',
      color: 'var(--chart-2)',
    },
  ]

  const mtrSeries: SeriesConfig[] = [
    {
      dataKey: 'baseline_mtr',
      name: 'Baseline MTR',
      color: 'var(--chart-5)',
      strokeDasharray: '6 3',
    },
    { dataKey: 'reform_mtr', name: 'Reform MTR', color: 'var(--chart-1)' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <ChartContainer
        title="Net income by earnings level"
        subtitle="Compares household net income under baseline and reform across earnings"
      >
        <EarningsLineChart
          data={netIncomeData}
          xKey="earnings"
          series={netIncomeSeries}
          referenceX={income}
          height={400}
        />
      </ChartContainer>

      <ChartContainer title="Federal income tax by earnings">
        <EarningsLineChart
          data={federalTaxData}
          xKey="earnings"
          series={federalTaxSeries}
          referenceX={income}
          height={350}
        />
      </ChartContainer>

      <ChartContainer title="Virginia income tax by earnings">
        <EarningsLineChart
          data={stateTaxData}
          xKey="earnings"
          series={stateTaxSeries}
          referenceX={income}
          height={350}
        />
      </ChartContainer>

      <ChartContainer title="Tax credits by earnings (CTC + EITC)">
        <EarningsLineChart
          data={creditsData}
          xKey="earnings"
          series={creditsSeries}
          referenceX={income}
          height={350}
        />
      </ChartContainer>

      <ChartContainer
        title="Marginal tax rate comparison"
        subtitle="Shows combined marginal tax rates under baseline and reform across earnings"
      >
        <EarningsLineChart
          data={mtrData}
          xKey="earnings"
          series={mtrSeries}
          referenceX={income}
          height={400}
          yAxisPercent
          yDomain={[0, 0.6]}
        />
      </ChartContainer>
    </div>
  )
}
