'use client'
import '@scss/home/mock.scss'
import '@scss/chat/messages.scss'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import GFM from 'remark-gfm'
import Logo from '@assets/img/logo.png'
import script from '@component/home/script'
import {
  IconBulb,
  IconCopy,
  IconEllipsis,
  IconPencil,
  IconSend,
  IconXAI
} from '@component/shared/icon'

export default function MockApp() {
  // Progressive rendering state
  const [messages, setMessages] = useState<
    { id: string; role: string; content: string }[]
  >([])
  const [idx, setIdx] = useState(0)
  const [streamText, setStreamText] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Reveal conversation progressively
  useEffect(() => {
    if (idx >= script.length) return

    const current = script[idx]

    // If assistant message -> stream word by word
    if (current.role === 'assistant') {
      const words = current.content.split(' ')
      let wIdx = 0
      const interval = setInterval(() => {
        wIdx += 1
        setStreamText(words.slice(0, wIdx).join(' '))
        if (wIdx === words.length) {
          clearInterval(interval)
          setMessages((prev) => [...prev, current])
          setStreamText('')
          setTimeout(() => setIdx((i) => i + 1), 1000)
        }
      }, 60) // 60ms per word
      return () => clearInterval(interval)
    }

    // For user message: push immediately then advance after short delay
    setMessages((prev) => [...prev, current])
    const t = setTimeout(() => setIdx((i) => i + 1), 1000)
    return () => clearTimeout(t)
  }, [idx])

  // Auto-scroll to bottom whenever messages update or during streaming
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, streamText])

  return (
    <div id="mock">
      <div className="mock-frame">
        <div className="mock-frame-header">
          <button className="red" />
          <button className="yellow" />
          <button className="green" />

          <div className="url-bar">https://chat.pangolier.com</div>
        </div>
        <div className="mock-content">
          <div className="mock-header">
            <div className="brand">
              <Image src={Logo} alt="Logo" priority />
            </div>

            <div className="main-menu">
              <div className="mopt">
                <IconCopy />
              </div>
              <div className="mopt">
                <IconPencil />
              </div>
              <div className="mopt">
                <IconEllipsis />
              </div>
            </div>
          </div>

          <div className="mock-prompt">
            <div className="mock-prompt-form">
              <textarea placeholder="Type your message here..." />

              <div className="model-options">
                <button className="button-model">
                  <IconXAI /> Grok 3 Mini
                </button>

                <button className="button-model">
                  <IconBulb /> High
                </button>
              </div>

              <button className="send">
                <IconSend />
              </button>
            </div>
          </div>

          <div className="mock-messages" ref={containerRef}>
            {messages.map((m) => (
              <div key={m.id} className={`message ${m.role}`} data-id={m.id}>
                <Markdown remarkPlugins={[GFM]}>{m.content}</Markdown>
              </div>
            ))}
            {streamText && (
              <div className="message assistant streaming">
                <Markdown remarkPlugins={[GFM]}>{streamText}</Markdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
