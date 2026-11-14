import React from 'react'

type Row = {
  url?: string
  thumbnailURL?: string
  mimeType?: string
  filename?: string
  videoUrl?: string
}

const link: React.CSSProperties = { color: '#4a0a14', textDecoration: 'underline', fontWeight: 500 }

/** List column: click to open the photo / video in a new tab. */
export const FileLinkCell: React.FC<{ rowData?: Row }> = ({ rowData }) => {
  const r = rowData || {}
  const isImage = (r.mimeType || '').startsWith('image/')
  const isVideoFile = (r.mimeType || '').startsWith('video/')

  if (r.url && isImage) {
    return (
      <a href={r.url} target="_blank" rel="noopener noreferrer" title="Open full image" style={link}>
        View image ↗
      </a>
    )
  }
  if (r.url && isVideoFile) {
    return (
      <a href={r.url} target="_blank" rel="noopener noreferrer" title="Play video" style={link}>
        Play video ↗
      </a>
    )
  }
  if (r.videoUrl) {
    return (
      <a href={r.videoUrl} target="_blank" rel="noopener noreferrer" title={r.videoUrl} style={link}>
        Open video link ↗
      </a>
    )
  }
  return <span style={{ opacity: 0.5 }}>—</span>
}