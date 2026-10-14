import React from 'react'

/** Small monogram (breadcrumb / collapsed sidebar). SVG, so it never gets clipped. */
export const Icon: React.FC = () => (
  <svg
    className="rr-icon"
    viewBox="0 0 64 64"
    width="26"
    height="26"
    role="img"
    aria-label="Royal Reelz"
    style={{ display: 'block', flex: 'none' }}
  >
    <rect width="64" height="64" rx="14" fill="#4a101c" />
    <rect x="3" y="3" width="58" height="58" rx="11" fill="none" stroke="#c9a45c" strokeWidth="1.5" />
    <text
      x="32"
      y="42"
      textAnchor="middle"
      fontFamily="Georgia, 'Times New Roman', serif"
      fontSize="28"
      fontWeight="700"
      fill="#c9a45c"
    >
      RR
    </text>
  </svg>
)