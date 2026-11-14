'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import React from 'react'

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

/** Edit screen: shows the saved photo / video and gives a clear link to open it in a new tab. */
export const FilePreviewField: React.FC = () => {
  const info = useDocumentInfo() as any
  const doc: any = info?.savedDocumentData || info?.initialData || {}
  const videoUrl = useFormFields(([fields]) => (fields as any)?.videoUrl?.value) as string | undefined

  const url: string | undefined = doc.url
  const mime: string = doc.mimeType || ''
  const hasFile = Boolean(url && doc.filename)
  if (!hasFile && !videoUrl) return null

  return (
    <div style={{ margin: '0 0 1.5rem' }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Preview</div>

      {hasFile && mime.startsWith('image/') && (
        <>
          <a href={url} target="_blank" rel="noopener noreferrer" title="Click to open the full image">
            <img
              src={doc.thumbnailURL || url}
              alt={doc.title || doc.filename}
              style={{ maxWidth: 360, maxHeight: 360, display: 'block', border: '1px solid #ddd', borderRadius: 4, cursor: 'zoom-in' }}
            />
          </a>
          <div style={{ marginTop: 10 }}>
            <a href={url} target="_blank" rel="noopener noreferrer" style={btn}>
              View full image ↗
            </a>
          </div>
        </>
      )}

      {hasFile && mime.startsWith('video/') && (
        <>
          <video src={url} controls preload="metadata" style={{ maxWidth: 420, display: 'block' }} />
          <div style={{ marginTop: 10 }}>
            <a href={url} target="_blank" rel="noopener noreferrer" style={btn}>
              Open video in new tab ↗
            </a>
          </div>
        </>
      )}

      {videoUrl && (
        <div style={{ marginTop: hasFile ? 12 : 0 }}>
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={btn}>
            Open video link ↗
          </a>
        </div>
      )}
    </div>
  )
}