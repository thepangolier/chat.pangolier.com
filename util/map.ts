import type { UIMessage } from 'ai'
import type { PersistedMessage } from '@action/chat/send'
import type { ReasoningUIPart, TextUIPart } from '@ai-sdk/ui-utils'

/*
 * Converts raw `PersistedMessage` rows from the DB into the
 * `UIMessage` shape that `useChat` expects.
 *
 * @param messages – Persisted chat rows.
 * @returns       – Normalised UI messages ready for the UI store.
 */
export default function mapMessages(messages: PersistedMessage[]): UIMessage[] {
  return messages.map(({ id, role, content, parts }) => {
    const mappedRole = (role === 'tool' ? 'data' : role) as UIMessage['role']

    const normalisedParts: (TextUIPart | ReasoningUIPart)[] = parts?.length
      ? parts.map((p) =>
          p.type === 'reasoning'
            ? ({
                type: 'reasoning',
                reasoning: p.reasoning ?? '',
                details: []
              } satisfies ReasoningUIPart)
            : ({
                type: 'text',
                text: p.text ?? ''
              } satisfies TextUIPart)
        )
      : [
          {
            type: 'text',
            text:
              typeof content === 'string' ? content : JSON.stringify(content)
          }
        ]

    const aggregatedContent = normalisedParts
      .map((p) => (p.type === 'text' ? p.text : p.reasoning))
      .filter(Boolean)
      .join('\n')

    return {
      id,
      role: mappedRole,
      content: aggregatedContent,
      parts: normalisedParts
    }
  })
}
