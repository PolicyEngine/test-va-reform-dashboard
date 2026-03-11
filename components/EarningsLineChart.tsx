'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import {
  AXIS_STYLE,
  GRID_STYLE,
  TOOLTIP_STYLE,
  LEGEND_STYLE,
} from '@policyengine/ui-kit'
import { tickCurrency, tickPercent } from '@/lib/formatters'

export interface SeriesConfig {
  dataKey: string
  name: string
  color: string
  strokeDasharray?: string
}

interface EarningsLineChartProps {
  data: Record<string, unknown>[]
  xKey: string
  series: SeriesConfig[]
  /** The user's current income — draws a vertical reference line */
  referenceX?: number
  referenceLabel?: string
  /** Height for the chart at desktop */
  height?: number
  /** Format y-axis as percent (expects decimal values like 0.22) */
  yAxisPercent?: boolean
  /** Fixed y-axis domain, e.g. [0, 0.6] */
  yDomain?: [number, number]
}

export function EarningsLineChart({
  data,
  xKey,
  series,
  referenceX,
  referenceLabel = 'Your income',
  height = 350,
  yAxisPercent = false,
  yDomain,
}: EarningsLineChartProps) {
  const yFormatter = yAxisPercent ? tickPercent : tickCurrency

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ left: 10, right: 20, top: 10, bottom: 5 }}
      >
        <CartesianGrid {...GRID_STYLE} />
        <XAxis
          dataKey={xKey}
          type="number"
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={{ stroke: 'var(--border)' }}
          tickFormatter={tickCurrency}
          domain={['auto', 'auto']}
        />
        <YAxis
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={{ stroke: 'var(--border)' }}
          tickFormatter={yFormatter}
          domain={yDomain ?? ['auto', 'auto']}
        />
        <Tooltip
          {...TOOLTIP_STYLE}
          separator=": "
          labelFormatter={tickCurrency}
          formatter={(value: number, name: string) => [
            yAxisPercent ? tickPercent(value) : tickCurrency(value),
            name,
          ]}
        />
        <Legend {...LEGEND_STYLE} />
        {series.map((s) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            strokeDasharray={s.strokeDasharray}
          />
        ))}
        {referenceX != null && (
          <ReferenceLine
            x={referenceX}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            label={{
              value: referenceLabel,
              position: 'top',
              fill: 'var(--muted-foreground)',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
            }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
