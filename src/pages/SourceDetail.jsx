import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { getSourceById } from '../data/sources'

// ── Badge base style ──────────────────────────────────────────────────────────
const B = {
  fontSize: '12px',
  padding: '4px 12px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  border: '1px solid',
  borderRadius: '999px',
  fontFamily: 'var(--font-heading)',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  lineHeight: 1,
}

function UpdatedBadge({ isUpdated }) {
  return (
    <span style={{
      ...B,
      background: isUpdated ? 'oklch(0.62 0.20 255 / 12%)' : 'oklch(0.3 0.03 265 / 40%)',
      color: isUpdated ? 'var(--color-primary)' : 'var(--color-text-faint)',
      borderColor: isUpdated ? 'oklch(0.62 0.20 255 / 35%)' : 'var(--color-border)',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
        background: isUpdated ? 'var(--color-primary)' : 'var(--color-text-faint)',
        boxShadow: isUpdated ? '0 0 5px var(--color-primary)' : 'none',
      }} />
      {isUpdated ? 'Up to date' : 'May be outdated'}
    </span>
  )
}

function VirusBadge({ checked, url }) {
  const style = {
    ...B,
    background: checked ? 'oklch(0.72 0.16 145 / 15%)' : 'oklch(0.3 0.03 265 / 40%)',
    color: checked ? 'oklch(0.78 0.16 145)' : 'var(--color-text-faint)',
    borderColor: checked ? 'oklch(0.72 0.16 145 / 35%)' : 'var(--color-border)',
    textDecoration: 'none',
    cursor: checked && url && url !== '#' ? 'pointer' : 'default',
    transition: 'box-shadow 0.2s ease, transform 0.15s ease',
  }
  const label = checked ? '✓ Virus checked' : '? Not checked'
  if (checked && url && url !== '#') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={style} title="View VirusTotal report"
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 10px oklch(0.72 0.16 145 / 30%)'; e.currentTarget.style.transform = 'scale(1.04)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)' }}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, flexShrink: 0 }}>
          <path d="M3.5 1H1v10h10V8.5"/><path d="M7 1h4v4"/><line x1="11" y1="1" x2="5.5" y2="6.5"/>
        </svg>
      </a>
    )
  }
  return <span style={style}>{label}</span>
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)
  const [animDir, setAnimDir] = useState(null)

  const go = useCallback((dir) => {
    setAnimDir(dir)
    setTimeout(() => {
      setCurrent(i => (i + dir + images.length) % images.length)
      setAnimDir(null)
    }, 150)
  }, [images.length])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go, onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const content = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 99999,
        background: 'oklch(0.06 0.015 265 / 95%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      {/* Image */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid oklch(0.3 0.04 265 / 60%)',
          boxShadow: '0 40px 120px oklch(0 0 0 / 80%), 0 0 0 1px oklch(0.62 0.20 255 / 15%)',
          animation: 'scaleInLightbox 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
          maxWidth: 'calc(100vw - 120px)',
          maxHeight: 'calc(100vh - 160px)',
          display: 'flex',
        }}
      >
        <img
          key={current}
          src={images[current]}
          alt={`Screenshot ${current + 1}`}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 160px)',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            opacity: animDir ? 0 : 1,
            transform: animDir === 1 ? 'translateX(-24px)' : animDir === -1 ? 'translateX(24px)' : 'none',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
          }}
        />
      </div>

      {/* Counter + thumbnails */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
      >
        <div style={{ fontSize: '12px', color: 'oklch(0.55 0.02 265)' }}>
          {current + 1} / {images.length}
        </div>

        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Thumb ${i + 1}`}
                onClick={() => setCurrent(i)}
                style={{
                  width: '60px', height: '42px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: `2px solid ${i === current ? 'var(--color-primary)' : 'oklch(0.28 0.03 265)'}`,
                  opacity: i === current ? 1 : 0.45,
                  transition: 'all 0.15s ease',
                  boxShadow: i === current ? '0 0 10px oklch(0.62 0.20 255 / 50%)' : 'none',
                }}
                onMouseEnter={e => { if (i !== current) { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.transform = 'scale(1.07)' } }}
                onMouseLeave={e => { if (i !== current) { e.currentTarget.style.opacity = '0.45'; e.currentTarget.style.transform = 'scale(1)' } }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Prev arrow */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); go(-1) }}
          style={{
            position: 'fixed', left: '24px', top: '50%', transform: 'translateY(-50%)',
            background: 'oklch(0.16 0.025 265 / 85%)',
            border: '1px solid oklch(0.28 0.03 265)',
            borderRadius: '50%', width: '48px', height: '48px',
            color: 'var(--color-text)', fontSize: '24px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'oklch(0.22 0.04 265 / 90%)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'oklch(0.28 0.03 265)'; e.currentTarget.style.background = 'oklch(0.16 0.025 265 / 85%)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)' }}
        >‹</button>
      )}

      {/* Next arrow */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); go(1) }}
          style={{
            position: 'fixed', right: '24px', top: '50%', transform: 'translateY(-50%)',
            background: 'oklch(0.16 0.025 265 / 85%)',
            border: '1px solid oklch(0.28 0.03 265)',
            borderRadius: '50%', width: '48px', height: '48px',
            color: 'var(--color-text)', fontSize: '24px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'oklch(0.22 0.04 265 / 90%)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'oklch(0.28 0.03 265)'; e.currentTarget.style.background = 'oklch(0.16 0.025 265 / 85%)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)' }}
        >›</button>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: '20px', right: '20px',
          background: 'oklch(0.16 0.025 265 / 85%)',
          border: '1px solid oklch(0.28 0.03 265)',
          borderRadius: '50%', width: '40px', height: '40px',
          color: 'oklch(0.65 0.02 265)', fontSize: '20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'oklch(0.65 0.02 265)'; e.currentTarget.style.borderColor = 'oklch(0.28 0.03 265)'; e.currentTarget.style.transform = 'scale(1) rotate(0deg)' }}
      >×</button>

      <style>{`
        @keyframes scaleInLightbox {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )

  // Render outside the DOM tree so nothing clips or z-stacks it
  return createPortal(content, document.body)
}

// ── Screenshot gallery ────────────────────────────────────────────────────────
function ScreenshotGallery({ screenshots }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  if (!screenshots?.length) return null

  return (
    <div className="glass" style={{ padding: '24px', marginBottom: '16px', overflow: 'hidden' }}>
      <div style={{
        fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--color-text-faint)',
        marginBottom: '16px',
      }}>
        Screenshots — {screenshots.length} image{screenshots.length !== 1 ? 's' : ''}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '10px',
      }}>
        {screenshots.map((src, i) => (
          <div
            key={i}
            onClick={() => setLightboxIndex(i)}
            style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid var(--color-border)',
              aspectRatio: '16/9',
              background: 'oklch(0.16 0.02 265 / 60%)',
              transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 8px 32px oklch(0.62 0.20 255 / 20%)'
              e.currentTarget.querySelector('.overlay').style.opacity = '1'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.querySelector('.overlay').style.opacity = '0'
            }}
          >
            <img
              src={src}
              alt={`Screenshot ${i + 1}`}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Hover overlay */}
            <div
              className="overlay"
              style={{
                position: 'absolute', inset: 0,
                background: 'oklch(0.08 0.02 265 / 50%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s ease',
              }}
            >
              <div style={{
                background: 'oklch(0.18 0.025 265 / 90%)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 500,
                color: 'var(--color-text)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
                Expand
              </div>
            </div>

            {/* Index number */}
            <div style={{
              position: 'absolute', top: '8px', right: '8px',
              background: 'oklch(0.10 0.02 265 / 80%)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              color: 'var(--color-text-faint)',
              fontFamily: 'var(--font-heading)',
            }}>
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={screenshots}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SourceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const source = getSourceById(id)

  if (!source) {
    return (
      <div style={{ padding: '80px 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '22px', marginBottom: '12px' }}>
            Source not found
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            This source doesn't exist or may have been removed.
          </p>
          <button className="btn-outline" onClick={() => navigate('/sources')}>
            ← Back to sources
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '48px 2rem 80px' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

        {/* Back link */}
        <button
          onClick={() => navigate('/sources')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)', fontSize: '13px',
            fontFamily: 'var(--font-body)', padding: '0',
            marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          ← Back to sources
        </button>

        {/* Main card */}
        <div className="glass glass-inner animate-fade-in-up" style={{ padding: '40px', marginBottom: '16px' }}>

          {/* Top row — category + badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <span style={{ ...B, background: 'oklch(0.62 0.20 255 / 12%)', color: 'var(--color-primary)', borderColor: 'oklch(0.62 0.20 255 / 35%)' }}>
              {source.categoryLabel}
            </span>
            <span style={{ ...B, background: 'oklch(0.3 0.03 265 / 40%)', color: 'var(--color-text-faint)', borderColor: 'var(--color-border)' }}>
              {source.type}
            </span>
            <UpdatedBadge isUpdated={source.isUpdated} />
            <VirusBadge checked={source.virusChecked} url={source.virusTotalUrl} />
          </div>

          {/* Name + version */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(22px, 4vw, 36px)', marginBottom: '6px' }}>
              {source.name}
            </h1>
            {source.version && (
              <span style={{ fontSize: '13px', color: 'var(--color-text-faint)' }}>
                Version: <span style={{ color: 'var(--color-text-muted)' }}>{source.version}</span>
              </span>
            )}
          </div>

          {/* Description */}
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.75, maxWidth: '680px', marginBottom: '28px' }}>
            {source.description}
          </p>

          {/* Tags */}
          {source.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '32px' }}>
              {source.tags.map(t => (
                <span key={t} className="spec-pill">{t}</span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '28px' }} />

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href={source.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
              onClick={e => source.downloadUrl === '#' && e.preventDefault()}
            >
              <button
                className="btn-primary"
                style={{
                  padding: '12px 28px', fontSize: '15px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  opacity: source.downloadUrl === '#' ? 0.5 : 1,
                  cursor: source.downloadUrl === '#' ? 'not-allowed' : 'pointer',
                }}
                disabled={source.downloadUrl === '#'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 12l-4-4h2.5V3h3v5H12L8 12z"/>
                  <path d="M3 13h10v1.5H3z"/>
                </svg>
                {source.downloadUrl === '#' ? 'Download (coming soon)' : 'Download'}
              </button>
            </a>

            {source.sourceUrl && source.sourceUrl !== '#' && (
              <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button className="btn-outline" style={{ padding: '12px 20px', fontSize: '14px' }}>
                  View on GitHub →
                </button>
              </a>
            )}
          </div>

          {source.downloadUrl === '#' && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-faint)', marginTop: '12px', marginBottom: 0 }}>
              Download link will be added once the GitHub repo is set up.
            </p>
          )}
        </div>

        {/* Screenshot gallery */}
        <ScreenshotGallery screenshots={source.screenshots} />

        {/* Notes card */}
        {source.notes && (
          <div className="glass" style={{ padding: '20px 24px' }}>
            <div style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: '8px',
            }}>
              Notes
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.7, margin: 0 }}>
              {source.notes}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
