// components/ClientProviders.tsx
"use client"

import React, { useEffect, useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { ThemeProvider } from "@/components/theme-provider"
import StyledComponentsRegistry from "@/app/registry"
import { AnimationProvider } from "@/contexts/animation-context"
import { ScrollProgressIndicator } from "@/components/scroll-progress-indicator"
import AIChatWidget from "@/components/ai-chat-widget"
import InitialLoader from "@/components/InitialLoader"
import { CopyProtection } from "./copy-protection"

// Client-only import for the custom cursor (prevents SSR errors)
const TargetCursor = dynamic(() => import("@/components/TargetCursor"), {
  ssr: false,
})

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // small debug to ensure the provider mounts in prod (remove later)
    // You can open console on the deployed site to verify this logs.
    console.log("[ClientProviders] mounted (client-side)")
  }, [])

  if (!mounted) return null

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <StyledComponentsRegistry>
        <CopyProtection />

        {/* If you want an initial loading wrapper, you can uncomment InitialLoader */}
        {/* <InitialLoader> */}
        <AnimationProvider>
          <ScrollProgressIndicator />
          {children}
          <AIChatWidget />
        </AnimationProvider>
        {/* </InitialLoader> */}

        {/* Render TargetCursor at the end so it sits above other UI.
            We wrap it in a fixed container with pointer-events: none so it doesn't intercept clicks.
            The extremely large z-index ensures it isn't hidden by other overlays. */}
        <div
          id="__target_cursor_root"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 2147483647, // safely very large so it's above overlays
          }}
          aria-hidden
        >
          {/* Suspense fallback null keeps initial paint clean */}
          <Suspense fallback={null}>
            <TargetCursor />
          </Suspense>
        </div>
      </StyledComponentsRegistry>
    </ThemeProvider>
  )
}
