import '@scss/chat/messages.scss'
import type { Message, UIMessage } from 'ai'
import { useState } from 'react'
import Markdown from 'react-markdown'
import GFM from 'remark-gfm'
import { IconBulb, IconChevron } from '@component/shared/icon'

export interface MessageProps {
  message: UIMessage | Message
}

/*
 * Props for a single reasoning block that can be expanded /
 * collapsed by the user.
 *
 * @property reasoning - The raw markdown‐compatible reasoning text.
 * @property id        - Stable key for React rendering.
 */
interface ReasoningPartProps {
  reasoning: string
  id: string
}

/*
 * Collapsible wrapper for model-reasoning payloads.
 */
function ReasoningPart({ reasoning, id }: ReasoningPartProps) {
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

/*
 * Renders a single chat message.
 * – Regular text parts are shown immediately.
 * – Reasoning parts are hidden behind a toggle.
 */
export default function Message({ message }: MessageProps) {
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
    </div>
  )
}
