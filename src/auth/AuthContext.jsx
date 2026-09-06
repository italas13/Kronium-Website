import React, { createContext, useContext, useState, useEffect } from 'react'

// ── Supabase integration ──────────────────────────────────────────────────────
// When VITE_SUPABASE_URL is set (on Cloudflare Pages), we use real Supabase auth.
// Locally without env vars we fall back to a mock session so you can dev freely.

let supabase = null

const hasSupabase =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY

if (hasSupabase) {
  // Dynamic import so the bundle doesn't break if @supabase/supabase-js isn't installed locally
  import('./supabase.js').then(m => { supabase = m.supabase }).catch(() => {})
}

// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasSupabase) {
      // Wait a tick for the dynamic import to resolve
      const timer = setTimeout(async () => {
        if (!supabase) { setLoading(false); return }

        // Get current session (handles OAuth callback automatically)
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) setUser(normaliseUser(session.user))
        setLoading(false)

        // Listen for auth changes (sign in / sign out)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setUser(session?.user ? normaliseUser(session.user) : null)
          }
        )
        return () => subscription.unsubscribe()
      }, 100)
      return () => clearTimeout(timer)
    } else {
      // Local dev fallback — restore mock session from localStorage
      const saved = localStorage.getItem('kronium_mock_user')
      if (saved) {
        try { setUser(JSON.parse(saved)) } catch {}
      }
      setLoading(false)
    }
  }, [])

  // Normalise Supabase user → our user shape
  function normaliseUser(sbUser) {
    const meta = sbUser.user_metadata || {}
    return {
      id: sbUser.id,
      email: sbUser.email,
      username: meta.full_name || meta.name || meta.user_name || 'Member',
      avatar: meta.avatar_url || null,
      provider: sbUser.app_metadata?.provider || 'discord',
    }
  }

  // ── Sign in ────────────────────────────────────────────────────────────────
  const signInWithDiscord = async () => {
    if (hasSupabase && supabase) {
      // Real OAuth — redirects to Discord then back to /auth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: window.location.origin + '/auth',
        },
      })
      // If error is null, the browser is being redirected — nothing else to do
      return { error }
    } else {
      // Local dev mock
      const mockUser = {
        id: 'mock_' + Date.now(),
        username: 'Member#0001',
        avatar: null,
        provider: 'discord',
      }
      setUser(mockUser)
      localStorage.setItem('kronium_mock_user', JSON.stringify(mockUser))
      return { error: null }
    }
  }

  // ── Sign out ───────────────────────────────────────────────────────────────
  const signOut = async () => {
    if (hasSupabase && supabase) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem('kronium_mock_user')
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithDiscord, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
