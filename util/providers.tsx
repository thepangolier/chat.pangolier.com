import { type ReactNode } from 'react'
import type { ProviderName } from '@ai/provider'
import { IconGemini, IconOpenAI, IconXAI } from '@component/shared/icon'

export interface ModelEntry {
  value: string
  label: string
}

export interface ProviderEntry {
  provider: ProviderName
  display: string
  Icon: ReactNode
  models: ModelEntry[]
}

export const PROVIDERS: ProviderEntry[] = [
  {
    provider: 'openai',
    display: 'OpenAI',
    Icon: <IconOpenAI />,
    models: [
      { value: 'gpt-4.1', label: '4.1' },
      { value: 'gpt-4o', label: '4o' },
      { value: 'o3', label: 'o3' },
      { value: 'o4-mini', label: 'o4 mini' }
    ]
  },
  {
    provider: 'gemini',
    display: 'Gemini',
    Icon: <IconGemini />,
    models: [
      { value: 'gemini-2.5-flash-preview-05-20', label: '2.5 Flash' },
      { value: 'gemini-2.5-pro-preview-06-05', label: '2.5 Pro' },
      { value: 'gemini-2.0-flash', label: '2.0 Flash' },
      { value: 'gemini-2.0-pro', label: '2.0 Pro' },
      { value: 'gemini-2.0-flash-lite', label: '2.0 Lite' }
    ]
  },
  {
    provider: 'xai',
    display: 'xAI',
    Icon: <IconXAI />,
    models: [
      { value: 'grok-3-mini', label: 'Grok 3 Mini' },
      { value: 'grok-3', label: 'Grok 3' }
    ]
  }
]
