// Reform parameters shared by both endpoints
export interface ReformParams {
  // Federal income tax bracket rates (7 brackets)
  federal_bracket_rates: number[]
  // Federal CTC
  federal_ctc_amount: number
  federal_ctc_phase_out_threshold_single: number
  federal_ctc_phase_out_threshold_joint: number
  federal_ctc_refundable_max: number
  federal_ctc_fully_refundable: boolean
  // Federal EITC max amounts by number of children
  federal_eitc_max_0: number
  federal_eitc_max_1: number
  federal_eitc_max_2: number
  federal_eitc_max_3: number
  // Virginia income tax rates (4 brackets)
  va_rate_1: number
  va_rate_2: number
  va_rate_3: number
  va_rate_4: number
  va_standard_deduction: number | null
  // Virginia EITC
  va_eitc_match_rate: number
}

// Household impact endpoint
export interface HouseholdImpactRequest {
  filing_status: 'single' | 'joint' | 'head_of_household'
  head_age: number
  spouse_age?: number
  dependent_ages: number[]
  income: number
  reform: ReformParams
}

export interface HouseholdSummary {
  baseline_federal_tax: number
  reform_federal_tax: number
  baseline_state_tax: number
  reform_state_tax: number
  baseline_ctc: number
  reform_ctc: number
  baseline_eitc: number
  reform_eitc: number
  baseline_net_income: number
  reform_net_income: number
  net_change: number
}

export interface HouseholdImpactResponse {
  earnings_axis: number[]
  baseline_net_income: number[]
  reform_net_income: number[]
  baseline_federal_tax: number[]
  reform_federal_tax: number[]
  baseline_state_tax: number[]
  reform_state_tax: number[]
  baseline_eitc: number[]
  reform_eitc: number[]
  baseline_ctc: number[]
  reform_ctc: number[]
  baseline_mtr: number[]
  reform_mtr: number[]
  summary: HouseholdSummary
}

// Statewide impact endpoint
export interface StatewideImpactRequest {
  reform: ReformParams
}

export interface DecileImpact {
  decile: number
  avg_income_change: number
  pct_change: number
}

export interface StatewideImpactResponse {
  federal_revenue_change: number
  state_revenue_change: number
  total_cost: number
  winners: number
  losers: number
  unchanged: number
  poverty_rate_change: number
  child_poverty_rate_change: number
  decile_impacts: DecileImpact[]
}
