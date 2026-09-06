import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

export default function AuthPage() {
  const { signInWithDiscord } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    const { error: err } = await signInWithDiscord()
    if (err) {
      setError('Sign-in failed. Please try again.')
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated glow orb — floats */}
      <div className="glow-float" style={{
        position: 'absolute', top: '-10%', left: '50%',
        transform: 'translateX(-50%)',
        width: '700px', height: '700px',
        background: 'radial-gradient(circle, oklch(0.62 0.20 255 / 12%) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Second offset orb */}
      <div style={{
        position: 'absolute', bottom: '10%', right: '-5%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, oklch(0.62 0.20 255 / 6%) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'float 8s ease-in-out infinite reverse',
      }} />

      {/* Auth panel */}
      <div
        className="glass glass-inner"
        style={{
          width: '100%', maxWidth: '400px',
          padding: '40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px',
          position: 'relative',
          animation: 'authPanelEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', animation: 'fadeInDown 0.5s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700, fontSize: '28px',
            margin: '0 0 8px', letterSpacing: '-0.04em',
          }}>
            KRON<span className="grad-text">IUM</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
            Members access
          </p>
        </div>

        {/* Divider */}
        <div style={{
          width: '100%', height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--color-border), transparent)',
          animation: 'fadeIn 0.5s 0.25s ease both',
        }} />

        {/* Discord button */}
        <div style={{
          width: '100%', display: 'flex', flexDirection: 'column', gap: '16px',
          animation: 'fadeInUp 0.5s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}>
          <button
            onClick={handleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              background: '#5865F2',
              color: '#fff',
              border: '1px solid rgba(88,101,242,0.6)',
              borderRadius: '8px',
              padding: '13px 20px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600, fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 0 24px rgba(88,101,242,0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              if (loading) return
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 0 40px rgba(88,101,242,0.5), 0 8px 24px rgba(88,101,242,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 0 24px rgba(88,101,242,0.3)'
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          >
            {loading ? (
              <span style={{
                width: '18px', height: '18px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                display: 'inline-block',
                animation: 'spin 0.7s linear infinite',
              }} />
            ) : (
              <DiscordIcon />
            )}
            {loading ? 'Connecting…' : 'Continue with Discord'}
          </button>

          {error && (
            <div style={{
              background: 'oklch(0.4 0.15 25 / 20%)',
              border: '1px solid oklch(0.5 0.15 25 / 40%)',
              borderRadius: '6px',
              padding: '10px 14px',
              color: 'oklch(0.75 0.12 25)',
              fontSize: '13px',
              textAlign: 'center',
              animation: 'fadeInUp 0.3s ease both',
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Fine print */}
        <p style={{
          fontSize: '12px', color: 'var(--color-text-faint)',
          textAlign: 'center', lineHeight: 1.5, margin: 0,
          animation: 'fadeIn 0.5s 0.45s ease both',
        }}>
          Sign-up and sign-in are the same step.
          An account is created automatically on your first sign-in.
        </p>
      </div>

      <style>{`
        @keyframes authPanelEnter {
          0%   { opacity: 0; transform: translateY(32px) scale(0.96); filter: blur(6px); }
          60%  { filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
