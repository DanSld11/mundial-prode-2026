import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Mundial Perú 2026',
  description: 'Predice los partidos del Mundial 2026 y compite con tus amigos',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mundial 2026',
  },
}

export const viewport: Viewport = {
  themeColor: '#C8102E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
