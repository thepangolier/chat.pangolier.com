import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createXai } from '@ai-sdk/xai'

// Default model versions for each supported provider.
const DEFAULT_MODELS = {
  openai: 'o4-mini',
  xai: 'grok-3-mini',
  gemini: 'gemini-2.0-flash'
}

export type ProviderName = 'openai' | 'xai' | 'gemini'

export interface ProviderOptions {
  /** Which AI provider to use. */
  provider?: ProviderName
  /** The model identifier for the provider. Uses a sensible default when omitted. */
  model?: string
  /** Enable Google Search Grounding for Gemini models. */
  useSearchGrounding?: boolean
}

// Instantiate SDK clients up-front for performance.
const xai = createXai({
  apiKey: process.env.XAI_API_KEY as string
})

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY as string
})

const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY as string
})

/**
 * Returns a model instance for the requested provider.
 *
 * @example
 *   const model = getProvider() // => xai (default)
 *   const model = getProvider({ provider: 'openai' })
 *   const model = getProvider({ provider: 'gemini', model: 'gemini-2.0-flash' })
 */
export default function getProvider({
  provider = 'xai',
  model,
  useSearchGrounding
}: ProviderOptions = {}) {
  const chosenProvider = provider ?? 'xai'
  const chosenModel = model ?? DEFAULT_MODELS[chosenProvider]

  switch (chosenProvider) {
    case 'openai':
      return openai(chosenModel)
    case 'gemini':
      return gemini(chosenModel, {
        useSearchGrounding: useSearchGrounding || false
      })
    case 'xai':
    default:
      return xai(chosenModel)
  }
}
