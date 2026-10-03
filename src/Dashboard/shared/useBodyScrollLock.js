import { useEffect } from 'react'

// Module-level (not per-component) so nested overlays share one counter —
// e.g. a ConfirmDialog opened from inside a Modal (SubcategoryEditor does
// this). Without a shared counter, closing the inner one would restore
// the body styles while the outer one is still open.
let lockCount = 0
let savedScrollY = 0
let previousPosition = ''
let previousTop = ''
let previousWidth = ''
let previousOverflow = ''

/**
 * Prevents the page behind a full-screen overlay from scrolling while the
 * overlay is open, using the position:fixed + top-offset technique (safe
 * on iOS Safari, unlike a plain `overflow: hidden`). Safe to use from
 * multiple overlays at once — only the outermost lock/unlock actually
 * touches `document.body`.
 *
 * @param {boolean} isOpen - whether this overlay is currently open
 */
export default function useBodyScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen) return undefined

    if (lockCount === 0) {
      savedScrollY = window.scrollY
      const { body } = document
      previousPosition = body.style.position
      previousTop = body.style.top
      previousWidth = body.style.width
      previousOverflow = body.style.overflow

      body.style.position = 'fixed'
      body.style.top = `-${savedScrollY}px`
      body.style.width = '100%'
      body.style.overflow = 'hidden'
    }
    lockCount += 1

    return () => {
      lockCount -= 1
      if (lockCount === 0) {
        const { body } = document
        body.style.position = previousPosition
        body.style.top = previousTop
        body.style.width = previousWidth
        body.style.overflow = previousOverflow
        window.scrollTo(0, savedScrollY)
      }
    }
  }, [isOpen])
}
