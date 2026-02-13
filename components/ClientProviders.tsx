"use client"

import { useEffect, useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import StyledComponentsRegistry from "@/app/registry"
import { AnimationProvider } from "@/contexts/animation-context"
import { ScrollProgressIndicator } from "@/components/scroll-progress-indicator"
import AIChatWidget from "@/components/ai-chat-widget"
import TargetCursor from "@/components/TargetCursor"
import InitialLoader from "@/components/InitialLoader"

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <StyledComponentsRegistry>

        {/* <InitialLoader> */}
          <AnimationProvider>
            <ScrollProgressIndicator />
            {children}
            <AIChatWidget />
            <TargetCursor />
          </AnimationProvider>
        {/* </InitialLoader> */}

      </StyledComponentsRegistry>
    </ThemeProvider>
  )
}
