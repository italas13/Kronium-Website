import React, { useState, useMemo, useEffect } from 'react'
import { usePageTransition } from '../hooks/usePageTransition'

// ── Pattern parser ─────────────────────────────────────────────────────────────
// Parses the raw text format from cs2-sdk.com into structured objects.
// Format:
//   [ module.dll ]  (N)
//   FuncName    AA BB CC ...
function parsePatternText(text) {
  const results = []
  let currentModule = null

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('CS2 Byte Patterns') || line.startsWith('===')) continue

    // Module header: [ client.dll ]  (322)
    const modMatch = line.match(/^\[\s*(.+?)\s*\]/)
    if (modMatch) {
      currentModule = modMatch[1].trim()
      continue
    }

    if (!currentModule) continue

    // Pattern line: two or more whitespace-separated tokens where the last part
    // looks like hex bytes (contains hex digits and ? wildcards)
    // Split on 2+ spaces to separate name from pattern
    const parts = line.split(/\s{2,}/)
    if (parts.length >= 2) {
      const name = parts[0].trim()
      const pattern = parts[parts.length - 1].trim()
      // Validate: pattern should only contain hex bytes and wildcards
      if (name && pattern && /^[0-9A-Fa-f? ]+$/.test(pattern.replace(/\s+/g, ' '))) {
        results.push({ module: currentModule, name, pattern })
      }
    }
  }

  return results
}

// ── Data source ────────────────────────────────────────────────────────────────
// We fetch directly from cs2-sdk.com's CDN. This gives us all 503 patterns
// without hardcoding them and keeps the page auto-updated.
const PATTERNS_URL = 'https://www.cs2-sdk.com/api/export/patterns.txt'

// Self-hosted copy (put patterns.txt in /public — gets served at /patterns.txt)
// This is used first and avoids all CORS issues.
const SELF_HOSTED_URL = '/patterns.txt'

// Fallback: a minimal hardcoded set shown if the fetch fails
const FALLBACK_PATTERNS = [
  { module: 'animationsystem.dll', name: 'FrameUpdate', pattern: '48 89 4C 24 08 55 53 56 57 41 54 41 55 41 56 41 57 48 8D AC 24 C8 EB FF FF B8 38 15 00 00' },
  { module: 'animationsystem.dll', name: 'PAnimationSystemUtils', pattern: '48 8D 05 ? ? ? ? C3 CC CC CC CC CC CC CC CC 48 83 EC 28 48 8B CA 48 8D 15' },
  { module: 'animationsystem.dll', name: 'ShouldUpdateSequences', pattern: '48 89 5C 24 ? 48 89 74 24 ? 57 48 83 EC 20 49 8B 40 48' },
  { module: 'client.dll', name: 'CreateMove', pattern: '48 8B C4 4C 89 40 18 48 89 48 08 55 53 41 54 41 55' },
  { module: 'client.dll', name: 'FrameStageNotify', pattern: '48 89 5C 24 ? 48 89 6C 24 ? 57 48 83 EC ? 48 8B F9 33 ED' },
  { module: 'client.dll', name: 'GetViewAngles', pattern: '4C 8B C1 85 D2 74 08 48 8D 05 ? ? ? ? C3' },
  { module: 'client.dll', name: 'SetViewAngle', pattern: '85 D2 75 3D 48 63 81 ? ? ? ?' },
  { module: 'client.dll', name: 'GetLocalPlayerController', pattern: 'E8 ? ? ? ? 48 8B E8 48 85 C0 74 ? 33 DB 39 1D' },
  { module: 'engine2.dll', name: 'Engine_IsConnected', pattern: '48 8B 05 ? ? ? ? 48 85 C0 74 ? 83 B8 ? ? ? ? ? 0F 9D C0' },
  { module: 'engine2.dll', name: 'PBuildNumber', pattern: '89 05 ? ? ? ? 48 8D 0D ? ? ? ? FF 15 ? ? ? ? 48 8B 0D' },
]

function usePatterns() {
  const [patterns, setPatterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('live')

  useEffect(() => {
    let cancelled = false

    // Try proxies in order until one works
    const PROXIES = [
      url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      url => `https://thingproxy.freeboard.io/fetch/${url}`,
    ]

    async function tryFetch(url) {
      for (const makeProxy of PROXIES) {
        try {
          const res = await fetch(makeProxy(url), { cache: 'no-cache' })
          if (!res.ok) continue
          const text = await res.text()
          const parsed = parsePatternText(text)
          if (parsed.length > 10) return parsed
        } catch {
          // try next proxy
        }
      }
      return null
    }

    async function load() {
      // 1. Try self-hosted file first (no CORS, always fast)
      try {
        const res = await fetch(SELF_HOSTED_URL, { cache: 'no-cache' })
        if (res.ok) {
          const text = await res.text()
          const parsed = parsePatternText(text)
          if (!cancelled && parsed.length > 10) {
            setPatterns(parsed)
            setSource('live')
            setLoading(false)
            return
          }
        }
      } catch { /* fall through to proxies */ }

      // 2. Fall back to proxied external fetch
      const parsed = await tryFetch(PATTERNS_URL)
      if (cancelled) return
      if (parsed) {
        setPatterns(parsed)
        setSource('live')
      } else {
        setPatterns(FALLBACK_PATTERNS)
        setSource('fallback')
        setError('Could not load patterns — place patterns.txt in the /public folder for offline support')
      }
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { patterns, loading, error, source }
}

// ── UI components ──────────────────────────────────────────────────────────────

function PatternRow({ entry }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.pattern)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr auto',
        gap: '12px',
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid oklch(0.22 0.025 265 / 40%)',
        transition: 'background 0.12s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.20 0.025 265 / 35%)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 600,
        fontSize: '12.5px',
        color: 'var(--color-text)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {entry.name}
      </div>

      <div style={{
        fontFamily: 'monospace',
        fontSize: '11px',
        color: 'var(--color-text-muted)',
        letterSpacing: '0.03em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {entry.pattern}
      </div>

      <button
        onClick={handleCopy}
        style={{
          background: copied ? 'oklch(0.72 0.16 145 / 15%)' : 'oklch(0.22 0.025 265 / 60%)',
          border: `1px solid ${copied ? 'oklch(0.72 0.16 145 / 40%)' : 'var(--color-border)'}`,
          borderRadius: '6px',
          color: copied ? 'oklch(0.78 0.16 145)' : 'var(--color-text-muted)',
          cursor: 'pointer',
          fontSize: '11px',
          fontFamily: 'var(--font-heading)',
          fontWeight: 500,
          padding: '4px 11px',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
      >
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  )
}

function ModuleSection({ module, entries, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const [copiedAll, setCopiedAll] = useState(false)

  const handleCopyAll = e => {
    e.stopPropagation()
    const text = entries.map(e => `${e.name.padEnd(42)} ${e.pattern}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  return (
    <div
      className="glass"
      style={{
        marginBottom: '8px',
        overflow: 'hidden',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '13px 16px',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background 0.12s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.20 0.025 265 / 40%)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            color: 'var(--color-primary)',
            fontSize: '13px',
            display: 'inline-block',
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.18s ease',
          }}>›</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: 'var(--color-text)' }}>
            {module}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
            {entries.length} pattern{entries.length !== 1 ? 's' : ''}
          </span>
        </div>

        <button
          onClick={handleCopyAll}
          style={{
            background: copiedAll ? 'oklch(0.72 0.16 145 / 15%)' : 'transparent',
            border: `1px solid ${copiedAll ? 'oklch(0.72 0.16 145 / 40%)' : 'var(--color-border)'}`,
            borderRadius: '6px',
            color: copiedAll ? 'oklch(0.78 0.16 145)' : 'var(--color-text-faint)',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 500,
            padding: '3px 11px',
            transition: 'all 0.15s ease',
          }}
        >
          {copiedAll ? '✓ Copied' : 'Copy module'}
        </button>
      </div>

      {/* Column headers + rows */}
      {open && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr auto',
            gap: '12px',
            padding: '5px 16px',
            background: 'oklch(0.16 0.02 265 / 60%)',
            borderTop: '1px solid var(--color-border)',
          }}>
            {['Name', 'Pattern', ''].map((h, i) => (
              <span key={i} style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-faint)' }}>{h}</span>
            ))}
          </div>
          {entries.map(entry => (
            <PatternRow key={`${entry.module}-${entry.name}`} entry={entry} />
          ))}
        </>
      )}
    </div>
  )
}

function CS2PatternsPanel() {
  const { patterns, loading, error, source } = usePatterns()
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('All')
  const [copiedAll, setCopiedAll] = useState(false)

  const allModules = useMemo(() => {
    const mods = Array.from(new Set(patterns.map(p => p.module))).sort()
    return ['All', ...mods]
  }, [patterns])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return patterns.filter(p => {
      const matchMod = moduleFilter === 'All' || p.module === moduleFilter
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.pattern.toLowerCase().includes(q)
      return matchMod && matchQ
    })
  }, [patterns, search, moduleFilter])

  const grouped = useMemo(() => {
    const map = {}
    for (const p of filtered) {
      if (!map[p.module]) map[p.module] = []
      map[p.module].push(p)
    }
    return Object.entries(map)
  }, [filtered])

  const handleCopyAll = () => {
    const text = filtered.map(p => `[ ${p.module} ]  ${p.name.padEnd(42)} ${p.pattern}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '22px', margin: 0 }}>
            CS2 — <span className="grad-text">Patterns</span>
          </h2>
          {!loading && (
            <span className="badge-primary" style={{ fontSize: '11px' }}>
              {patterns.length} patterns
            </span>
          )}
          {source === 'fallback' && (
            <span className="badge-muted" style={{ fontSize: '11px' }}>offline fallback</span>
          )}
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.65, maxWidth: '560px', margin: 0 }}>
          Byte pattern signatures for Counter-Strike 2, sourced live from{' '}
          <a href="https://www.cs2-sdk.com" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            cs2-sdk.com
          </a>.
          Search, filter by module, copy individual patterns or entire modules.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          <span style={{
            width: '16px', height: '16px', borderRadius: '50%',
            border: '2px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
          }} />
          Loading patterns...
        </div>
      )}

      {/* Error notice */}
      {error && !loading && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'oklch(0.35 0.08 25 / 15%)',
          border: '1px solid oklch(0.55 0.12 25 / 30%)',
          fontSize: '13px',
          color: 'oklch(0.72 0.10 25)',
        }}>
          Could not reach cs2-sdk.com ({error}). Showing offline fallback patterns.
        </div>
      )}

      {/* Toolbar */}
      {!loading && (
        <>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <span style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-faint)', fontSize: '13px', pointerEvents: 'none',
              }}>⌕</span>
              <input
                type="text"
                placeholder="Search by name or bytes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', background: 'oklch(0.18 0.025 265 / 70%)',
                  border: '1px solid var(--color-border)', borderRadius: '8px',
                  color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '13px',
                  outline: 'none', padding: '9px 12px 9px 32px', boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
              />
            </div>

            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              style={{
                background: 'oklch(0.18 0.025 265 / 70%)',
                border: '1px solid var(--color-border)', borderRadius: '8px',
                color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '13px',
                outline: 'none', padding: '9px 12px', cursor: 'pointer', flexShrink: 0,
              }}
            >
              {allModules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <button
              onClick={handleCopyAll}
              className={copiedAll ? undefined : 'btn-outline'}
              style={{
                padding: '9px 18px', fontSize: '13px', flexShrink: 0,
                ...(copiedAll ? {
                  background: 'oklch(0.72 0.16 145 / 15%)',
                  border: '1px solid oklch(0.72 0.16 145 / 40%)',
                  borderRadius: '8px', color: 'oklch(0.78 0.16 145)',
                  cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 500,
                } : {}),
              }}
            >
              {copiedAll ? '✓ Copied all' : `Copy all (${filtered.length})`}
            </button>
          </div>

          {(search || moduleFilter !== 'All') && (
            <div style={{ fontSize: '13px', color: 'var(--color-text-faint)' }}>
              Showing {filtered.length} of {patterns.length} patterns
              {moduleFilter !== 'All' && ` in ${moduleFilter}`}
            </div>
          )}

          {grouped.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: '14px' }}>
              No patterns match your search.
            </div>
          ) : (
            grouped.map(([mod, entries], i) => (
              <ModuleSection key={mod} module={mod} entries={entries} defaultOpen={i === 0} />
            ))
          )}
        </>
      )}

      {/* Spin keyframe via inline style tag */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function Patterns() {
  const [selected, setSelected] = useState(null)
  const containerRef = usePageTransition(selected)

  if (selected === 'cs2') {
    return (
      <div ref={containerRef} style={{ padding: '56px 2rem 80px' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: '13px',
              fontFamily: 'var(--font-body)', padding: 0,
              marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            ← Back to patterns
          </button>
          <CS2PatternsPanel />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ padding: '56px 2rem 80px' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: 'clamp(26px, 4vw, 40px)', marginBottom: '12px',
          }}>
            Signal <span className="grad-text">patterns</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', maxWidth: '520px', lineHeight: 1.7 }}>
            Byte pattern signatures grouped by module. Loaded live from cs2-sdk.com.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
          <button
            className="glass glass-inner"
            onClick={() => setSelected('cs2')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 20px', cursor: 'pointer',
              border: '1px solid var(--color-border)',
              borderRadius: '10px', transition: 'all 0.15s ease', textAlign: 'left',
              background: 'oklch(0.17 0.025 265 / 60%)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
              e.currentTarget.style.boxShadow = '0 0 14px oklch(0.62 0.20 255 / 15%)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '15px', marginBottom: '3px' }}>
                CS2
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Counter-Strike 2 — 503 byte patterns across 13 modules
              </div>
            </div>
            <span style={{ color: 'var(--color-primary)', fontSize: '18px' }}>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
