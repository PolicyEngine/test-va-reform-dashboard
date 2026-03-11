import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatCurrencySigned,
  formatPercent,
  formatPercentagePoints,
  formatCompact,
  tickCurrency,
  tickPercent,
} from '../lib/formatters'

describe('formatCurrency', () => {
  it('formats positive amounts', () => {
    expect(formatCurrency(50000)).toBe('$50,000')
  })

  it('formats negative amounts with sign before dollar sign', () => {
    // Intl.NumberFormat produces "-$100" not "$-100"
    const result = formatCurrency(-100)
    expect(result).toMatch(/^-\$100$/)
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })
})

describe('formatCurrencySigned', () => {
  it('adds + sign for positive values', () => {
    expect(formatCurrencySigned(2500)).toBe('+$2,500')
  })

  it('keeps - sign for negative values', () => {
    expect(formatCurrencySigned(-1000)).toMatch(/^-\$1,000$/)
  })

  it('formats zero without sign', () => {
    expect(formatCurrencySigned(0)).toBe('$0')
  })
})

describe('formatPercent', () => {
  it('formats decimal as percent', () => {
    expect(formatPercent(0.22)).toBe('22.0%')
  })

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.0%')
  })
})

describe('formatPercentagePoints', () => {
  it('formats positive change', () => {
    expect(formatPercentagePoints(0.5)).toBe('+0.50 pp')
  })

  it('formats negative change', () => {
    expect(formatPercentagePoints(-1.2)).toBe('-1.20 pp')
  })
})

describe('formatCompact', () => {
  it('formats millions', () => {
    const result = formatCompact(3500000)
    expect(result).toMatch(/3\.5M/)
  })

  it('formats thousands', () => {
    const result = formatCompact(15000)
    expect(result).toMatch(/15K/)
  })
})

describe('tickCurrency', () => {
  it('formats small values', () => {
    expect(tickCurrency(5000)).toBe('$5,000')
  })

  it('uses compact format for millions', () => {
    const result = tickCurrency(2000000)
    expect(result).toMatch(/\$2(\.0)?M/)
  })
})

describe('tickPercent', () => {
  it('formats decimal as percent', () => {
    expect(tickPercent(0.32)).toBe('32.0%')
  })
})
