'use server'

import { generateText } from 'ai'
import type { GenericResponse } from '@action/types'
import getProvider from '@ai/provider'

export interface GenerateTitleParams {
  /** Full text of the first user message */
  message: string
}

export interface GenerateTitleResult extends GenericResponse {
  /** One-line short title summarizing the message */
  result?: string
}

/**
 * Generates a concise (max ~6 words) title summarizing the provided message.
 * Utilises Google Gemini 2.0-Flash-Lite via the shared {@link getProvider} helper.
 */
export async function generateTitleAction({
  message
}: GenerateTitleParams): Promise<GenerateTitleResult> {
  const body = message.trim()
  if (!body) {
    return { ok: false, message: 'Message text is required' }
  }

  try {
    const { text } = await generateText({
      model: getProvider({
        provider: 'gemini',
        model: 'gemini-2.0-flash-lite'
      }),
      prompt: `Provide a very short (\u003c=6 words) descriptive title for the following user message.\nMessage: "${body}"\nTitle:`
    })

    return {
      ok: true,
      message: 'Title generated',
      result: text.trim().replace(/^["'`]|["'`]$/g, '') // strip wrapping quotes if any
    }
  } catch (error) {
    console.error('generateTitleAction error', error)
    return { ok: false, message: 'Failed to generate title' }
  }
}
