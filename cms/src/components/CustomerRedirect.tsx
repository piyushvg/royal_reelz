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

  // Layout helpers that do not depend on Payload's internal class names (they find elements by their text),
  // so they behave the same in Chrome, Edge, Firefox and Safari.
  useEffect(() => {
    const URL_RE = /^https?:\/\/\S+$/i
    const INFO_RE = /\d+\s*[-\u2013]\s*\d+\s+of\s+\d+/i

    const childOf = (el: HTMLElement, wrap: HTMLElement) => {
      let c: HTMLElement = el
      while (c.parentElement && c.parentElement !== wrap) c = c.parentElement
      return c
    }

    // 1) Pagination: page numbers left, "x-y of n" and "Per Page" together on the right, one row.
    const fixPagination = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node: Node | null
      while ((node = walker.nextNode())) {
        if (!/^\s*Per Page/i.test(node.nodeValue || '')) continue
        let per = node.parentElement as HTMLElement | null
        const own = (node.nodeValue || '').trim().length
        while (per && per.parentElement && (per.parentElement.textContent || '').trim().length <= own + 4) per = per.parentElement
        if (!per) continue
        let wrap = per.parentElement as HTMLElement | null
        let guard = 0
        while (wrap && guard++ < 6 && !INFO_RE.test(wrap.textContent || '') && !wrap.querySelector('[class*="paginator"]')) wrap = wrap.parentElement
        if (!wrap || wrap === document.body || wrap.dataset.rrPg === '1') continue
        wrap.dataset.rrPg = '1'
        Object.assign(wrap.style, {
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          columnGap: '1.5rem', rowGap: '0.5rem', width: '100%',
        })
        const perChild = childOf(per, wrap)
        Array.from(wrap.children).forEach((c) => {
          const el = c as HTMLElement
          if (el === perChild) {
            el.style.marginLeft = INFO_RE.test(wrap!.textContent || '') && wrap!.children.length > 2 ? '0' : 'auto'
            el.style.whiteSpace = 'nowrap'
          } else if (INFO_RE.test(el.textContent || '')) {
            el.style.marginLeft = 'auto'
            el.style.whiteSpace = 'nowrap'
          }
        })
      }
    }

    // 2) Links: any URL shown in a list cell or typed in a text field gets a clear "Open" link (new tab).
    const mkLink = (href: string) => {
      const a = document.createElement('a')
      a.className = 'rr-open-link'
      a.href = href
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.textContent = 'Open link \u2197'
      return a
    }
    const linkify = () => {
      document.querySelectorAll<HTMLElement>('td').forEach((td) => {
        const t = (td.textContent || '').trim()
        const has = td.querySelector('a.rr-open-link')
        if (URL_RE.test(t.replace(/\s*Open link.*$/, ''))) {
          const url = t.replace(/\s*Open link.*$/, '')
          if (!has && !td.querySelector('a')) td.appendChild(mkLink(url))
        } else if (has) has.remove()
      })
      document.querySelectorAll<HTMLInputElement>('.document-fields input[type="text"], form input[type="text"]').forEach((inp) => {
        const box = (inp.closest('.field-type') as HTMLElement | null) || inp.parentElement
        if (!box) return
        const v = (inp.value || '').trim()
        const has = box.querySelector(':scope > a.rr-open-link') as HTMLAnchorElement | null
        if (URL_RE.test(v)) {
          if (has) has.href = v
          else box.appendChild(mkLink(v))
        } else if (has) has.remove()
      })
    }

    let queued = false
    const run = () => {
      queued = false
      try {
        fixPagination()
        linkify()
      } catch {
        /* never break the admin because of a cosmetic helper */
      }
    }
    const schedule = () => {
      if (queued) return
      queued = true
      window.setTimeout(run, 150)
    }
    run()
    const mo = new MutationObserver(schedule)
    mo.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('input', schedule, true)
    return () => {
      mo.disconnect()
      document.removeEventListener('input', schedule, true)
    }
  }, [])

  return <>{children}</>
}