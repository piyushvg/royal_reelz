'use client'

import React, { useEffect, useState } from 'react'

type Props = { variant?: 'ink' | 'white' }

/**
 * Admin logo.
 *  - login page  -> dark logo   (variant "ink")
 *  - sidebar top -> white logo  (variant "white")
 * Order: 1) logo uploaded in CMS "Site & header"  2) file in the /public folder
 *        3) text wordmark.
 */
export const Logo: React.FC<Props> = ({ variant = 'ink' }) => {
  const publicFile = variant === 'white' ? '/admin-logo-white.png' : '/admin-logo.png'
  const [sources, setSources] = useState<string[]>([publicFile])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let alive = true
    fetch('/api/globals/site?depth=1')
      .then((r) => (r.ok ? r.json() : null))
      .then((site) => {
        const url = variant === 'white' ? site?.logoWhite?.url : site?.logoInk?.url
        if (alive && url) {
          setSources([url, publicFile])
          setIndex(0)
        }
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [variant, publicFile])

  const src = sources[index]

  return (
    <div className={`rr-logo rr-logo--${variant}`}>
      {src ? (
        <img
          className="rr-logo__img"
          src={src}
          alt="Royal Reelz"
          onError={() => setIndex((i) => i + 1)}
        />
      ) : (
        <div className="rr-logo__word">
          <span>Royal Reelz</span>
          <small>A Celebration of Love</small>
        </div>
      )}
    </div>
  )
}