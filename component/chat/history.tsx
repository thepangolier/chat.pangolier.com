'use client'
import '@scss/chat/history.scss'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getThreadMessagesAction } from '@action/chat/[id]'
import { listThreadsAction, type ThreadSummary } from '@action/chat/list'
import { type PersistedMessage } from '@action/chat/send'
import Message from '@component/chat/message'
import useDebounce from '@component/shared/debounce'
import { IconChat, IconSpinner } from '@component/shared/icon'
import { useSession } from '@context/session'
import MapMessages from '@util/map'

export default function ChatHistory() {
  const { account, historyPopup, setHistoryPopup } = useSession()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState('')
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewMessages, setPreviewMessages] = useState<PersistedMessage[]>([])
  const [previewThreadId, setPreviewThreadId] = useState<number | undefined>(
    undefined
  )
  const debouncedQuery = useDebounce(query, 500)

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

  const fetchPreview = useCallback(async (threadId: number) => {
    setPreviewLoading(true)
    setPreviewThreadId(threadId)
    const res = await getThreadMessagesAction({
      threadId,
      limit: 5
    })
    if (res.ok && res.result) {
      setPreviewMessages(res.result)
    }
    setPreviewLoading(false)
  }, [])

  // Callback to fetch the list of threads based on the current search query
  const fetchThreads = useCallback(async () => {
    setLoading(true)
    const res = await listThreadsAction({
      accountId: account.id,
      query: debouncedQuery
    })
    if (res.ok && res.result) {
      setThreads(res.result)
      // Auto-select and preview the first thread (if any)
      if (res.result.length > 0) {
        await fetchPreview(res.result[0].id)
      } else {
        // Reset preview state when there are no results
        setPreviewMessages([])
        setPreviewThreadId(undefined)
      }
    }
    setLoading(false)
  }, [account.id, debouncedQuery, fetchPreview])

  useEffect(() => {
    if (!historyPopup) return
    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [historyPopup, handleDocumentClick])

  useEffect(() => {
    if (!historyPopup) return
    setLoading(true)
    fetchThreads()
  }, [historyPopup, threads.length, fetchThreads])

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
            onChange={(e) => {
              setQuery(e.target.value)
              setLoading(true)
              setPreviewThreadId(undefined)
              setPreviewMessages([])
              setPreviewLoading(false)
            }}
          />
          <IconChat />
        </div>
        <div className="history-data">
          <div
            className={`history-loader ${loading ? 'visible' : 'invisible'}`}
          >
            <IconSpinner />
          </div>
          <div className="history-threads">
            {threads.map((thread) => (
              <Link
                href={`/chat/thread/${thread.id}`}
                key={thread.id}
                className={previewThreadId === thread.id ? 'active' : ''}
                onMouseEnter={() => fetchPreview(thread.id)}
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
          <div className="history-preview">
            <div
              className={`history-loader ${previewLoading ? 'visible' : 'invisible'}`}
            />
            {MapMessages(previewMessages).map((msg) => (
              <Message
                key={msg.id}
                message={msg}
                threadId={previewThreadId}
                status="ready"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
