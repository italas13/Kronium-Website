import React, { useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// Wraps the page outlet and re-triggers the fade-in animation on every navigation
function AnimatedOutlet() {
  const location = useLocation()
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Remove and re-add the class to restart the animation
    el.classList.remove('page-transition')
    void el.offsetWidth // force reflow
    el.classList.add('page-transition')
  }, [location.pathname])

  return (
    <div ref={ref} className="page-transition">
      <Outlet />
    </div>
  )
}

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/auth')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        className="header-entrance"
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'oklch(0.13 0.02 265 / 85%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div style={{
          maxWidth: '72rem', margin: '0 auto',
          padding: '0 2rem',
          height: '56px',
          display: 'flex', alignItems: 'center', gap: '2rem',
        }}>
          {/* Logo */}
          <NavLink to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '18px',
              letterSpacing: '-0.04em',
              color: 'var(--color-text)',
            }}>
              KRON<span className="grad-text">IUM</span>
            </span>
          </NavLink>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: '4px', flex: 1 }}>
            {[
              { to: '/',         label: 'Home'     },
              { to: '/sources',  label: 'Sources'  },
              { to: '/offsets',  label: 'Offsets'  },
              { to: '/patterns', label: 'Patterns' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Sign out */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-faint)' }}>
                {user.username}
              </span>
              <button className="btn-outline" onClick={handleSignOut}
                style={{ padding: '6px 14px', fontSize: '13px' }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Page content — animates on every route change */}
      <main style={{ flex: 1 }}>
        <AnimatedOutlet />
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border-subtle)',
        padding: '20px 2rem',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--color-text-faint)',
        fontFamily: 'var(--font-body)',
      }}>
        © {new Date().getFullYear()} Kronium. All rights reserved.
      </footer>
    </div>
  )
}
