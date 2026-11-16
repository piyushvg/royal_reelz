'use client'

import { useFormFields } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

type Media = { url?: string; thumbnailURL?: string; filename?: string; alt?: string; mimeType?: string }

const btn: React.CSSProperties = {
  display: 'inline-block',
  padding: '8px 16px',
  border: '1px solid #4a0a14',
  borderRadius: 999,
  color: '#4a0a14',
  background: '#fff',
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: 500,
}

// Always use a path on this site, even if the stored URL has another host or port.
const local = (u?: string) => {
  if (!u) return ''
  try {
    const x = new URL(u, window.location.origin)
    return x.pathname + x.search
  } catch {
    return u
  }
}

/** Edit form: preview of the selected image + "View full image" link (opens in a new tab). */
export const MediaPreviewField: React.FC<{ source?: string }> = ({ source }) => {
  const value = useFormFields(([fields]) => (source ? (fields as any)?.[source]?.value : undefined)) as
    | string
    | number
    | Media
    | null
    | undefined
  const [media, setMedia] = useState<Media | null>(null)

  useEffect(() => {
    let off = false
    if (!value) {
      setMedia(null)
      return
    }
    if (typeof value === 'object') {
      setMedia(value as Media)
      return
    }
    fetch(`/api/media/${value}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!off) setMedia(d)
      })
      .catch(() => {
        if (!off) setMedia(null)
      })
    return () => {
      off = true
    }
  }, [value])

  const url = local(media?.url)
  if (!url) return null
  const thumb = local(media?.thumbnailURL) || url

  return (
    <div style={{ margin: '0 0 1.5rem' }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Preview</div>
      <a href={url} target="_blank" rel="noopener noreferrer" title="Click to open the full image">
        <img
          src={thumb}
          alt={media?.alt || media?.filename || ''}
          style={{ maxWidth: 360, maxHeight: 360, display: 'block', border: '1px solid #ddd', borderRadius: 4, cursor: 'zoom-in' }}
        />
      </a>
      <div style={{ marginTop: 10 }}>
        <a href={url} target="_blank" rel="noopener noreferrer" style={btn}>
          View full image ↗
        </a>
      </div>
    </div>
  )
}