import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home page', () => {
  it('renders the dashboard title', () => {
    render(<Home />)
    expect(
      screen.getByText('Virginia tax and benefit reform calculator'),
    ).toBeDefined()
  })

  it('renders household configuration section', () => {
    render(<Home />)
    expect(screen.getByText('Household configuration')).toBeDefined()
  })

  it('renders both tab options', () => {
    render(<Home />)
    expect(screen.getByText('Household impact')).toBeDefined()
    expect(screen.getByText('Statewide impact')).toBeDefined()
  })

  it('renders reform parameter sections', () => {
    render(<Home />)
    expect(screen.getByText('Federal income tax')).toBeDefined()
    expect(screen.getByText('Federal Child Tax Credit')).toBeDefined()
    expect(screen.getByText('Federal EITC')).toBeDefined()
    expect(screen.getByText('Virginia income tax')).toBeDefined()
    expect(screen.getByText('Virginia EITC')).toBeDefined()
  })
})
