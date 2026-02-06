"use client"

import { useState, useEffect } from "react"

export function ScrollProgressIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight

      const totalScrollableHeight = docHeight - windowHeight

      let scrollPercent = 0
      if (totalScrollableHeight > 0) {
        scrollPercent = Math.min(
          Math.max(scrollTop / totalScrollableHeight, 0),
          1
        )
      }

      setScrollProgress(scrollPercent)
    }

    window.addEventListener("scroll", updateScrollProgress, { passive: true })
    window.addEventListener("resize", updateScrollProgress, { passive: true })

    updateScrollProgress()

    return () => {
      window.removeEventListener("scroll", updateScrollProgress)
      window.removeEventListener("resize", updateScrollProgress)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-zinc-200 dark:bg-zinc-800">
      <div
        className="
          h-full
          transition-all duration-150 ease-out
          bg-[hsl(var(--accent))]
        "
        style={{
          width: `${Math.round(scrollProgress * 10000) / 100}%`,
          transform: `scaleX(${scrollProgress})`,
          transformOrigin: "left",
        }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page scroll progress"
      />
    </div>
  )
}
