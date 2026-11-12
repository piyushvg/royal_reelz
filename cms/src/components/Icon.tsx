import React from 'react'

/**
 * Small monogram (breadcrumb / collapsed sidebar).
 * It fills whatever box the admin gives it (width 100%, square), so it is never cut off.
 */
export const Icon: React.FC = () => (
  <svg
    className="rr-icon"
    viewBox="0 0 64 64"
    role="img"
    aria-label="Royal Reelz"
    preserveAspectRatio="xMidYMid meet"
    style={{ display: 'block', width: '100%', maxWidth: 28, height: 'auto', aspectRatio: '1 / 1', flex: 'none' }}
  >
    <rect width="64" height="64" rx="14" fill="#4a101c" />
    <rect x="3.5" y="3.5" width="57" height="57" rx="11" fill="none" stroke="#c9a45c" strokeWidth="2" />
    <text
      x="32"
      y="45"
      textAnchor="middle"
      fontFamily="Georgia, 'Times New Roman', serif"
      fontSize="38"
      fontWeight="700"
      fill="#c9a45c"
    >
      R
    </text>
  </svg>
)