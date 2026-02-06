"use client"

import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"

export function EnhancedScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
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
      setIsVisible(scrollTop > 100)
    }

    window.addEventListener("scroll", updateScrollProgress, { passive: true })
    window.addEventListener("resize", updateScrollProgress, { passive: true })

    updateScrollProgress()

    return () => {
      window.removeEventListener("scroll", updateScrollProgress)
      window.removeEventListener("resize", updateScrollProgress)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const progressPercentage = Math.min(Math.round(scrollProgress * 100), 100)
  const circumference = 2 * Math.PI * 9

  return (
    <div
      className={`fixed bottom-28 sm:bottom-32 right-3 sm:right-6 z-50 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center">

        {/* Scroll Button */}
        <div
          className="
            relative w-10 h-10 sm:w-12 sm:h-12 rounded-full
            bg-background/80 dark:bg-muted/80
            backdrop-blur-sm
            cursor-pointer
            hover:bg-muted
            transition-colors
            group
            border border-border
          "
          onClick={scrollToTop}
          role="button"
          aria-label="Scroll to top"
        >
          {/* Progress Ring */}
          <svg className="absolute inset-0 -rotate-90 w-full h-full overflow-visible">

            {/* Background ring */}
            <circle
              cx="50%"
              cy="50%"
              r="9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground/30"
            />

            {/* Accent Progress ring */}
            <circle
              cx="50%"
              cy="50%"
              r="9"
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - scrollProgress)}
              strokeLinecap="round"
              className="transition-all duration-150 ease-out"
            />
          </svg>

          {/* Chevron */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ChevronUp
              className="
                h-4 w-4 sm:h-5 sm:w-5
                text-[hsl(var(--accent))]
                transition-transform
                group-hover:scale-110
              "
            />
          </div>
        </div>

        {/* Percentage */}
        <div
          className="
            mt-1 sm:mt-2
            text-xs font-medium
            px-2 py-1 rounded-md
            bg-background/80 dark:bg-muted/80
            backdrop-blur-sm
            text-[hsl(var(--accent))]
            border border-border
            transition-all duration-150 ease-out
          "
        >
          {progressPercentage}%
        </div>

      </div>
    </div>
  )
}
