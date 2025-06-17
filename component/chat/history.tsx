'use client'
import '@scss/chat/history.scss'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { listThreadsAction, type ThreadSummary } from '@action/chat/list'
import { IconChat } from '@component/shared/icon'
import { useSession } from '@context/session'

export default function ChatHistory() {
  const { account, historyPopup, setHistoryPopup } = useSession()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState('')
  const [threads, setThreads] = useState<ThreadSummary[]>([])

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

  // Fetch thread list whenever the history popup opens or the query changes
  useEffect(() => {
    if (!historyPopup) return
    ;(async () => {
      const res = await listThreadsAction({ accountId: account.id, query })
      if (res.ok && res.result) setThreads(res.result)
    })()
  }, [historyPopup, account.id, query])

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
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <IconChat />
        </div>
        <div className="history-data">
          <div className="history-threads">
            {threads.map((thread) => (
              <Link
                href={`/chat/thread/${thread.id}`}
                key={thread.id}
                onClick={() => {
                  setHistoryPopup(false)
                }}
              >
                <p className="timestamp">
                  {thread.lastMessageAt
                    ? new Date(thread.lastMessageAt).toDateString()
                    : ''}
                </p>
                <p className="title">{thread.title}</p>
              </Link>
            ))}
          </div>
          <div className="history-tree"></div>
        </div>
      </div>
    </div>
  )
}
