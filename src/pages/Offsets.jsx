import React, { useState, useMemo, useEffect } from 'react'
import { usePageTransition } from '../hooks/usePageTransition'

// ── Offset parser ──────────────────────────────────────────────────────────────
// Parses any a2x-style .hpp file into flat { module, name, value } objects.
//
// offsets.hpp / buttons.hpp:
//   // Module: client.dll
//   constexpr std::ptrdiff_t dwEntityList = 0x2571220;
//
// schema files (client_dll.hpp etc.):
//   // Module: client.dll
//   namespace C_CSPlayerPawn {
//       constexpr std::ptrdiff_t m_flHealth = 0x...; // float32
//   }
//
// The "module" field becomes the section label (e.g. "client.dll").
// For schema files, the class name is prepended: "C_CSPlayerPawn::m_flHealth".
function parseHpp(text) {
  const results = []
  let currentModule = null
  let currentClass  = null

  for (const raw of text.split('\n')) {
    const line = raw.trim()

    // // Module: client.dll
    const modM = line.match(/^\/\/\s*Module:\s*(.+)/)
    if (modM) {
      currentModule = modM[1].trim()
      currentClass  = null
      continue
    }

    if (!currentModule) continue

    // namespace ClassName {  — track class context for schema files
    const nsM = line.match(/^namespace\s+(\w+)\s*\{/)
    if (nsM) {
      const ns = nsM[1]
      // skip top-level structural namespaces
      if (!['cs2_dumper', 'schemas', 'offsets', 'buttons', 'interfaces'].includes(ns) &&
          !ns.endsWith('_dll')) {
        currentClass = ns
      }
      continue
    }

    // } — may close a class namespace (simple heuristic: reset class on bare })
    if (line === '}') {
      currentClass = null
      continue
    }

    // constexpr std::ptrdiff_t NAME = 0xVALUE;
    const m = line.match(/constexpr\s+\S+\s+(\w+)\s*=\s*(0x[0-9A-Fa-f]+|-?\d+)/)
    if (m) {
      const name = currentClass ? `${currentClass}::${m[1]}` : m[1]
      results.push({ module: currentModule, name, value: m[2] })
    }
  }

  return results
}

// ── All 20 .hpp files from a2x/cs2-dumper/output ─────────────────────────────
const HPP_FILES = [
  'offsets.hpp',
  'buttons.hpp',
  'animationsystem_dll.hpp',
  'client_dll.hpp',
  'engine2_dll.hpp',
  'host_dll.hpp',
  'interfaces.hpp',
  'materialsystem2_dll.hpp',
  'networksystem_dll.hpp',
  'panorama_dll.hpp',
  'particles_dll.hpp',
  'pulse_system_dll.hpp',
  'rendersystemdx11_dll.hpp',
  'resourcesystem_dll.hpp',
  'scenesystem_dll.hpp',
  'schemasystem_dll.hpp',
  'server_dll.hpp',
  'soundsystem_dll.hpp',
  'steamaudio_dll.hpp',
  'vphysics2_dll.hpp',
]

const GITHUB_RAW  = f => `https://raw.githubusercontent.com/a2x/cs2-dumper/main/output/${f}`
// Self-hosted: drop files into public/offsets/ to avoid GitHub fetch
const LOCAL       = f => `/offsets/${f}`

async function fetchHpp(filename) {
  // Try local first (drop files in public/offsets/ for offline use)
  try {
    const r = await fetch(LOCAL(filename), { cache: 'no-cache' })
    if (r.ok) return r.text()
  } catch { /* fall through */ }
  // Fall back to GitHub raw (no CORS issues on raw.githubusercontent.com)
  const r = await fetch(GITHUB_RAW(filename))
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.text()
}

// ── Data hook — loads all files in parallel ───────────────────────────────────
function useOffsets() {
  const [offsets, setOffsets] = useState([])  // flat array of { module, name, value, file }
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const results = await Promise.all(
          HPP_FILES.map(async f => {
            try {
              const text = await fetchHpp(f)
              return parseHpp(text).map(e => ({ ...e, file: f }))
            } catch {
              return []   // skip files that fail silently
            }
          })
        )
        if (!cancelled) {
          const flat = results.flat()
          if (flat.length > 0) {
            setOffsets(flat)
          } else {
            setError('No offsets loaded — check network or drop .hpp files in public/offsets/')
          }
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { offsets, loading, error }
}

// ── UI — exact copy of Patterns page, patterns → offsets ─────────────────────

function OffsetRow({ entry }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.value)
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
        {entry.value}
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
  const [open,      setOpen]      = useState(defaultOpen)
  const [copiedAll, setCopiedAll] = useState(false)

  const handleCopyAll = e => {
    e.stopPropagation()
    const text = entries.map(e => `${e.name.padEnd(52)} ${e.value}`).join('\n')
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
            {entries.length} offset{entries.length !== 1 ? 's' : ''}
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
            {['Name', 'Offset', ''].map((h, i) => (
              <span key={i} style={{
                fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase',
                color: h ? 'var(--color-text-faint)' : 'transparent',
              }}>{h}</span>
            ))}
          </div>
          {entries.map(entry => (
            <OffsetRow key={`${entry.module}-${entry.name}`} entry={entry} />
          ))}
        </>
      )}
    </div>
  )
}

function CS2OffsetsPanel() {
  const { offsets, loading, error } = useOffsets()
  const [search,       setSearch]       = useState('')
  const [moduleFilter, setModuleFilter] = useState('All')
  const [copiedAll,    setCopiedAll]    = useState(false)

  const allModules = useMemo(() => {
    const mods = Array.from(new Set(offsets.map(o => o.module))).sort()
    return ['All', ...mods]
  }, [offsets])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return offsets.filter(o => {
      const matchMod = moduleFilter === 'All' || o.module === moduleFilter
      const matchQ   = !q || o.name.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
      return matchMod && matchQ
    })
  }, [offsets, search, moduleFilter])

  const grouped = useMemo(() => {
    const map = {}
    for (const o of filtered) {
      if (!map[o.module]) map[o.module] = []
      map[o.module].push(o)
    }
    return Object.entries(map)
  }, [filtered])

  const handleCopyAll = () => {
    const text = filtered.map(o => `${o.name.padEnd(52)} ${o.value}`).join('\n')
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
            CS2 — <span className="grad-text">Offsets</span>
          </h2>
          {!loading && (
            <span className="badge-primary" style={{ fontSize: '11px' }}>
              {offsets.length.toLocaleString()} offsets
            </span>
          )}
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.65, maxWidth: '560px', margin: 0 }}>
          All offset and schema data from{' '}
          <a href="https://github.com/a2x/cs2-dumper/tree/main/output"
            target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            a2x/cs2-dumper
          </a>.
          Search, filter by module, copy individual offsets or entire modules.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          <span style={{
            width: '16px', height: '16px', borderRadius: '50%',
            border: '2px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
          }} />
          Loading offset files...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: 'oklch(0.35 0.08 25 / 15%)',
          border: '1px solid oklch(0.55 0.12 25 / 30%)',
          fontSize: '13px', color: 'oklch(0.72 0.10 25)',
        }}>
          {error}
        </div>
      )}

      {/* Toolbar */}
      {!loading && offsets.length > 0 && (
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
                placeholder="Search by name or offset value..."
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
              {copiedAll ? '✓ Copied all' : `Copy all (${filtered.length.toLocaleString()})`}
            </button>
          </div>

          {(search || moduleFilter !== 'All') && (
            <div style={{ fontSize: '13px', color: 'var(--color-text-faint)' }}>
              Showing {filtered.length.toLocaleString()} of {offsets.length.toLocaleString()} offsets
              {moduleFilter !== 'All' && ` in ${moduleFilter}`}
            </div>
          )}

          {grouped.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: '14px' }}>
              No offsets match your search.
            </div>
          ) : (
            grouped.map(([mod, entries], i) => (
              <ModuleSection key={mod} module={mod} entries={entries} defaultOpen={i === 0} />
            ))
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function Offsets() {
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
            ← Back to offsets
          </button>
          <CS2OffsetsPanel />
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
            Offset <span className="grad-text">ledger</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', maxWidth: '520px', lineHeight: 1.7 }}>
            Select a game to browse its offsets — all 20 .hpp files from a2x/cs2-dumper,
            searchable and copyable by module.
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
                Counter-Strike 2 — all 20 .hpp offset files
              </div>
            </div>
            <span style={{ color: 'var(--color-primary)', fontSize: '18px' }}>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
