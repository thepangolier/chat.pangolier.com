import '@scss/chat/scroller.scss'
import { useCallback, useEffect, useState } from 'react'

/**
 * ChatScroller
 *
 * A floating "Scroll to Bottom" button that appears only when the user is NOT at the bottom
 * of the page. While the user is at the bottom and new messages arrive (increasing the
 * document height), the page will automatically keep scrolling to the bottom so the user
 * always sees the latest message.
 */
export default function ChatScroller() {
  // Whether the button should be visible. When `true`, user is *not* at the bottom.
  const [showButton, setShowButton] = useState(false)

  /**
   * Determines if the viewport is at (or very near) the bottom of the page.
   */
  const isAtBottom = useCallback(() => {
    const threshold = 100
    return (
      window.innerHeight + window.scrollY >=
      document.body.scrollHeight - threshold
    )
  }, [])

  /**
   * Update the visibility of the button based on current scroll position.
   */
  const updateButtonVisibility = useCallback(() => {
    setShowButton(!isAtBottom())
  }, [isAtBottom])

  useEffect(() => {
    // Initial check (in case page loads scrolled somewhere in the middle)
    updateButtonVisibility()

    const handleScroll = () => {
      updateButtonVisibility()
    }

    // Listen to manual scrolling
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Observe changes to <body> height so we can auto-scroll when new messages push the
    // bottom further down while the user is already at the bottom.
    const resizeObserver = new ResizeObserver(() => {
      if (isAtBottom()) {
        // Keep user glued to bottom as new content streams in
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        })
      }
    })

    resizeObserver.observe(document.body)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      resizeObserver.disconnect()
    }
  }, [updateButtonVisibility, isAtBottom])

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

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
