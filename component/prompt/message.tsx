import '@scss/prompt/messages.scss'
import type { Message, UIMessage } from 'ai'
import { useState } from 'react'
import Markdown from 'react-markdown'
import GFM from 'remark-gfm'
import { IconChevron } from '@component/shared/icon'

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
  const [open, setOpen] = useState(true)

  return (
    <div className="model-reasoning" data-key={id}>
      <button className="reasoning-toggle" onClick={() => setOpen(!open)}>
        <p>Model Reasoning</p>
        <IconChevron
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(90deg)' }}
        />
      </button>

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
