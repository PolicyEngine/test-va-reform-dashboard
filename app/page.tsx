'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  DashboardShell,
  Header,
  SidebarLayout,
  InputPanel,
  ResultsPanel,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  logos,
} from '@policyengine/ui-kit'
import { Providers } from './providers'
import {
  DEFAULT_REFORM,
  type FilingStatus,
} from '@/lib/constants'
import type {
  ReformParams,
  HouseholdImpactRequest,
  HouseholdImpactResponse,
  StatewideImpactRequest,
  StatewideImpactResponse,
} from '@/lib/api/types'
import { useAsyncCalculation } from '@/lib/hooks/useCalculation'
import { updateHash, getCountryFromHash } from '@/lib/embedding'

// Form components
import { HouseholdConfigForm } from '@/components/HouseholdConfigForm'
import { FederalTaxForm } from '@/components/FederalTaxForm'
import { FederalCTCForm } from '@/components/FederalCTCForm'
import { FederalEITCForm } from '@/components/FederalEITCForm'
import { VirginiaTaxForm } from '@/components/VirginiaTaxForm'
import { VirginiaEITCForm } from '@/components/VirginiaEITCForm'

// Display components
import { HouseholdMetrics } from '@/components/HouseholdMetrics'
import { HouseholdCharts } from '@/components/HouseholdCharts'
import {
  StatewideSummaryMetrics,
  PovertyMetrics,
} from '@/components/StatewideMetrics'
import { DecileBarChart } from '@/components/DecileBarChart'
import {
  LoadingState,
  ErrorState,
  ComputingState,
  EmptyState,
} from '@/components/StatusStates'

function DashboardContent() {
  // Country detection for embedding
  const [countryId] = useState(() => {
    if (typeof window !== 'undefined') return getCountryFromHash()
    return 'us'
  })

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
  const [activeTab, setActiveTab] = useState('household-impact')

  // Handle dependent count change
  const handleNumDependentsChange = useCallback(
    (count: number) => {
      setNumDependents(count)
      setDependentAges((prev) => {
        if (count > prev.length) {
          return [...prev, ...Array(count - prev.length).fill(5)]
        }
        return prev.slice(0, count)
      })
    },
    [],
  )

  // Helper to update a single reform field
  const updateReform = useCallback(
    <K extends keyof ReformParams>(key: K, value: ReformParams[K]) => {
      setReform((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  // Helper to update a federal bracket rate
  const updateBracketRate = useCallback((index: number, value: number) => {
    setReform((prev) => {
      const rates = [...prev.federal_bracket_rates]
      rates[index] = value
      return { ...prev, federal_bracket_rates: rates }
    })
  }, [])

  // Build API request params
  const householdParams: HouseholdImpactRequest = useMemo(
    () => ({
      filing_status: filingStatus,
      head_age: headAge,
      spouse_age: filingStatus === 'joint' ? spouseAge : undefined,
      dependent_ages: dependentAges,
      income,
      reform,
    }),
    [filingStatus, headAge, spouseAge, dependentAges, income, reform],
  )

  const statewideParams: StatewideImpactRequest = useMemo(
    () => ({ reform }),
    [reform],
  )

  // API hooks
  const household = useAsyncCalculation<HouseholdImpactResponse>(
    'household-impact',
    'household-impact',
    householdParams,
  )

  const statewide = useAsyncCalculation<StatewideImpactResponse>(
    'statewide-impact',
    'statewide-impact',
    statewideParams,
    { enabled: activeTab === 'statewide-impact' },
  )

  // Hash sync
  useEffect(() => {
    if (typeof window === 'undefined') return
    updateHash(
      {
        income: String(income),
        filing_status: filingStatus,
      },
      countryId,
    )
  }, [income, filingStatus, countryId])

  return (
    <DashboardShell>
      <Header
        variant="dark"
        logo={
          <img
            src={logos.whiteWordmark}
            alt="PolicyEngine"
            className="h-5"
          />
        }
        navLinks={[
          {
            slug: 'research',
            text: 'Research',
            href: 'https://policyengine.org/us/research',
          },
        ]}
      >
        <span className="ml-2 text-sm text-gray-300">
          Virginia tax and benefit reform calculator
        </span>
      </Header>

      <SidebarLayout
        sidebar={
          <InputPanel title="Settings">
            <div className="flex flex-col gap-4">
              <HouseholdConfigForm
                filingStatus={filingStatus}
                onFilingStatusChange={setFilingStatus}
                headAge={headAge}
                onHeadAgeChange={setHeadAge}
                spouseAge={spouseAge}
                onSpouseAgeChange={setSpouseAge}
                numDependents={numDependents}
                onNumDependentsChange={handleNumDependentsChange}
                dependentAges={dependentAges}
                onDependentAgesChange={setDependentAges}
                income={income}
                onIncomeChange={setIncome}
              />
              <FederalTaxForm
                rates={reform.federal_bracket_rates}
                onRateChange={updateBracketRate}
              />
              <FederalCTCForm reform={reform} onUpdate={updateReform} />
              <FederalEITCForm reform={reform} onUpdate={updateReform} />
              <VirginiaTaxForm
                reform={reform}
                filingStatus={filingStatus}
                onUpdate={updateReform}
              />
              <VirginiaEITCForm reform={reform} onUpdate={updateReform} />
            </div>
          </InputPanel>
        }
      >
        <ResultsPanel>
          <Tabs
            defaultValue="household-impact"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="household-impact">
                Household impact
              </TabsTrigger>
              <TabsTrigger value="statewide-impact">
                Statewide impact
              </TabsTrigger>
            </TabsList>

            <TabsContent value="household-impact">
              <div className="flex flex-col gap-6 pt-4">
                {household.isError ? (
                  <ErrorState
                    message={household.error ?? 'Failed to compute household impact.'}
                    onRetry={household.retry}
                  />
                ) : household.isLoading ? (
                  <LoadingState />
                ) : household.isComputing ? (
                  <LoadingState message="Computing household impact..." />
                ) : household.data ? (
                  <>
                    <HouseholdMetrics summary={household.data.summary} />
                    <HouseholdCharts
                      data={household.data}
                      income={income}
                    />
                  </>
                ) : (
                  <EmptyState message="Enter your household details to see results." />
                )}
              </div>
            </TabsContent>

            <TabsContent value="statewide-impact">
              <div className="flex flex-col gap-6 pt-4">
                {statewide.isError ? (
                  <ErrorState
                    message={statewide.error ?? 'Failed to compute statewide impact.'}
                    onRetry={statewide.retry}
                  />
                ) : statewide.isLoading ? (
                  <LoadingState />
                ) : statewide.isComputing ? (
                  <ComputingState />
                ) : statewide.data ? (
                  <>
                    <StatewideSummaryMetrics data={statewide.data} />
                    <PovertyMetrics data={statewide.data} />
                    <DecileBarChart
                      data={statewide.data.decile_impacts}
                    />
                  </>
                ) : (
                  <EmptyState message="Switch to this tab to run the statewide microsimulation." />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </ResultsPanel>
      </SidebarLayout>
    </DashboardShell>
  )
}

export default function Home() {
  return (
    <Providers>
      <DashboardContent />
    </Providers>
  )
}
