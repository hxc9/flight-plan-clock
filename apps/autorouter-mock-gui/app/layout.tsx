import './globals.css'
import React from "react";

export const metadata = {
    title: 'MockoRouter',
    viewport: {
        width: 'device-width',
        initialScale: 1
    },
    description: 'Mock for the autorouter API',
    icons: {
        icon: '/favicon.ico'
    }
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
