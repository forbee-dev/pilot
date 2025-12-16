import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MicroFE Component Manager',
  description: 'Upload and manage React components for WordPress',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


