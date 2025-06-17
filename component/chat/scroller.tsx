'use client'
import '@scss/chat/scroller.scss'
import { useEffect, useRef, useState } from 'react'

/*
 * Floating “Scroll to Bottom” helper that:
 * • Auto-scrolls only while the sentinel (page bottom) is visible.
 * • Lets the user scroll up freely during rapid streaming.
 * • Shows a button whenever history overflows and the user isn’t at the bottom.
 */
export default function ChatScroller() {
  /* ------------------------------------------------------------------ */
  /* State & refs                                                       */
  /* ------------------------------------------------------------------ */
  const [showButton, setShowButton] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const stickToBottomRef = useRef(true)

  /* ------------------------------------------------------------------ */
  /* Mount a sentinel at the very end of <body>                         */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // Create a 1 px-high marker so IntersectionObserver can track it.
    const sentinel = document.createElement('div')
    sentinel.style.cssText = 'height:1px;width:100%;'
    document.body.appendChild(sentinel)
    sentinelRef.current = sentinel

    /* IntersectionObserver → are we at the bottom? */
    const io = new IntersectionObserver(
      ([entry]) => {
        stickToBottomRef.current = entry.isIntersecting
        const overflowing =
          document.body.scrollHeight - window.innerHeight > 16 /* 1 rem */
        setShowButton(!entry.isIntersecting && overflowing)
      },
      { threshold: 0 } // any visibility counts
    )
    io.observe(sentinel)

    /* ResizeObserver → keep auto-scrolling while “stuck” to bottom */
    const ro = new ResizeObserver(() => {
      if (stickToBottomRef.current) {
        sentinel.scrollIntoView({ block: 'end', behavior: 'auto' })
      }
    })
    ro.observe(document.body)

    /* Cleanup */
    return () => {
      io.disconnect()
      ro.disconnect()
      document.body.removeChild(sentinel)
    }
  }, [])

  /* ------------------------------------------------------------------ */
  /* Handler: user-initiated scroll to bottom                           */
  /* ------------------------------------------------------------------ */
  const scrollToBottom = (): void => {
    sentinelRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <button
      id="scroll-to-bottom"
      className={showButton ? 'visible' : 'invisible'}
      onClick={scrollToBottom}
    >
      Scroll to Bottom
    </button>
  )
}
