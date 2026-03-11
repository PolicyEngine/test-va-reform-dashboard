'use client'

import { SliderInput, InputGroup } from '@policyengine/ui-kit'
import { formatPercent } from '@/lib/formatters'
import type { ReformParams } from '@/lib/api/types'

interface VirginiaEITCFormProps {
  reform: ReformParams
  onUpdate: <K extends keyof ReformParams>(key: K, value: ReformParams[K]) => void
}

export function VirginiaEITCForm({ reform, onUpdate }: VirginiaEITCFormProps) {
  return (
    <InputGroup label="Virginia EITC">
      <SliderInput
        label="VA EITC match rate"
        value={reform.va_eitc_match_rate}
        onChange={(v) => onUpdate('va_eitc_match_rate', v)}
        min={0}
        max={1}
        step={0.05}
        formatValue={formatPercent}
      />
    </InputGroup>
  )
}
