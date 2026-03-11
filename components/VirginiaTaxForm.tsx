'use client'

import {
  SliderInput,
  CurrencyInput,
  InputGroup,
} from '@policyengine/ui-kit'
import { formatPercent } from '@/lib/formatters'
import type { ReformParams } from '@/lib/api/types'
import type { FilingStatus } from '@/lib/constants'

interface VirginiaTaxFormProps {
  reform: ReformParams
  filingStatus: FilingStatus
  onUpdate: <K extends keyof ReformParams>(key: K, value: ReformParams[K]) => void
}

const VA_RATE_FIELDS = [
  { key: 'va_rate_1' as const, label: 'Bracket 1 rate ($0-$3k)', max: 0.1, step: 0.005 },
  { key: 'va_rate_2' as const, label: 'Bracket 2 rate ($3k-$5k)', max: 0.1, step: 0.005 },
  { key: 'va_rate_3' as const, label: 'Bracket 3 rate ($5k-$17k)', max: 0.1, step: 0.005 },
  { key: 'va_rate_4' as const, label: 'Bracket 4 rate ($17k+)', max: 0.1, step: 0.0025 },
]

export function VirginiaTaxForm({
  reform,
  filingStatus,
  onUpdate,
}: VirginiaTaxFormProps) {
  const deductionValue =
    reform.va_standard_deduction ?? (filingStatus === 'joint' ? 17500 : 8750)

  return (
    <InputGroup label="Virginia income tax">
      {VA_RATE_FIELDS.map(({ key, label, max, step }) => (
        <SliderInput
          key={key}
          label={label}
          value={reform[key] as number}
          onChange={(v) => onUpdate(key, v)}
          min={0}
          max={max}
          step={step}
          formatValue={formatPercent}
        />
      ))}
      <CurrencyInput
        label="Standard deduction"
        value={deductionValue}
        onChange={(v) => onUpdate('va_standard_deduction', v)}
        min={0}
        max={50000}
        step={250}
      />
    </InputGroup>
  )
}
