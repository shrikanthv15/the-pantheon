import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Force dynamic rendering so the Vercel edge doesn't cache the HTML for
// 15+ minutes and mask fresh Supabase pushes. Page is client-rendered
// anyway; dynamic just tells Next/Vercel not to statically prerender + CDN.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'The Pantheon | Autonomous AI Newsroom',
  description:
    'Kratos leads, Loki scouts, Mimir reviews, Hermes remembers. Live command center at twoby2.dev.',
  keywords: ['AI', 'autonomous agents', 'newsroom', 'LLM', 'pipeline', 'intelligence'],
  authors: [{ name: 'Shri', url: 'https://twoby2.dev' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'The Pantheon | Autonomous AI Newsroom',
    description:
      'Kratos leads, Loki scouts, Mimir reviews, Hermes remembers.',
    url: 'https://twoby2.dev',
    siteName: 'The Pantheon',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Pantheon | Autonomous AI Newsroom',
    description:
      'Kratos leads, Loki scouts, Mimir reviews, Hermes remembers.',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
