'use client'

import React from 'react'

/**
 * List view me chhota thumbnail dikhata hai.
 * Upload field ho to uski image, warna path field ka text.
 */
const pick = (row: any, keys: string[]) => {
  for (const key of keys) {
    const value = row?.[key]
    if (value) return value
  }
  return null
}

export const ImagePreviewCell: React.FC<any> = ({ cellData, rowData }) => {
  const media: any = cellData && typeof cellData === 'object'
    ? cellData
    : pick(rowData, ['image', 'photo', 'icon'])

  const url =
    media && typeof media === 'object'
      ? media.thumbnailURL || media.url || media.sizes?.thumbnail?.url
      : null

  if (url) {
    return (
      <img
        src={url}
        alt={rowData?.alt || rowData?.name || ''}
        style={{
          width: 56,
          height: 56,
          objectFit: 'cover',
          display: 'block',
          borderRadius: 2,
          background: 'var(--theme-elevation-100)',
        }}
      />
    )
  }

  const filePath = pick(rowData, ['imagePath', 'photoPath', 'iconPath'])

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