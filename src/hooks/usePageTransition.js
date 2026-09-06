import { useRef, useEffect } from 'react'

/**
 * Returns a ref to attach to a container div.
 * Whenever `key` changes, the container re-plays the page-transition animation.
 *
 * Usage:
 *   const containerRef = usePageTransition(selected)
 *   return <div ref={containerRef}> ... </div>
 */
export function usePageTransition(key) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.remove('page-transition')
    void el.offsetWidth // force reflow so the browser re-starts the animation
    el.classList.add('page-transition')
  }, [key])

  return ref
}
