'use client'

import React, { useEffect, useState } from 'react'

type Props = { variant?: 'ink' | 'white' }

function sameOrigin(url: string) {
  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.origin !== window.location.origin) return ''
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return ''
  }
}

export const Logo: React.FC<Props> = ({ variant = 'ink' }) => {
  const localFile = variant === 'white' ? '/images/logo-white.png' : '/images/logo-ink.png'
  const [src, setSrc] = useState(localFile)

  useEffect(() => {
    let alive = true
    fetch('/api/globals/site?depth=1')
      .then((response) => (response.ok ? response.json() : null))
      .then((site) => {
        const raw = variant === 'white' ? site?.logoWhite?.url : site?.logoInk?.url
        const local = raw ? sameOrigin(String(raw)) : ''
        if (alive && local) setSrc(local)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [variant])

  return (
    <div className={`rr-logo rr-logo--${variant}`}>
      <img
        className="rr-logo__img"
        src={src}
        alt="Royal Reelz"
        onError={() => setSrc(localFile)}
      />
    </div>
  )
}
