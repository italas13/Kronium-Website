import React, { useState } from 'react'

// ── Product data ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: 'access',
    label: 'Access & Memberships',
    description: 'Subscription tiers and access keys for Kronium member tools.',
  },
  {
    key: 'tools',
    label: 'Tools & Utilities',
    description: 'Standalone tools, loaders, and utilities for members.',
  },
]

const PRODUCTS = [
  {
    category: 'access',
    name: 'Kronium Member — Monthly',
    price: '€9.99 / mo',
    priceNote: 'Billed monthly. Cancel anytime.',
    badge: 'Most popular',
    badgeType: 'primary',
    description: 'Full access to all Kronium member tools, source index, offset feeds, pattern tracking, and priority support.',
    features: [
      'All offset & pattern feeds',
      'Verified source index',
      'Member product pricing',
      'Priority support',
    ],
    action: 'Subscribe',
    highlight: true,
  },
  {
    category: 'access',
    name: 'Kronium Member — Lifetime',
    price: '€59.00',
    priceNote: 'One-time payment. Never pay again.',
    badge: 'Best value',
    badgeType: 'accent',
    description: 'Permanent member access. Pay once, stay forever. Includes all future feature updates.',
    features: [
      'Everything in Monthly',
      'Lifetime updates',
      'Early access to new tools',
      'Founding member badge',
    ],
    action: 'Purchase',
    highlight: false,
  },
  {
    category: 'tools',
    name: 'KetaWare Loader',
    price: 'Included with membership',
    priceNote: 'Requires active membership to download.',
    badge: 'Tool',
    badgeType: 'muted',
    description: 'CS2 loader with GitHub-hosted DLL, automatic offset updates, and main-menu injection detection. No files left on disk.',
    features: [
      'GitHub DLL delivery',
      'Sign-on state injection timing',
      'PE header erase post-inject',
      'Auto offset sync',
    ],
    action: 'Download (members only)',
    highlight: false,
  },
  {
    category: 'tools',
    name: 'Offset Auto-Updater',
    price: 'Included with membership',
    priceNote: 'Plug-and-play with any C++ project.',
    badge: 'Tool',
    badgeType: 'muted',
    description: 'Drop-in header that fetches your offsets.json from GitHub on DLL startup and patches all offsets atomically — no recompile needed after CS2 updates.',
    features: [
      'Zero-config setup',
      'Atomic offset patching',
      'Hardcoded fallback values',
      'C++14 compatible',
    ],
    action: 'Download (members only)',
    highlight: false,
  },
]

// ── Sub-components ────────────────────────────────────────────────────────────
function ProductCard({ p }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="glass glass-inner"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        border: p.highlight
          ? '1px solid oklch(0.62 0.20 255 / 60%)'
          : hovered
          ? '1px solid oklch(0.62 0.20 255 / 30%)'
          : '1px solid var(--color-border)',
        boxShadow: p.highlight
          ? '0 0 28px oklch(0.62 0.20 255 / 15%)'
          : hovered
          ? '0 0 14px oklch(0.62 0.20 255 / 8%)'
          : 'none',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Decorative top gradient bar */}
      {p.highlight && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
          borderRadius: '12px 12px 0 0',
        }} />
      )}

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: '16px', lineHeight: 1.2, flex: 1, paddingRight: '8px',
          }}>{p.name}</h3>
          <span className={p.badgeType === 'primary' ? 'badge-primary' : p.badgeType === 'accent' ? 'badge-primary' : 'badge-muted'}
            style={p.badgeType === 'accent' ? { background: 'oklch(0.72 0.16 200 / 15%)', color: 'var(--color-accent)', borderColor: 'oklch(0.72 0.16 200 / 30%)' } : {}}>
            {p.badge}
          </span>
        </div>

        {/* Price */}
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: '22px', letterSpacing: '-0.03em',
            color: p.highlight ? 'var(--color-primary)' : 'var(--color-text)',
          }}>{p.price}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', marginTop: '2px' }}>
            {p.priceNote}
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '13px', color: 'var(--color-text-muted)',
          lineHeight: 1.6, margin: 0,
        }}>{p.description}</p>

        {/* Features */}
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {p.features.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              <span style={{ color: 'var(--color-primary)', flexShrink: 0, fontSize: '12px' }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          className={p.highlight ? 'btn-primary' : 'btn-outline'}
          style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}
        >
          {p.action}
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Products() {
  return (
    <div style={{ padding: '56px 2rem 80px' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: 'clamp(26px, 4vw, 40px)', marginBottom: '12px',
          }}>
            Member <span className="grad-text">products</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', maxWidth: '520px', lineHeight: 1.7 }}>
            Everything below is priced for members. Tools are distributed digitally
            and access is provisioned instantly after purchase.
          </p>
        </div>

        {/* Category sections */}
        {CATEGORIES.map(cat => {
          const catProducts = PRODUCTS.filter(p => p.category === cat.key)
          return (
            <div key={cat.key} style={{ marginBottom: '48px' }}>
              {/* Section header */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 600,
                  fontSize: '18px', marginBottom: '4px',
                }}>{cat.label}</h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                  {cat.description}
                </p>
                <div style={{
                  height: '1px', background: 'var(--color-border)',
                  marginTop: '16px',
                }} />
              </div>

              {/* Product grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}>
                {catProducts.map((p, i) => (
                  <ProductCard key={i} p={p} />
                ))}
              </div>
            </div>
          )
        })}

        {/* Fine print */}
        <div className="glass" style={{ padding: '16px 20px', marginTop: '8px' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-faint)', margin: 0, lineHeight: 1.6 }}>
            All purchases are processed securely. Member access is tied to your Discord account.
            Tool downloads are available immediately after purchase. Refunds are handled case-by-case within 48 hours.
          </p>
        </div>
      </div>
    </div>
  )
}
