'use client'

import { useAuth } from '@payloadcms/ui'
import React, { useEffect } from 'react'

/**
 * Customers must never land on the admin panel (they would only see "Unauthorized").
 * If a signed-in customer opens any /admin link, send them straight to their own portal.
 */
export const CustomerRedirect: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()

  useEffect(() => {
    if (user && (user as { role?: string }).role === 'customer') {
      window.location.replace('/portal.html')
    }
  }, [user])

  return <>{children}</>
}