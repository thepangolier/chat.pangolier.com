'use client'
import '@scss/generic/popup.scss'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

/**
 * Props for the Popup component.
 *
 * @property visible - Controls whether the popup is visible.
 * @property setVisible - Callback to update the visibility state.
 * @property style - Layout style variant ('normal' or 'centered').
 * @property children - Elements rendered inside the popup.
 */
export interface PopupProps {
  visible?: boolean
  setVisible?(v: boolean): void
  style?: 'normal' | 'centered'
  children: ReactNode
}

/**
 * Popup component that renders an overlay and content container.
 * When clicking, tapping, or pressing Enter/Space outside the content,
 * it closes the popup. Visibility remains in the DOM for CSS transitions.
 *
 * @param visible - Whether the popup is visible.
 * @param setVisible - Function to toggle visibility.
 * @param style - Visual style ('normal' or 'centered').
 * @param children - Content to display inside the popup.
 */
export default function Popup({
  visible = false,
  setVisible,
  style = 'normal',
  children
}: PopupProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  /**
   * Closes the popup if the event target is outside the content area.
   */
  const handleOverlayAction = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      setVisible?.(false)
    }
  }

  // Close on Escape key when visible
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible?.(false)
      }
    }
    if (visible) {
      window.addEventListener('keydown', onKey)
    }
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [visible, setVisible])

  return (
    <div
      className={`popup popup-${style} ${visible ? 'popup-visible' : 'popup-hidden'}`}
      role="button"
      tabIndex={0}
      aria-hidden={!visible}
      onClick={handleOverlayAction}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleOverlayAction(e)
        }
      }}
    >
      <div
        className="popup-content"
        ref={contentRef}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
