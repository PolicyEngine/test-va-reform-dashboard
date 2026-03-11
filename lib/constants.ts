import type { ReformParams } from './api/types'

export const DEFAULT_REFORM: ReformParams = {
  federal_bracket_rates: [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37],
  federal_ctc_amount: 2200,
  federal_ctc_phase_out_threshold_single: 200000,
  federal_ctc_phase_out_threshold_joint: 400000,
  federal_ctc_refundable_max: 1700,
  federal_ctc_fully_refundable: false,
  federal_eitc_max_0: 664,
  federal_eitc_max_1: 4427,
  federal_eitc_max_2: 7316,
  federal_eitc_max_3: 8231,
  va_rate_1: 0.02,
  va_rate_2: 0.03,
  va_rate_3: 0.05,
  va_rate_4: 0.0575,
  va_standard_deduction: null,
  va_eitc_match_rate: 0.20,
}

export const FILING_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'joint', label: 'Married filing jointly' },
  { value: 'head_of_household', label: 'Head of household' },
] as const

export type FilingStatus = 'single' | 'joint' | 'head_of_household'
