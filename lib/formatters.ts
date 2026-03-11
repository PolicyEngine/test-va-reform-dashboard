/**
 * Formatting utilities for currency, percent, and compact number display.
 * Uses Intl.NumberFormat for correct negative sign placement (-$100 not $-100).
 */

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const currencyBillionsFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const percentFmt = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const percentPointsFmt = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
})

const compactFmt = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatCurrency(value: number): string {
  return currencyFmt.format(value)
}

export function formatCurrencySigned(value: number): string {
  if (value > 0) return `+${currencyFmt.format(value)}`
  return currencyFmt.format(value)
}

export function formatCurrencyBillions(value: number): string {
  return currencyBillionsFmt.format(value)
}

export function formatPercent(value: number): string {
  return percentFmt.format(value)
}

export function formatPercentagePoints(value: number): string {
  return `${percentPointsFmt.format(value)} pp`
}

export function formatCompact(value: number): string {
  return compactFmt.format(value)
}

/** Axis tick formatter for currency values */
export function tickCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return currencyBillionsFmt.format(value)
  }
  return currencyFmt.format(value)
}

/** Axis tick formatter for percent values (expects decimal like 0.22) */
export function tickPercent(value: number): string {
  return percentFmt.format(value)
}
