'use client'

import {
  CurrencyInput,
  CheckboxInput,
  InputGroup,
} from '@policyengine/ui-kit'
import type { ReformParams } from '@/lib/api/types'

interface FederalCTCFormProps {
  reform: ReformParams
  onUpdate: <K extends keyof ReformParams>(key: K, value: ReformParams[K]) => void
}

export function FederalCTCForm({ reform, onUpdate }: FederalCTCFormProps) {
  return (
    <InputGroup label="Federal Child Tax Credit">
      <CurrencyInput
        label="CTC amount per child"
        value={reform.federal_ctc_amount}
        onChange={(v) => onUpdate('federal_ctc_amount', v)}
        min={0}
        max={10000}
        step={100}
      />
      <CurrencyInput
        label="Phase-out threshold (single)"
        value={reform.federal_ctc_phase_out_threshold_single}
        onChange={(v) => onUpdate('federal_ctc_phase_out_threshold_single', v)}
        min={0}
        max={1000000}
        step={5000}
      />
      <CurrencyInput
        label="Phase-out threshold (joint)"
        value={reform.federal_ctc_phase_out_threshold_joint}
        onChange={(v) => onUpdate('federal_ctc_phase_out_threshold_joint', v)}
        min={0}
        max={1000000}
        step={5000}
      />
      <CurrencyInput
        label="Max refundable (ACTC) per child"
        value={reform.federal_ctc_refundable_max}
        onChange={(v) => onUpdate('federal_ctc_refundable_max', v)}
        min={0}
        max={10000}
        step={100}
      />
      <CheckboxInput
        label="Make fully refundable"
        checked={reform.federal_ctc_fully_refundable}
        onChange={(v) => onUpdate('federal_ctc_fully_refundable', v)}
      />
    </InputGroup>
  )
}
