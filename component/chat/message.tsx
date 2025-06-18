import '@scss/chat/messages.scss'
import type { Message, UIMessage } from 'ai'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import Markdown from 'react-markdown'
import { toast } from 'react-toastify'
import GFM from 'remark-gfm'
import { branchThreadAction } from '@action/chat/branch'
import {
  IconBranch,
  IconBulb,
  IconChevron,
  IconCopy
} from '@component/shared/icon'
import { useSession } from '@context/session'

export interface ReasoningPartProps {
  reasoning: string
  id: string
}

export function ReasoningPart({ reasoning, id }: ReasoningPartProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="model-reasoning"
      data-key={id}
      onClick={() => setOpen(!open)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          setOpen(!open)
        }
      }}
    >
      <div className="reasoning-toggle">
        <p>
          <IconBulb />
          Thoughts
        </p>
        <IconChevron />

        <div className="tooltip">
          {open ? 'Click to collapse' : 'Click to expand'}
        </div>
      </div>

      {open && (
        <div className="model-reasoning-content">
          <Markdown remarkPlugins={[GFM]}>{reasoning}</Markdown>
        </div>
      )}
    </div>
  )
}

export interface MessageProps {
  message: UIMessage | Message
  threadId: number | undefined
  status: 'submitted' | 'streaming' | 'ready' | 'error'
}

export default function Message({ message, threadId, status }: MessageProps) {
  const router = useRouter()
  const { account } = useSession()

  const handleBranch = useCallback(async () => {
    // Ensure we have a persisted thread id
    if (!threadId) {
      toast.error('Thread not yet saved')
      return
    }
    const res = await branchThreadAction({
      threadId: threadId,
      accountId: account.id
    })
    if (!res.ok || !res.newThreadId) {
      toast.error(res.message ?? 'Failed to branch')
      return
    }
    toast.success('Branched to new thread')
    router.push(`/chat/thread/${res.newThreadId}`)
  }, [threadId, account.id, router])

  return (
    <div className={`message ${message.role}`} data-id={message.id}>
      {message.parts ? (
        message.parts.map((part, idx) => {
          switch (part.type) {
            case 'reasoning':
              return (
                <ReasoningPart
                  key={`reasoning-${message.id}-${idx}`}
                  reasoning={part.reasoning}
                  id={`${message.id}-${idx}`}
                />
              )
            case 'text':
              return (
                <Markdown
                  remarkPlugins={[GFM]}
                  key={`text-${message.id}-${idx}`}
                >
                  {part.text}
                </Markdown>
              )
          }
        })
      ) : (
        <Markdown remarkPlugins={[GFM]}>{message.content}</Markdown>
      )}

      {message.role === 'assistant' && (
        <div className={`message-options ${status}`}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(message.content)
              toast.success('Copied to clipboard')
            }}
          >
            <IconCopy />
            <div className="tooltip">Copy Response</div>
          </button>
          <button onClick={handleBranch} className="button-branch">
            <IconBranch />
            <div className="tooltip">Branch Off</div>
          </button>
        </div>
      )}
    </div>
  )
}
