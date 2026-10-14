'use client'

import React, { useState } from 'react'

/**
 * List view me chhota thumbnail.
 *  1) CMS me upload ki hui image  2) path wali image (website ke images folder se)  3) filename / "No image".
 *
 * Path wali images website ke folder se aati hain. Website ka URL yahan set karo
 * (ya .env me NEXT_PUBLIC_SITE_URL):
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:5500/royal_reelz/').replace(/\/?$/, '/')

const pick = (row: any, keys: string[]) => {
  for (const key of keys) {
    const value = row?.[key]
    if (value) return value
  }
  return null
}

const box: React.CSSProperties = {
  width: 56,
  height: 56,
  objectFit: 'cover',
  display: 'block',
  borderRadius: 4,
  background: 'var(--theme-elevation-100)',
  border: '1px solid var(--theme-elevation-150)',
}

export const ImagePreviewCell: React.FC<any> = ({ cellData, rowData }) => {
  const [failed, setFailed] = useState(false)

  const media: any =
    cellData && typeof cellData === 'object' ? cellData : pick(rowData, ['image', 'photo', 'icon'])

  const uploadUrl =
    media && typeof media === 'object'
      ? media.thumbnailURL || media.url || media.sizes?.thumbnail?.url
      : null

  const filePath: string | null = pick(rowData, ['imagePath', 'photoPath', 'iconPath'])

  const src =
    uploadUrl ||
    (filePath ? (/^(https?:)?\//.test(filePath) ? filePath : SITE_URL + filePath.replace(/^\.?\//, '')) : null)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={rowData?.alt || rowData?.name || ''}
        style={{ ...box, objectFit: rowData?.iconPath || rowData?.icon ? 'contain' : 'cover' }}
        onError={() => setFailed(true)}
      />
    )
  }

  if (filePath) {
    return (
      <span style={{ opacity: 0.7, fontSize: 12 }} title={String(filePath)}>
        {String(filePath).split('/').pop()}
      </span>
    )
  }

  return <span style={{ opacity: 0.4, fontSize: 12 }}>No image</span>
}

export default ImagePreviewCell