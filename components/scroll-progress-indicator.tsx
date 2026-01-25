"use client"

import { useState, useEffect } from "react"

export function ScrollProgressIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      // Calculate how far down the page the user has scrolled
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      
      // Calculate total scrollable height
      const totalScrollableHeight = docHeight - windowHeight
      
      // Calculate scroll percentage (clamped between 0 and 1)
      let scrollPercent = 0
      if (totalScrollableHeight > 0) {
        scrollPercent = Math.min(Math.max(scrollTop / totalScrollableHeight, 0), 1)
      }
      
      setScrollProgress(scrollPercent)
    }

    // Add scroll event listener
    window.addEventListener("scroll", updateScrollProgress, { passive: true })
    window.addEventListener("resize", updateScrollProgress, { passive: true })

    // Initial calculation
    updateScrollProgress()

    // Clean up event listeners
    return () => {
      window.removeEventListener("scroll", updateScrollProgress)
      window.removeEventListener("resize", updateScrollProgress)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-zinc-200 dark:bg-zinc-800">
      <div
        className="h-full bg-[#ff5f1f] transition-all duration-150 ease-out"
        style={{ 
          width: `${Math.round(scrollProgress * 10000) / 100}%`,
          transform: `scaleX(${scrollProgress})`,
          transformOrigin: 'left'
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