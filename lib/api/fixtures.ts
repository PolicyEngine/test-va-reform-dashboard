import type {
  HouseholdImpactResponse,
  StatewideImpactResponse,
} from './types'

// Generate a simple earnings axis from $0 to $500k
const earningsAxis = Array.from({ length: 101 }, (_, i) => i * 5000)

// Mock household impact data (baseline = reform when using default params)
export const householdImpactFixture: HouseholdImpactResponse = {
  earnings_axis: earningsAxis,
  baseline_net_income: earningsAxis.map((e) => e * 0.75 + 2000),
  reform_net_income: earningsAxis.map((e) => e * 0.75 + 2000),
  baseline_federal_tax: earningsAxis.map((e) => Math.max(0, e * 0.15 - 1000)),
  reform_federal_tax: earningsAxis.map((e) => Math.max(0, e * 0.15 - 1000)),
  baseline_state_tax: earningsAxis.map((e) => Math.max(0, e * 0.05 - 300)),
  reform_state_tax: earningsAxis.map((e) => Math.max(0, e * 0.05 - 300)),
  baseline_eitc: earningsAxis.map((e) =>
    e < 20000 ? e * 0.15 : Math.max(0, 3000 - (e - 20000) * 0.1),
  ),
  reform_eitc: earningsAxis.map((e) =>
    e < 20000 ? e * 0.15 : Math.max(0, 3000 - (e - 20000) * 0.1),
  ),
  baseline_ctc: earningsAxis.map((e) =>
    e > 2500 && e < 200000 ? 2200 : 0,
  ),
  reform_ctc: earningsAxis.map((e) =>
    e > 2500 && e < 200000 ? 2200 : 0,
  ),
  baseline_mtr: earningsAxis.map((e) => {
    if (e < 12400) return 0.0
    if (e < 50400) return 0.12
    if (e < 105700) return 0.22
    if (e < 201775) return 0.24
    return 0.32
  }),
  reform_mtr: earningsAxis.map((e) => {
    if (e < 12400) return 0.0
    if (e < 50400) return 0.12
    if (e < 105700) return 0.22
    if (e < 201775) return 0.24
    return 0.32
  }),
  summary: {
    baseline_federal_tax: 4340,
    reform_federal_tax: 4340,
    baseline_state_tax: 2363,
    reform_state_tax: 2363,
    baseline_ctc: 0,
    reform_ctc: 0,
    baseline_eitc: 0,
    reform_eitc: 0,
    baseline_net_income: 43297,
    reform_net_income: 43297,
    net_change: 0,
  },
}

export const statewideImpactFixture: StatewideImpactResponse = {
  federal_revenue_change: 0,
  state_revenue_change: 0,
  total_cost: 0,
  winners: 0,
  losers: 0,
  unchanged: 3500000,
  poverty_rate_change: 0,
  child_poverty_rate_change: 0,
  decile_impacts: Array.from({ length: 10 }, (_, i) => ({
    decile: i + 1,
    avg_income_change: 0,
    pct_change: 0,
  })),
}
