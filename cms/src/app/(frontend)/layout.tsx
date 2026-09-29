import React from 'react'
import './styles.css'

export const metadata = {
  title: 'Royal Reelz CMS',
  description: 'Admin for the Royal Reelz website.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
