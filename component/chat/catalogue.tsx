'use client'
import '@scss/chat/catalogue.scss'
import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { type ProviderName } from '@ai/provider'
import {
  IconBulb,
  IconGemini,
  IconOpenAI,
  IconSearch,
  IconXAI
} from '@component/shared/icon'
import { useSession } from '@context/session'
import { PROVIDERS } from '@util/providers'
import { supportsReasoning, supportsSearch } from '@util/support'

export default function ModelCatalogue() {
  const {
    model: selectedModel,
    setModel,
    reasoning,
    setReasoning,
    useSearchGrounding,
    setUseSearchGrounding
  } = useSession()
  const [visible, setVisible] = useState(false)
  const [reasonToggle, setReasonToggle] = useState(false)
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const reasonToggleRef = useRef<HTMLButtonElement | null>(null)
  const [filter, setFilter] = useState('')
  const reasonMenuRef = useRef<HTMLDivElement | null>(null)

  const filteredProviders = PROVIDERS.map((p) => {
    const query = filter.toLowerCase()
    const models = p.models.filter((m) =>
      `${m.label} ${m.value}`.toLowerCase().includes(query)
    )
    return { ...p, models }
  }).filter((p) => p.models.length > 0 || filter.trim() === '')

  const handleDocumentClick = useCallback((evt: MouseEvent) => {
    const target = evt.target as Node
    if (
      (toggleRef.current && toggleRef.current.contains(target)) ||
      (menuRef.current && menuRef.current.contains(target)) ||
      (reasonToggleRef.current && reasonToggleRef.current.contains(target)) ||
      (reasonMenuRef.current && reasonMenuRef.current.contains(target))
    ) {
      return
    }
    setVisible(false)
    setReasonToggle(false)
  }, [])

  useEffect(() => {
    if (!visible && !reasonToggle) return
    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [visible, reasonToggle, handleDocumentClick])

  function closeThen<T extends HTMLElement>(
    original?: (e: ReactMouseEvent<T>) => void
  ): (e: ReactMouseEvent<T>) => void {
    return (e) => {
      original?.(e)
      setVisible(false)
    }
  }

  const handleSelect = (provider: ProviderName, modelName: string) => {
    setModel({ provider, model: modelName })
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
          <input
            type="text"
            placeholder="Filter Catalogue..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {filteredProviders.map((provider) => (
          <div key={provider.provider} className="cat-group">
            <div className="cat-header">
              {provider.Icon}
              <h3>{provider.display}</h3>
            </div>
            <div className="cat-models">
              {provider.models.map((model) => (
                <button
                  key={model.value}
                  type="button"
                  onClick={closeThen(() =>
                    handleSelect(provider.provider, model.value)
                  )}
                >
                  {provider.Icon}
                  {model.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="model-options">
        <button
          type="button"
          className="model-selector"
          ref={toggleRef}
          onClick={() => setVisible(!visible)}
        >
          {selectedModel.provider === 'openai' && <IconOpenAI />}
          {selectedModel.provider === 'gemini' && <IconGemini />}
          {selectedModel.provider === 'xai' && <IconXAI />}
          {selectedModel.model.replaceAll('-', ' ')}
        </button>

        {supportsReasoning(selectedModel.provider, selectedModel.model) && (
          <div className="reason-wrapper">
            <div
              ref={reasonMenuRef}
              className={`reason-dropdown ${reasonToggle ? 'visible' : 'invisible'}`}
            >
              <button
                type="button"
                onClick={() => {
                  setReasoning('low')
                  setReasonToggle(false)
                }}
              >
                <IconBulb /> Low
              </button>
              <button
                type="button"
                onClick={() => {
                  setReasoning('medium')
                  setReasonToggle(false)
                }}
              >
                <IconBulb /> Medium
              </button>
              <button
                type="button"
                onClick={() => {
                  setReasoning('high')
                  setReasonToggle(false)
                }}
              >
                <IconBulb /> High
              </button>
            </div>
            <button
              type="button"
              ref={reasonToggleRef}
              onClick={() => setReasonToggle(!reasonToggle)}
            >
              <IconBulb />
              {reasoning}
            </button>
          </div>
        )}

        {supportsSearch(selectedModel.provider) && (
          <button
            type="button"
            className={`model-grounding ${useSearchGrounding ? 'active' : ''}`}
            onClick={() => setUseSearchGrounding((prev) => !prev)}
          >
            <IconSearch />
            Search {useSearchGrounding ? 'On' : 'Off'}
          </button>
        )}
      </div>
    </>
  )
}
