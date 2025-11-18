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
