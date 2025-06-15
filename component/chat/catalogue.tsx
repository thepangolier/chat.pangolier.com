'use client'
import '@scss/chat/catalogue.scss'
import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { IconGemini, IconOpenAI, IconXAI } from '@component/shared/icon'

export default function ModelCatalogue() {
  const [visible, setVisible] = useState(false)

  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const handleDocumentClick = useCallback((evt: MouseEvent) => {
    const target = evt.target as Node
    if (
      (toggleRef.current && toggleRef.current.contains(target)) ||
      (menuRef.current && menuRef.current.contains(target))
    ) {
      return
    }
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible) return
    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [visible, handleDocumentClick])

  function closeThen<T extends HTMLElement>(
    original?: (e: ReactMouseEvent<T>) => void
  ): (e: ReactMouseEvent<T>) => void {
    return (e) => {
      original?.(e)
      setVisible(false)
    }
  }

  return (
    <>
      <div
        id="catalogue"
        ref={menuRef}
        className={visible ? 'visible' : 'invisible'}
        onKeyDown={(e) => e.key === 'Escape' && setVisible(false)}
        role="menu"
        tabIndex={-1}
      >
        <div className="cat-main-header">
          <h2>Model Catalogue</h2>
          <input type="text" placeholder="Filter Catalogue..." />
        </div>

        <div className="cat-group">
          <div className="cat-header">
            <IconOpenAI />
            <h3>OpenAI</h3>
          </div>
          <div className="cat-models">
            <button onClick={closeThen()}>
              <IconOpenAI />
              4o-mini
            </button>
            <button onClick={closeThen()}>
              <IconOpenAI />
              4o
            </button>
            <button onClick={closeThen()}>
              <IconOpenAI />
              o3
            </button>
            <button onClick={closeThen()}>
              <IconOpenAI />
              o4-mini
            </button>
            <button onClick={closeThen()}>
              <IconOpenAI />
              o4-mini high
            </button>
          </div>
        </div>

        <div className="cat-group">
          <div className="cat-header">
            <IconGemini />
            <h3>Gemini</h3>
          </div>
          <div className="cat-models">
            <button onClick={closeThen()}>
              <IconGemini />
              2.5 Flash
            </button>
            <button onClick={closeThen()}>
              <IconGemini />
              2.5 Pro
            </button>
            <button onClick={closeThen()}>
              <IconGemini />
              2.0 Flash
            </button>
            <button onClick={closeThen()}>
              <IconGemini />
              2.0 Pro
            </button>
            <button onClick={closeThen()}>
              <IconGemini />
              2.0 Lite
            </button>
          </div>
        </div>

        <div className="cat-group">
          <div className="cat-header">
            <IconXAI />
            <h3>xAI</h3>
          </div>
          <div className="cat-models">
            <button onClick={closeThen()}>
              <IconXAI />
              Grok 3 Mini
            </button>
            <button onClick={closeThen()}>
              <IconXAI />
              Grok 3
            </button>
          </div>
        </div>
      </div>

      <button
        className="model-selector"
        ref={toggleRef}
        onClick={() => setVisible(!visible)}
      >
        <IconXAI />
        Grok 3 Mini
      </button>
    </>
  )
}
