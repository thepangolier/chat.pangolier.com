import '@scss/chat/splash.scss'
import Image from 'next/image'
import { useCallback } from 'react'
import Logo from '@assets/img/logo.png'
import { IconBulb } from '@component/shared/icon'
import { title } from '@util/metadata'

export interface ChatSplashProps {
  setInput: (input: string) => void
}

export default function ChatSplash({ setInput }: ChatSplashProps) {
  const selectPrompt = useCallback(
    (prompt: string) => {
      setInput(prompt)
      const textarea = document.querySelector(
        'textarea#prompt-input'
      ) as HTMLTextAreaElement | null
      textarea?.focus()
    },
    [setInput]
  )
  return (
    <div id="chat-splash">
      <div className="splash-brand">
        <Image src={Logo} alt="Logo" />
        {title}
      </div>
      <p className="copy">
        A free, open-source chat app built for seamless collaboration
      </p>

      <div className="options">
        <button onClick={() => selectPrompt('Learn about the history of Mars')}>
          <IconBulb />
          Learn about the history of Mars
        </button>
        <button onClick={() => selectPrompt("What is Riemann's Hypothesis?")}>
          <IconBulb />
          What is Riemann&apos;s Hypothesis?
        </button>
        <button
          onClick={() =>
            selectPrompt('Give me a historical timeline of John Cena')
          }
        >
          <IconBulb />
          Give me a historical timeline of John Cena
        </button>
        <button
          onClick={() =>
            selectPrompt('What does the phrase "Who is John Galt" mean?')
          }
        >
          <IconBulb />
          What does the phrase &quot;Who is John Galt&quot; mean?
        </button>
      </div>
    </div>
  )
}
