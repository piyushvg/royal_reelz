'use client'

import { useAuth } from '@payloadcms/ui'
import React, { useEffect } from 'react'

/**
 * Customers must never land on the admin panel (they would only see "Unauthorized").
 * If a signed-in customer opens any /admin link, send them straight to their own portal.
 */
export const CustomerRedirect: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()

  useEffect(() => {
    if (user && (user as { role?: string }).role === 'customer') {
      window.location.replace('/portal.html')
    }
  }, [user])

  // Small admin UI helpers (staff): a clear (x) button inside every list search bar.
  useEffect(() => {
    const CLEAR_SVG =
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
    const setValue = (input: HTMLInputElement, value: string) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      setter?.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
    const attach = () => {
      document.querySelectorAll<HTMLInputElement>('.search-filter .search-filter__input, .search-filter input').forEach((input) => {
        if (input.dataset.rrClear) return
        const wrap = input.closest('.search-filter') as HTMLElement | null
        if (!wrap) return
        input.dataset.rrClear = '1'
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'rr-search-clear'
        btn.setAttribute('aria-label', 'Clear search')
        btn.title = 'Clear search'
        btn.innerHTML = CLEAR_SVG
        btn.addEventListener('click', () => {
          setValue(input, '')
          input.focus()
        })
        wrap.appendChild(btn)
        ;(btn as any)._input = input
      })
    }
    const sync = () => {
      document.querySelectorAll<HTMLButtonElement>('.rr-search-clear').forEach((btn) => {
        const input = (btn as any)._input as HTMLInputElement | undefined
        btn.style.display = input && input.value ? 'flex' : 'none'
      })
    }
    attach()
    sync()
    const mo = new MutationObserver(() => {
      attach()
      sync()
    })
    mo.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('input', sync, true)
    const timer = window.setInterval(sync, 500)
    return () => {
      mo.disconnect()
      document.removeEventListener('input', sync, true)
      window.clearInterval(timer)
    }
  }, [])

  return <>{children}</>
}