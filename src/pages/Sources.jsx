import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../data/sources'

const CATEGORIES_EXTRA = [
  {
    key: 'coming',
    label: 'More games',
    locked: true,
    sources: [],
  },
]

function SourceCard({ s }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => navigate(`/sources/${s.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        cursor: 'pointer',
        borderBottom: '1px solid var(--color-border-subtle)',
        background: hovered ? 'oklch(0.20 0.025 265 / 50%)' : 'transparent',
        transition: 'background 0.15s ease',
        gap: '12px',
      }}
    >
      {/* Left — name + type */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: '14px',
          color: hovered ? 'var(--color-primary)' : 'var(--color-text)',
          transition: 'color 0.15s ease',
          marginBottom: '3px',
        }}>
          {s.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>
          {s.type}
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <span
          className={s.isUpdated ? 'badge-primary' : 'badge-muted'}
          style={{ fontSize: '10px', padding: '2px 8px' }}
        >
          {s.isUpdated ? 'Updated' : 'Outdated'}
        </span>
        <span
          className={s.virusChecked ? 'badge-primary' : 'badge-muted'}
          style={{
            fontSize: '10px', padding: '2px 8px',
            ...(s.virusChecked
              ? { background: 'oklch(0.72 0.16 145 / 15%)', color: 'oklch(0.75 0.16 145)', borderColor: 'oklch(0.72 0.16 145 / 30%)' }
              : {}),
          }}
        >
          {s.virusChecked ? '✓ Checked' : '? Unchecked'}
        </span>
      </div>

      {/* Arrow */}
      <span style={{
        color: hovered ? 'var(--color-primary)' : 'var(--color-text-faint)',
        fontSize: '16px',
        transition: 'color 0.15s ease',
        flexShrink: 0,
      }}>›</span>
    </div>
  )
}

function CategorySection({ cat }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="glass" style={{ overflow: 'hidden', marginBottom: '12px' }}>
      {/* Header */}
      <div
        onClick={() => !cat.locked && setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 20px',
          cursor: cat.locked ? 'default' : 'pointer',
          borderBottom: open && !cat.locked && cat.sources.length > 0
            ? '1px solid var(--color-border-subtle)'
            : 'none',
        }}
        onMouseEnter={e => !cat.locked && (e.currentTarget.style.background = 'oklch(0.20 0.025 265 / 40%)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={cat.locked ? 'badge-muted' : 'badge-primary'} style={{ flexShrink: 0 }}>
            {cat.locked ? 'Soon' : cat.label.split(' ')[0].toUpperCase()}
          </span>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '15px',
              color: cat.locked ? 'var(--color-text-muted)' : 'var(--color-text)',
            }}>
              {cat.label}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>
              {cat.locked
                ? 'Coming soon'
                : `${cat.sources.length} source${cat.sources.length !== 1 ? 's' : ''} — click any to open`}
            </div>
          </div>
        </div>
        {!cat.locked && (
          <span style={{
            color: 'var(--color-text-faint)',
            fontSize: '18px',
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s ease',
            display: 'inline-block',
          }}>›</span>
        )}
      </div>

      {/* Source rows */}
      {open && !cat.locked && cat.sources.map(s => (
        <SourceCard key={s.id} s={s} />
      ))}
    </div>
  )
}

export default function Sources() {
  const liveCategories = getCategories()
  const allCategories = [...liveCategories, ...CATEGORIES_EXTRA]

  return (
    <div style={{ padding: '56px 2rem 80px' }} className="page-enter">
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 className="hero-title" style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 'clamp(26px, 4vw, 40px)',
            marginBottom: '12px',
          }}>
            Verified <span className="grad-text">source index</span>
          </h1>
          <p className="hero-sub" style={{
            color: 'var(--color-text-muted)',
            fontSize: '15px',
            maxWidth: '560px',
            lineHeight: 1.7,
          }}>
            Sources are grouped by game. Click any source to open its detail page
            where you can download the files, check the update status, and see the virus scan result.
          </p>
        </div>

        {/* Category sections */}
        <div className="stagger">
          {allCategories.map(cat => (
            <CategorySection key={cat.key} cat={cat} />
          ))}
        </div>
      </div>
    </div>
  )
}
