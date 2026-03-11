'use client'

import { CurrencyInput, InputGroup } from '@policyengine/ui-kit'
import type { ReformParams } from '@/lib/api/types'

interface FederalEITCFormProps {
  reform: ReformParams
  onUpdate: <K extends keyof ReformParams>(key: K, value: ReformParams[K]) => void
}

const EITC_FIELDS = [
  { key: 'federal_eitc_max_0' as const, label: 'Max EITC (0 children)' },
  { key: 'federal_eitc_max_1' as const, label: 'Max EITC (1 child)' },
  { key: 'federal_eitc_max_2' as const, label: 'Max EITC (2 children)' },
  { key: 'federal_eitc_max_3' as const, label: 'Max EITC (3+ children)' },
]

export function FederalEITCForm({ reform, onUpdate }: FederalEITCFormProps) {
  return (
    <InputGroup label="Federal EITC">
      {EITC_FIELDS.map(({ key, label }) => (
        <CurrencyInput
          key={key}
          label={label}
          value={reform[key] as number}
          onChange={(v) => onUpdate(key, v)}
          min={0}
          max={20000}
          step={50}
        />
      ))}
    </InputGroup>
  )
}
