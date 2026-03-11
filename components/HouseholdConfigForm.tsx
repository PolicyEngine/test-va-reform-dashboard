'use client'

import {
  SelectInput,
  NumberInput,
  SliderInput,
  InputGroup,
} from '@policyengine/ui-kit'
import { FILING_STATUS_OPTIONS, type FilingStatus } from '@/lib/constants'
import { DependentAgesInput } from './DependentAgesInput'
import { formatCurrency } from '@/lib/formatters'

interface HouseholdConfigFormProps {
  filingStatus: FilingStatus
  onFilingStatusChange: (value: FilingStatus) => void
  headAge: number
  onHeadAgeChange: (value: number) => void
  spouseAge: number
  onSpouseAgeChange: (value: number) => void
  numDependents: number
  onNumDependentsChange: (value: number) => void
  dependentAges: number[]
  onDependentAgesChange: (ages: number[]) => void
  income: number
  onIncomeChange: (value: number) => void
}

export function HouseholdConfigForm({
  filingStatus,
  onFilingStatusChange,
  headAge,
  onHeadAgeChange,
  spouseAge,
  onSpouseAgeChange,
  numDependents,
  onNumDependentsChange,
  dependentAges,
  onDependentAgesChange,
  income,
  onIncomeChange,
}: HouseholdConfigFormProps) {
  return (
    <InputGroup label="Household configuration">
      <SelectInput
        label="Filing status"
        options={FILING_STATUS_OPTIONS.map((o) => ({
          label: o.label,
          value: o.value,
        }))}
        value={filingStatus}
        onChange={(v) => onFilingStatusChange(v as FilingStatus)}
      />
      <NumberInput
        label="Your age"
        value={headAge}
        onChange={onHeadAgeChange}
        min={18}
        max={100}
      />
      {filingStatus === 'joint' && (
        <NumberInput
          label="Spouse's age"
          value={spouseAge}
          onChange={onSpouseAgeChange}
          min={18}
          max={100}
        />
      )}
      <NumberInput
        label="Number of dependents"
        value={numDependents}
        onChange={onNumDependentsChange}
        min={0}
        max={10}
      />
      <DependentAgesInput
        ages={dependentAges}
        onChange={onDependentAgesChange}
      />
      <SliderInput
        label="Annual employment income"
        value={income}
        onChange={onIncomeChange}
        min={0}
        max={500000}
        step={1000}
        formatValue={formatCurrency}
      />
    </InputGroup>
  )
}
