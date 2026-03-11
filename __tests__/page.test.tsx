import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../app/page'

// Mock the embedding module since tests run in jsdom without real window.location.hash
vi.mock('../lib/embedding', () => ({
  getCountryFromHash: () => 'us',
  isEmbedded: () => false,
  updateHash: vi.fn(),
  getShareUrl: () => 'https://policyengine.org/us/va-reform-dashboard',
}))

// Mock the API client to prevent actual network calls
vi.mock('../lib/api/client', () => ({
  submitJob: vi.fn().mockRejectedValue(new Error('No API in tests')),
  pollStatus: vi.fn().mockRejectedValue(new Error('No API in tests')),
}))

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dashboard title', () => {
    render(<Home />)
    expect(
      screen.getByText('Virginia tax and benefit reform calculator'),
    ).toBeDefined()
  })

  it('renders both tab options', () => {
    render(<Home />)
    expect(screen.getByText('Household impact')).toBeDefined()
    expect(screen.getByText('Statewide impact')).toBeDefined()
  })

  it('renders all sidebar input group labels', () => {
    render(<Home />)
    expect(screen.getByText('Household configuration')).toBeDefined()
    expect(screen.getByText('Federal income tax')).toBeDefined()
    expect(screen.getByText('Federal Child Tax Credit')).toBeDefined()
    expect(screen.getByText('Federal EITC')).toBeDefined()
    expect(screen.getByText('Virginia income tax')).toBeDefined()
    expect(screen.getByText('Virginia EITC')).toBeDefined()
  })

  it('renders filing status label and options', () => {
    render(<Home />)
    expect(screen.getByText('Filing status')).toBeDefined()
    // The select should have the three options available
    expect(screen.getByText('Single')).toBeDefined()
  })

  it('shows spouse age field only when filing status is joint', () => {
    render(<Home />)
    // Initially single - no spouse field
    expect(screen.queryByText("Spouse's age")).toBeNull()

    // Change to joint by finding and changing the select
    const selects = document.querySelectorAll('select')
    const filingStatusSelect = Array.from(selects).find((s) =>
      Array.from(s.options).some((o) => o.value === 'joint'),
    )
    expect(filingStatusSelect).toBeDefined()
    fireEvent.change(filingStatusSelect!, { target: { value: 'joint' } })
    expect(screen.getByText("Spouse's age")).toBeDefined()
  })

  it('renders dependent age inputs based on count', () => {
    render(<Home />)
    // No dependent age fields initially
    expect(screen.queryByText('Dependent 1')).toBeNull()

    // Find the number of dependents input
    const numDepsInput = document.querySelector(
      'input[type="number"][min="0"][max="10"]',
    ) as HTMLInputElement
    expect(numDepsInput).toBeDefined()

    // Set to 2 dependents
    fireEvent.change(numDepsInput, { target: { value: '2' } })
    expect(screen.getByText('Dependent 1')).toBeDefined()
    expect(screen.getByText('Dependent 2')).toBeDefined()
  })

  it('renders all federal bracket rate sliders', () => {
    render(<Home />)
    expect(screen.getByText('10% bracket rate')).toBeDefined()
    expect(screen.getByText('12% bracket rate')).toBeDefined()
    expect(screen.getByText('22% bracket rate')).toBeDefined()
    expect(screen.getByText('24% bracket rate')).toBeDefined()
    expect(screen.getByText('32% bracket rate')).toBeDefined()
    expect(screen.getByText('35% bracket rate')).toBeDefined()
    expect(screen.getByText('37% bracket rate')).toBeDefined()
  })

  it('renders CTC input fields', () => {
    render(<Home />)
    expect(screen.getByText('CTC amount per child')).toBeDefined()
    expect(screen.getByText('Phase-out threshold (single)')).toBeDefined()
    expect(screen.getByText('Phase-out threshold (joint)')).toBeDefined()
    expect(screen.getByText('Max refundable (ACTC) per child')).toBeDefined()
    expect(screen.getByText('Make fully refundable')).toBeDefined()
  })

  it('renders EITC fields for all child counts', () => {
    render(<Home />)
    expect(screen.getByText('Max EITC (0 children)')).toBeDefined()
    expect(screen.getByText('Max EITC (1 child)')).toBeDefined()
    expect(screen.getByText('Max EITC (2 children)')).toBeDefined()
    expect(screen.getByText('Max EITC (3+ children)')).toBeDefined()
  })

  it('renders VA tax rate sliders', () => {
    render(<Home />)
    expect(screen.getByText('Bracket 1 rate ($0-$3k)')).toBeDefined()
    expect(screen.getByText('Bracket 2 rate ($3k-$5k)')).toBeDefined()
    expect(screen.getByText('Bracket 3 rate ($5k-$17k)')).toBeDefined()
    expect(screen.getByText('Bracket 4 rate ($17k+)')).toBeDefined()
  })

  it('renders VA EITC match rate slider', () => {
    render(<Home />)
    expect(screen.getByText('VA EITC match rate')).toBeDefined()
  })

  it('renders VA standard deduction field', () => {
    render(<Home />)
    expect(screen.getByText('Standard deduction')).toBeDefined()
  })

  it('renders PolicyEngine logo in header', () => {
    render(<Home />)
    expect(screen.getByAltText('PolicyEngine')).toBeDefined()
  })
})
