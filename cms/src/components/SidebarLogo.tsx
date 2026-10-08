import React from 'react'

import { Logo } from './Logo'

/** Logo block at the very top of the sidebar (above the menu links). */
export const SidebarLogo: React.FC = () => (
  <a className="rr-side-logo" href="/admin" aria-label="Dashboard">
    <Logo variant="white" />
  </a>
)