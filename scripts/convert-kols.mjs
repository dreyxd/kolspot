#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const txtPath = path.join(root, 'KOLs.txt')
const outDir = path.join(root, 'data')
const outPath = path.join(outDir, 'kols.json')

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parse(text) {
  const lines = text.replace(/\r/g, '').split('\n')
  const blocks = []
  let cur = []
  for (const l of lines) {
    const line = l.trim()
    if (!line) {
      if (cur.length) { blocks.push(cur); cur = [] }
      continue
    }
    cur.push(line)
  }
  if (cur.length) blocks.push(cur)

  const base58 = /[1-9A-HJ-NP-Za-km-z]{32,64}/
  const out = []
  const seen = new Set()

  for (const b of blocks) {
    let name = ''
    let twitter = ''
    let wallet = ''
    for (const raw of b) {
      const line = raw.replace(/\s+/g, ' ').trim()
      const afterColon = (s) => {
        const idx = s.indexOf(':')
        return idx >= 0 ? s.slice(idx + 1).trim() : ''
      }
      if (/^name\s*:/i.test(line)) {
        const v = afterColon(line)
        if (v) name = v
      } else if (/^x account\s*:/i.test(line)) {
        const v = afterColon(line)
        if (v) twitter = v
      }
      const m = line.match(base58)
      if (m && !wallet) wallet = m[0]
    }
    if (!wallet) continue
    if (seen.has(wallet)) continue
    seen.add(wallet)
    // Clean twitter: if it looks like a wallet, drop it; if it's a bare handle, keep as-is
    if (base58.test(twitter) && twitter === wallet) twitter = ''
    const id = slugify(name || twitter || wallet)
    out.push({ id, name: name || twitter || wallet, wallet, twitter, avatarUrl: undefined })
  }
  return out
}

if (!fs.existsSync(txtPath)) {
  console.error('KOLs.txt not found at project root')
  process.exit(1)
}

const text = fs.readFileSync(txtPath, 'utf8')
const parsed = parse(text)
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2))
console.log(`Wrote ${parsed.length} KOLs to data/kols.json`)