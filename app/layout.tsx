// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./../styles/globals.css"
import { getMetaInfo } from "@/lib/data"
import { Analytics } from "@vercel/analytics/next"
import ClientProviders from "@/components/ClientProviders"

const inter = Inter({ subsets: ["latin"] })

const metaInfo = getMetaInfo()

export const metadata: Metadata = {
  title: metaInfo.title,
  description: metaInfo.description,
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>

        <Analytics />
      </body>
    </html>
  )
}
