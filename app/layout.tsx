// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./../styles/globals.css"
import { ScrollProgressIndicator } from "@/components/scroll-progress-indicator"
import { AnimationProvider } from "@/contexts/animation-context"
import { getMetaInfo } from "@/lib/data"
import AIChatWidget from "@/components/ai-chat-widget"
import InitialLoader from "@/components/InitialLoader"
import StyledComponentsRegistry from "@/app/registry"
import { ThemeProvider } from "@/components/theme-provider"
import { CopyProtection } from "@/components/copy-protection" 
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

const metaInfo = getMetaInfo()

export const metadata: Metadata = {
  title: metaInfo.title,
  description: metaInfo.description,
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      {/* <CopyProtection /> */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <StyledComponentsRegistry>
            <InitialLoader>
              <AnimationProvider>
                <ScrollProgressIndicator />
                {children}
                <AIChatWidget />
              </AnimationProvider>
            </InitialLoader>
          </StyledComponentsRegistry>
        </ThemeProvider>
      </body>
    </html>
  )
}