'use client'
import '@scss/chat/prompt.scss'
import type { ChatRequestOptions } from 'ai'
import ModelCatalogue from '@component/chat/catalogue'
import ChatScroller from '@component/chat/scroller'
import { IconSend, IconStop } from '@component/shared/icon'

export interface PromptBarProps {
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  error: Error | undefined
  input: string
  setInput(v: string): void
  handleSubmit(
    event?: { preventDefault?: () => void },
    chatRequestOptions?: ChatRequestOptions
  ): void
  stop(): void
  experimental_resume(): void
}

export default function PromptBar({
  status,
  error,
  input,
  setInput,
  handleSubmit,
  stop
}: PromptBarProps) {
  return (
    <div id="prompt">
      {status === 'error' && (
        <div className="prompt-error">
          <p>
            {error
              ? error.message
              : 'Something went wrong, please try again...'}
          </p>
        </div>
      )}
      <ChatScroller />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (input.trim()) {
            handleSubmit()
          }
        }}
        className={status}
      >
        <textarea
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (input.trim()) {
                e.currentTarget.blur()
                handleSubmit()
              } else {
                setInput('')
              }
            }
          }}
        />
        <ModelCatalogue />
        <button
          type={status === 'ready' ? 'submit' : 'button'}
          className="button-send"
          onClick={() => {
            if (status === 'streaming') {
              stop()
            }
          }}
        >
          {status !== 'ready' ? <IconStop /> : <IconSend />}
        </button>
      </form>
    </div>
  )
}
