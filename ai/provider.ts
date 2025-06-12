import { createXai } from '@ai-sdk/xai'

export const MODEL_VERSION = 'grok-3-mini-latest'

export const xai = createXai({
  apiKey: process.env.XAI_API_KEY as string
})

export default function getProvider(model = MODEL_VERSION) {
  return xai(model)
}
