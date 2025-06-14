'use client'
import '@scss/chat/prompt.scss'
import type { ChatRequestOptions } from 'ai'
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
  handleSubmit
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
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className={status}
      >
        <textarea
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              e.currentTarget.blur()
              handleSubmit()
            }
          }}
        />
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
