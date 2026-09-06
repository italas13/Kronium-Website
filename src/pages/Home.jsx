import React from 'react'
import { useNavigate } from 'react-router-dom'

const stats = [
  { value: '24/7', label: 'User Support' },
]

const features = [
  {
    icon: '⬡',
    title: 'Fully Checked Sources',
    body: 'Every Source is checked by our team to ensure safety towards our users.',
  },
  {
    icon: '◈',
    title: 'Offsets and Patterns Update Instantly',
    body: 'We monitor game updates and update offsets and patterns as fast as possible.',
  },
]

const quickTabs = [
  { to: '/sources',  label: 'Sources',  desc: 'Verified source index'   },
  { to: '/offsets',  label: 'Offsets',  desc: 'Offset & schema ledger'  },
  { to: '/patterns', label: 'Patterns', desc: 'Byte pattern signatures' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="page-enter">
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'visible', padding: '80px 2rem 56px' }}>
        {/* Diagonal blue wash */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(135deg, oklch(0.62 0.20 255 / 6%) 0%, transparent 60%)',
        }} />
        {/* Glow orb — now floats */}
        <div className="glow-float" style={{
          position: 'absolute', top: '-10%', right: '10%', pointerEvents: 'none',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, oklch(0.62 0.20 255 / 10%) 0%, transparent 70%)',
        }} />

        <div style={{ maxWidth: '72rem', margin: '0 auto', position: 'relative' }}>
          {/* Pill badge */}
          <div style={{ marginBottom: '24px' }} className="hero-badge">
            <span className="badge-primary">Members access</span>
          </div>

          {/* Headline */}
          <h1
            className="hero-title"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 56px)',
              maxWidth: '780px',
              marginBottom: '20px',
              color: 'var(--color-text)',
            }}
          >
            <span className="grad-text">Kronium</span>
          </h1>

          {/* Subheadline */}
          <p
            className="hero-sub"
            style={{
              color: 'var(--color-text-muted)',
              fontSize: '17px',
              maxWidth: '560px',
              lineHeight: 1.7,
              marginBottom: '36px',
            }}
          >
            Kronium is a website for sources, offsets and patterns!
          </p>

          {/* CTAs */}
          <div className="hero-ctas" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/sources')}>
              Browse sources
            </button>
            <button className="btn-outline" onClick={() => navigate('/offsets')}>
              View offsets
            </button>
          </div>
        </div>
      </section>

      {/* ── Quick tabs ──────────────────────────────────────────────── */}
      <section style={{ padding: '32px 2rem 56px' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div
            className="stagger hero-tabs"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {quickTabs.map(tab => (
              <button
                key={tab.to}
                onClick={() => navigate(tab.to)}
                className="glass glass-inner card-hover animate-fade-in-up"
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: 'oklch(0.17 0.025 265 / 60%)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: '15px',
                  color: 'var(--color-text)',
                  marginBottom: '4px',
                }}>{tab.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{tab.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <section style={{ padding: '0 2rem 72px' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div className="glass glass-inner animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0',
            animationDelay: '0.4s',
          }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                padding: '32px 24px',
                borderRight: i < stats.length - 1 ? '1px solid var(--color-border)' : 'none',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '32px',
                  letterSpacing: '-0.04em',
                  marginBottom: '4px',
                }} className="grad-text">{s.value}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why members stay ────────────────────────────────────────── */}
      <section style={{ padding: '0 2rem 80px' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <h2
            className="animate-fade-in-up"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '28px',
              marginBottom: '32px',
              animationDelay: '0.45s',
            }}
          >
            Why members <span className="grad-text">stay</span>
          </h2>
          <div
            className="stagger"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                className="glass glass-inner card-hover animate-fade-in-up"
                style={{ padding: '28px 24px', animationDelay: `${0.5 + i * 0.08}s` }}
              >
                {/* Icon square */}
                <div style={{
                  width: '36px', height: '36px',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', marginBottom: '16px',
                  color: '#fff',
                }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: '16px',
                  marginBottom: '8px',
                  color: 'var(--color-text)',
                }}>{f.title}</h3>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
