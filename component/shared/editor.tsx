'use client'
import '@blocknote/mantine/style.css'
import React, { type KeyboardEventHandler, useEffect, useRef } from 'react'
import {
  BlockNoteSchema,
  type BlockSpecs,
  defaultBlockSpecs,
  defaultInlineContentSpecs
} from '@blocknote/core'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'

/**
 * Runtime handle returned via `onReady`.
 *
 * @property getValue - Returns the current markdown.
 * @property setValue - Replaces the editor content with the provided markdown.
 * @property reset    - Clears the editor.
 */
export interface EditorHandle {
  getValue(): Promise<string>
  setValue(markdown: string): Promise<void>
  reset(): void
}

/**
 * Props accepted by the `Editor` component.
 *
 * @property placeholder - Placeholder when empty.
 * @property value       - Initial markdown. Hydrated once.
 * @property onKeyDown   - Key-down handler.
 * @property editable    - Toggles editability.
 * @property onReady     - Fires when the editor instance is ready.
 */
export interface EditorProps {
  placeholder?: string
  value?: string
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>
  editable?: boolean
  onReady?: (handle: EditorHandle) => void
}

const blockSpecs: BlockSpecs = {}
for (const key of Object.keys(defaultBlockSpecs)) {
  if (
    key === 'file' ||
    key === 'video' ||
    key === 'audio' ||
    key === 'image' ||
    key === 'table'
  ) {
    continue
  }
  blockSpecs[key] = defaultBlockSpecs[key as keyof typeof defaultBlockSpecs]
}

const schema = BlockNoteSchema.create({
  blockSpecs,
  inlineContentSpecs: defaultInlineContentSpecs
})

export default function Editor({
  placeholder,
  value,
  onKeyDown,
  editable = true,
  onReady
}: EditorProps) {
  const editor = useCreateBlockNote({ schema })
  const hydrated = useRef(false)
  const readySent = useRef(false)

  useEffect(() => {
    const hydrate = async (): Promise<void> => {
      if (!editor || hydrated.current || value === undefined) return
      const blocks = await editor.tryParseMarkdownToBlocks(value)
      editor.replaceBlocks(editor.document, blocks)
      hydrated.current = true
    }

    const emitReady = (): void => {
      if (editor && onReady && !readySent.current) {
        readySent.current = true
        onReady({
          getValue: () => editor.blocksToMarkdownLossy(editor.document),
          setValue: async (markdown) => {
            const blocks = await editor.tryParseMarkdownToBlocks(markdown)
            editor.replaceBlocks(editor.document, blocks)
          },
          reset: () => editor.replaceBlocks(editor.document, [])
        })
      }
    }

    hydrate()
    emitReady()
  }, [editor, value, onReady])

  return (
    <div className="expression-editor">
      <BlockNoteView
        aria-placeholder={placeholder}
        theme="light"
        editor={editor}
        onKeyDown={onKeyDown}
        spellCheck={editable}
        editable={editable}
        sideMenu={false}
        formattingToolbar={false}
      />
    </div>
  )
}
