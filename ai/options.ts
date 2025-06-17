import type { JSONValue } from 'ai'
import type { ProviderName } from '@ai/provider'
import type { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'
import { supportsReasoning } from '@util/support'

export type LanguageModelV1ProviderMetadata = Record<
  string,
  Record<string, JSONValue>
>

/*
 * Builds provider-specific reasoning / thinking options.
 */
export default function buildProviderOptions({
  provider,
  model,
  reasoning
}: {
  provider: ProviderName
  model?: string
  reasoning: 'low' | 'medium' | 'high'
}) {
  const providerOptions: LanguageModelV1ProviderMetadata = {}

  if (
    (provider === 'xai' || provider === undefined) &&
    supportsReasoning('xai', model)
  ) {
    providerOptions.xai = { reasoningEffort: reasoning }
  }

  if (provider === 'openai' && supportsReasoning('openai', model)) {
    providerOptions.openai = {
      reasoningEffort: reasoning,
      reasoningSummary: 'auto'
    }
  }

  if (provider === 'gemini' && supportsReasoning('gemini', model)) {
    providerOptions.google = {
      thinkingConfig: {
        thinkingBudget:
          reasoning === 'high' ? 2048 : reasoning === 'medium' ? 1024 : 512,
        includeThoughts: true
      }
    } satisfies GoogleGenerativeAIProviderOptions
  }

  return providerOptions
}
