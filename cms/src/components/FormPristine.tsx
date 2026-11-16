'use client'

import { useForm, useFormModified } from '@payloadcms/ui'
import React, { useEffect, useRef } from 'react'

/**
 * Some fields (date pickers, selects, uploads) "touch" their own value while a form opens, which makes
 * Payload think the form was changed and show "Leave without saving?" when you only click a tab such as
 * "API" or a menu link. This keeps the form pristine until the user really edits something.
 */
export const FormPristine: React.FC = () => {
  const { setModified } = useForm()
  const raw: any = useFormModified()
  const modified = Array.isArray(raw) ? Boolean(raw[0]) : Boolean(raw)
  const edited = useRef(false)

  useEffect(() => {
    const mark = (e: Event) => {
      if (!e.isTrusted) return
      const target = e.target as Element | null
      if (e.type === 'keydown') {
        const k = e as KeyboardEvent
        if (k.ctrlKey || k.metaKey || ['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'Escape', 'CapsLock'].includes(k.key)) return
      }
      // clicking a link / tab / menu is navigation, not editing
      if (e.type === 'pointerdown' && target?.closest?.('a, nav, [class*="doc-tabs"]')) return
      edited.current = true
    }
    const events = ['keydown', 'paste', 'input', 'change', 'drop', 'pointerdown']
    events.forEach((n) => document.addEventListener(n, mark, true))
    return () => events.forEach((n) => document.removeEventListener(n, mark, true))
  }, [])

  useEffect(() => {
    if (modified && !edited.current) setModified(false)
  }, [modified, setModified])

  return null
}