'use client'
import '@scss/chat/history.scss'
import Link from 'next/link'
import { useCallback, useEffect, useRef } from 'react'
import { IconChat } from '@component/shared/icon'
import { useSession } from '@context/session'

export default function ChatHistory() {
  const { historyPopup, setHistoryPopup } = useSession()
  const menuRef = useRef<HTMLDivElement | null>(null)

  const handleDocumentClick = useCallback(
    (evt: MouseEvent) => {
      const target = evt.target as Node
      if (menuRef.current && menuRef.current.contains(target)) {
        return
      }
      setHistoryPopup(false)
    },
    [setHistoryPopup]
  )

  useEffect(() => {
    if (!historyPopup) return
    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [historyPopup, handleDocumentClick])

  return (
    <div id="history" className={historyPopup ? 'visible' : 'invisible'}>
      <div
        className="history-content"
        ref={menuRef}
        onKeyDown={(e) => e.key === 'Escape' && setHistoryPopup(false)}
        role="menu"
        tabIndex={-1}
      >
        <div className="history-search">
          <input type="text" placeholder="Search..." />
          <IconChat />
        </div>
        <div className="history-data">
          <div className="history-threads">
            {new Array(5).fill(0).map((_, i) => (
              <Link href="/chat" key={i}>
                <p className="timestamp">
                  {new Date(1750028820431).toDateString()}
                </p>
                <p className="title">Lorem Ipsum Dolore et</p>
              </Link>
            ))}
          </div>
          <div className="history-tree"></div>
        </div>
      </div>
    </div>
  )
}
