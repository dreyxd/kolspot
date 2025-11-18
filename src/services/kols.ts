import type { Kol } from '../types'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function parseKOLsTxt(text: string): Kol[] {
  const lines = text.replace(/\r/g, '').split('\n')
  const blocks: string[][] = []
  let cur: string[] = []
  for (const l of lines) {
    const line = l.trim()
    if (!line) {
      if (cur.length) { blocks.push(cur); cur = [] }
      continue
    }
    cur.push(line)
  }
  if (cur.length) blocks.push(cur)

  const base58 = /[1-9A-HJ-NP-Za-km-z]{32,48}/
  const out: Kol[] = []
  const seen = new Set<string>()

  for (const b of blocks) {
    let name = ''
    let twitter = ''
    let wallet = ''
    for (const raw of b) {
      const line = raw.replace(/\s+/g, ' ').trim()
      const afterColon = (s: string) => {
        const idx = s.indexOf(':')
        return idx >= 0 ? s.slice(idx + 1).trim() : ''
      }
      if (/^name\s*:/i.test(line)) {
        const v = afterColon(line)
        if (v) name = v
      } else if (/^x account\s*:/i.test(line)) {
        const v = afterColon(line)
        if (v) twitter = v
      } else if (/^sol wallet address\s*:?/i.test(line) || /^sol wallet ad/i.test(line)) {
        const m = line.match(base58)
        if (m) wallet = m[0]
      } else {
        // fallback: if a line contains a wallet-looking string, pick it
        const m = line.match(base58)
        if (m && !wallet) wallet = m[0]
      }
    }
    if (!wallet) continue
    if (seen.has(wallet)) continue
    seen.add(wallet)
    const id = slugify(name || twitter || wallet)
    // If twitter looks like a wallet, drop it
    if (base58.test(twitter) && twitter === wallet) twitter = ''
    out.push({ id, name: name || twitter || wallet, wallet, avatarUrl: undefined })
  }
  return out
}

// Loads KOLs from /data/kols.json if present; otherwise tries /KOLs.txt
export async function loadKols(): Promise<Kol[]> {
  try {
    const mods = import.meta.glob('/data/kols.json', { eager: true, import: 'default' }) as any
    if (mods['/data/kols.json']) {
      const arr = mods['/data/kols.json'] as Kol[]
      return arr.map((k) => ({ 
        id: k.id, 
        name: k.name, 
        wallet: k.wallet, 
        avatarUrl: (k as any).avatarUrl,
        twitter: (k as any).twitter 
      }))
    }
  } catch {}

  try {
    const res = await fetch('/KOLs.txt')
    if (res.ok) {
      const text = await res.text()
      const parsed = parseKOLsTxt(text)
      return parsed
    }
  } catch {}

  return []
}

// Get a single KOL by ID
export async function getKolById(id: string): Promise<Kol | undefined> {
  const kols = await loadKols()
  return kols.find(k => k.id === id)
}
