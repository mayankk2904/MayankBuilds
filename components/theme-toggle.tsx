"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { SwitchToggle } from "./SwitchToggle"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    // Return a placeholder with the same dimensions
    return (
      <div className="w-[4em] h-[2.2em] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
      </div>
    )
  }

  const isDarkMode = theme === "dark"

  return (
    <div className="flex items-center justify-center">
      <SwitchToggle
        isDarkMode={isDarkMode}
        onToggle={() => setTheme(isDarkMode ? "light" : "dark")}
      />
    </div>
  )
}