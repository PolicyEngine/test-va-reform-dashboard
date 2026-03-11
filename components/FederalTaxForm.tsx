'use client'

import { SliderInput, InputGroup } from '@policyengine/ui-kit'
import { formatPercent } from '@/lib/formatters'

interface FederalTaxFormProps {
  rates: number[]
  onRateChange: (index: number, value: number) => void
}

const BRACKET_LABELS = [
  { label: '10% bracket rate', description: 'Current law: 10%' },
  { label: '12% bracket rate', description: 'Current law: 12%' },
  { label: '22% bracket rate', description: 'Current law: 22%' },
  { label: '24% bracket rate', description: 'Current law: 24%' },
  { label: '32% bracket rate', description: 'Current law: 32%' },
  { label: '35% bracket rate', description: 'Current law: 35%' },
  { label: '37% bracket rate', description: 'Current law: 37%' },
]

export function FederalTaxForm({ rates, onRateChange }: FederalTaxFormProps) {
  return (
    <InputGroup label="Federal income tax">
      {BRACKET_LABELS.map((bracket, idx) => (
        <SliderInput
          key={idx}
          label={bracket.label}
          value={rates[idx]}
          onChange={(v) => onRateChange(idx, v)}
          min={0}
          max={0.5}
          step={0.005}
          formatValue={formatPercent}
        />
      ))}
    </InputGroup>
  )
}
