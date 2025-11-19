export function formatNumber(n: number, digits = 0) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
  }).format(n)
}

export function formatCurrency(n: number) {
  const sign = n < 0 ? '-' : ''
  return `${sign}$${formatNumber(Math.abs(n), 2)}`
}

export function shortAddress(addr: string, head = 4, tail = 4) {
  if (!addr) return ''
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`
}

export function formatDate(ts: number) {
  return new Date(ts).toLocaleString()
}

// Formats very small USD prices without scientific notation.
// Examples: 1.2345 -> $1.2345, 0.012345 -> $0.0123, 0.0000056 -> $0.0000056
export function formatUsdPrice(p?: number) {
  if (p === undefined || p === null || !isFinite(p) || p <= 0) return 'Unknown'
  if (p >= 1) return `$${p.toFixed(4)}`
  // For small prices, show up to 9 decimals, ensuring visibility of significant digits
  const str = p.toLocaleString(undefined, {
    minimumFractionDigits: 6,
    maximumFractionDigits: 9,
    useGrouping: false,
  })
  // Trim trailing zeros but keep non-empty decimals
  const trimmed = str.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '')
  return `$${trimmed}`
}
