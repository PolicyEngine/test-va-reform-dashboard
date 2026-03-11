'use client'

import { useState } from 'react'
import { Providers } from './providers'
import { DependentAgesInput } from '@/components/DependentAgesInput'
import {
  DEFAULT_REFORM,
  FILING_STATUS_OPTIONS,
  type FilingStatus,
} from '@/lib/constants'
import type { ReformParams } from '@/lib/api/types'

// TODO: Import ui-kit components once installed:
// import { Header, SidebarLayout, InputPanel, ResultsPanel, Tabs, TabsList,
//   TabsTrigger, TabsContent, MetricCard, ChartContainer, logos } from '@policyengine/ui-kit'

function DashboardContent() {
  // Household configuration state
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single')
  const [headAge, setHeadAge] = useState(40)
  const [spouseAge, setSpouseAge] = useState(40)
  const [numDependents, setNumDependents] = useState(0)
  const [dependentAges, setDependentAges] = useState<number[]>([])
  const [income, setIncome] = useState(50000)

  // Reform state
  const [reform, setReform] = useState<ReformParams>({ ...DEFAULT_REFORM })

  // Active tab
  const [activeTab, setActiveTab] = useState<string>('household-impact')

  // Handle dependent count change
  const handleNumDependentsChange = (count: number) => {
    setNumDependents(count)
    setDependentAges((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill(5)]
      }
      return prev.slice(0, count)
    })
  }

  // Helper to update a single reform field
  const updateReform = <K extends keyof ReformParams>(
    key: K,
    value: ReformParams[K],
  ) => {
    setReform((prev) => ({ ...prev, [key]: value }))
  }

  // Helper to update a federal bracket rate
  const updateBracketRate = (index: number, value: number) => {
    setReform((prev) => {
      const rates = [...prev.federal_bracket_rates]
      rates[index] = value
      return { ...prev, federal_bracket_rates: rates }
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 items-center border-b border-border bg-gray-900 px-4">
        {/* TODO: Use Header component with logos.whiteWordmark */}
        <span className="text-sm font-semibold text-white">
          PolicyEngine
        </span>
        <span className="ml-3 text-sm text-gray-300">
          Virginia tax and benefit reform calculator
        </span>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 overflow-y-auto border-r border-border bg-background p-4 md:w-80">
          {/* Household configuration */}
          <details open className="mb-4">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              Household configuration
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Filing status
                </label>
                <select
                  value={filingStatus}
                  onChange={(e) =>
                    setFilingStatus(e.target.value as FilingStatus)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  {FILING_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Your age
                </label>
                <input
                  type="number"
                  min={18}
                  max={100}
                  value={headAge}
                  onChange={(e) => setHeadAge(Number(e.target.value))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>

              {filingStatus === 'joint' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Spouse&apos;s age
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={100}
                    value={spouseAge}
                    onChange={(e) => setSpouseAge(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Number of dependents
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={numDependents}
                  onChange={(e) =>
                    handleNumDependentsChange(Number(e.target.value))
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>

              <DependentAgesInput
                ages={dependentAges}
                onChange={setDependentAges}
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Annual employment income
                </label>
                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={1000}
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground">
                  ${income.toLocaleString()}
                </span>
              </div>
            </div>
          </details>

          {/* Federal income tax */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              Federal income tax
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              {[
                { label: '10% bracket rate', idx: 0, default_val: 0.1 },
                { label: '12% bracket rate', idx: 1, default_val: 0.12 },
                { label: '22% bracket rate', idx: 2, default_val: 0.22 },
                { label: '24% bracket rate', idx: 3, default_val: 0.24 },
                { label: '32% bracket rate', idx: 4, default_val: 0.32 },
                { label: '35% bracket rate', idx: 5, default_val: 0.35 },
                { label: '37% bracket rate', idx: 6, default_val: 0.37 },
              ].map(({ label, idx }) => (
                <div key={idx}>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    {label}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={0.5}
                    step={0.005}
                    value={reform.federal_bracket_rates[idx]}
                    onChange={(e) =>
                      updateBracketRate(idx, Number(e.target.value))
                    }
                    className="w-full"
                  />
                  <span className="text-sm text-muted-foreground">
                    {(reform.federal_bracket_rates[idx] * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </details>

          {/* Federal CTC */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              Federal Child Tax Credit
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  CTC amount per child
                </label>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  step={100}
                  value={reform.federal_ctc_amount}
                  onChange={(e) =>
                    updateReform('federal_ctc_amount', Number(e.target.value))
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Phase-out threshold (single)
                </label>
                <input
                  type="number"
                  min={0}
                  max={1000000}
                  step={5000}
                  value={reform.federal_ctc_phase_out_threshold_single}
                  onChange={(e) =>
                    updateReform(
                      'federal_ctc_phase_out_threshold_single',
                      Number(e.target.value),
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Phase-out threshold (joint)
                </label>
                <input
                  type="number"
                  min={0}
                  max={1000000}
                  step={5000}
                  value={reform.federal_ctc_phase_out_threshold_joint}
                  onChange={(e) =>
                    updateReform(
                      'federal_ctc_phase_out_threshold_joint',
                      Number(e.target.value),
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Max refundable (ACTC) per child
                </label>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  step={100}
                  value={reform.federal_ctc_refundable_max}
                  onChange={(e) =>
                    updateReform(
                      'federal_ctc_refundable_max',
                      Number(e.target.value),
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reform.federal_ctc_fully_refundable}
                  onChange={(e) =>
                    updateReform(
                      'federal_ctc_fully_refundable',
                      e.target.checked,
                    )
                  }
                  className="rounded border-border"
                />
                <label className="text-sm font-medium text-foreground">
                  Make fully refundable
                </label>
              </div>
            </div>
          </details>

          {/* Federal EITC */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              Federal EITC
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              {[
                { label: 'Max EITC (0 children)', key: 'federal_eitc_max_0' as const },
                { label: 'Max EITC (1 child)', key: 'federal_eitc_max_1' as const },
                { label: 'Max EITC (2 children)', key: 'federal_eitc_max_2' as const },
                { label: 'Max EITC (3+ children)', key: 'federal_eitc_max_3' as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    {label}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20000}
                    step={50}
                    value={reform[key]}
                    onChange={(e) =>
                      updateReform(key, Number(e.target.value))
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
              ))}
            </div>
          </details>

          {/* Virginia income tax */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              Virginia income tax
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              {[
                { label: 'Bracket 1 rate ($0-$3k)', key: 'va_rate_1' as const },
                { label: 'Bracket 2 rate ($3k-$5k)', key: 'va_rate_2' as const },
                { label: 'Bracket 3 rate ($5k-$17k)', key: 'va_rate_3' as const },
                { label: 'Bracket 4 rate ($17k+)', key: 'va_rate_4' as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    {label}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={0.1}
                    step={key === 'va_rate_4' ? 0.0025 : 0.005}
                    value={reform[key]}
                    onChange={(e) =>
                      updateReform(key, Number(e.target.value))
                    }
                    className="w-full"
                  />
                  <span className="text-sm text-muted-foreground">
                    {((reform[key] as number) * 100).toFixed(2)}%
                  </span>
                </div>
              ))}
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Standard deduction
                </label>
                <input
                  type="number"
                  min={0}
                  max={50000}
                  step={250}
                  value={
                    reform.va_standard_deduction ??
                    (filingStatus === 'joint' ? 17500 : 8750)
                  }
                  onChange={(e) =>
                    updateReform('va_standard_deduction', Number(e.target.value))
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>
          </details>

          {/* Virginia EITC */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              Virginia EITC
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  VA EITC match rate
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={reform.va_eitc_match_rate}
                  onChange={(e) =>
                    updateReform('va_eitc_match_rate', Number(e.target.value))
                  }
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground">
                  {(reform.va_eitc_match_rate * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </details>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Tabs */}
          <div className="mb-6 flex border-b border-border">
            <button
              onClick={() => setActiveTab('household-impact')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'household-impact'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Household impact
            </button>
            <button
              onClick={() => setActiveTab('statewide-impact')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'statewide-impact'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Statewide impact
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'household-impact' && (
            <div className="flex flex-col gap-6">
              {/* Summary metrics */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Your household impact
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {/* TODO: Replace with MetricCard components and real data */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Federal tax (baseline)
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      --
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Federal tax (reform)
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      --
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      VA tax (baseline)
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      --
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      VA tax (reform)
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      --
                    </span>
                  </div>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Net income change
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      --
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart placeholders */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  Net income by earnings level
                </h3>
                <p className="text-sm text-muted-foreground">
                  Compares household net income under baseline and reform across
                  earnings
                </p>
                {/* TODO: Implement line chart with ChartContainer/PELineChart */}
                <div className="mt-4 flex h-64 items-center justify-center rounded bg-muted text-sm text-muted-foreground md:h-96">
                  Chart placeholder
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  Federal income tax by earnings
                </h3>
                <div className="mt-4 flex h-52 items-center justify-center rounded bg-muted text-sm text-muted-foreground md:h-80">
                  Chart placeholder
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  Virginia income tax by earnings
                </h3>
                <div className="mt-4 flex h-52 items-center justify-center rounded bg-muted text-sm text-muted-foreground md:h-80">
                  Chart placeholder
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  Tax credits by earnings (CTC + EITC)
                </h3>
                <div className="mt-4 flex h-52 items-center justify-center rounded bg-muted text-sm text-muted-foreground md:h-80">
                  Chart placeholder
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  Marginal tax rate comparison
                </h3>
                <p className="text-sm text-muted-foreground">
                  Shows combined marginal tax rates under baseline and reform
                  across earnings
                </p>
                <div className="mt-4 flex h-64 items-center justify-center rounded bg-muted text-sm text-muted-foreground md:h-96">
                  Chart placeholder
                </div>
              </div>
            </div>
          )}

          {activeTab === 'statewide-impact' && (
            <div className="flex flex-col gap-6">
              {/* Statewide summary metrics */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Statewide impact summary
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Federal revenue change (VA)
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      --
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      State revenue change
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      --
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Winners
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      --
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Losers
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      --
                    </span>
                  </div>
                </div>
              </div>

              {/* Poverty metrics */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Poverty impact
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Overall poverty rate change
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      --
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Child poverty rate change
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      --
                    </span>
                  </div>
                </div>
              </div>

              {/* Decile chart placeholder */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  Average income change by decile
                </h3>
                <p className="text-sm text-muted-foreground">
                  Shows how the reform affects Virginia households across the
                  income distribution
                </p>
                {/* TODO: Implement bar chart with ChartContainer/PEBarChart */}
                <div className="mt-4 flex h-52 items-center justify-center rounded bg-muted text-sm text-muted-foreground md:h-80">
                  Chart placeholder
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Providers>
      <DashboardContent />
    </Providers>
  )
}
