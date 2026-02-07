"use client"

import React, { useEffect, useState } from "react"

const COLOR_KEY = "color-theme"
const COLOR_CLASSES = ["color-lime", "color-purple", "color-gold", "color-cyan", ""]
const COLOR_OPTIONS = [
  { id: "", label: "Default", color: "hsl(18 100% 56%)" },
  { id: "color-lime", label: "Lime", color: "hsl(85 100% 48%)" },
  { id: "color-purple", label: "Purple", color: "hsl(270 90% 55%)" },
  { id: "color-gold", label: "Gold", color: "hsl(42 85% 48%)" },
  { id: "color-cyan", label: "Cyan", color: "hsl(190 95% 45%)" },
]

export default function ColorThemeToggle() {
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    if (typeof window === "undefined") return
    
    // Check if theme is already applied to document
    const doc = document.documentElement
    let foundClass = ""
    
    // Check which color class is currently active
    COLOR_CLASSES.forEach((c) => {
      if (c && doc.classList.contains(c)) {
        foundClass = c
      }
    })
    
    // If no class found, check localStorage or set to default
    if (foundClass) {
      setActive(foundClass)
    } else {
      // Check localStorage for saved preference
      const saved = localStorage.getItem(COLOR_KEY)
      if (saved !== null) {
        apply(saved, false) // Apply saved theme without saving again
      } else {
        apply("", false) // Apply default without saving
      }
    }
  }, [])

  function apply(cls: string, saveToStorage = true) {
    const doc = document.documentElement

    // remove other color classes
    COLOR_CLASSES.forEach((c) => {
      if (c) doc.classList.remove(c)
    })

    // remove inline override so classes can work
    doc.style.removeProperty("--accent")

    if (cls) {
      doc.classList.add(cls)
    } else {
      // restore DEFAULT ORANGE when reset
      doc.style.setProperty("--accent", "18 100% 56%")
    }

    setActive(cls)
    
    // Save to localStorage if requested
    if (saveToStorage) {
      localStorage.setItem(COLOR_KEY, cls)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row flex-wrap gap-1.5 justify-center">
        {COLOR_OPTIONS.map((option) => (
          <button
            key={option.id}
            aria-label={`${option.label} theme`}
            title={option.label}
            onClick={() => apply(option.id, true)}
            className={`
              relative flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg transition-all duration-200
              ${active === option.id 
                ? "bg-accent text-accent-foreground shadow-sm scale-[1.05]" 
                : "bg-muted/50 hover:bg-accent/10"
              }
              min-w-[60px] max-w-[70px] flex-1
            `}
          >
            {/* Color indicator */}
            <div
              className="w-6 h-6 rounded-full border-2 transition-all duration-200"
              style={{
                background: option.color,
                borderColor: active === option.id ? "rgba(255,255,255,0.3)" : "transparent",
                boxShadow: active === option.id ? "0 0 0 1px currentColor" : "none",
              }}
            />
            
            {/* Label */}
            <span className="text-[10px] font-medium truncate w-full text-center">
              {option.label}
            </span>

            {/* Active indicator dot */}
            {active === option.id && (
              <div 
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent border border-background"
                style={{ background: option.color }}
              />
            )}
          </button>
        ))}
      </div>
      
      {/* Compact layout for mobile dropdown */}
      <div className="block sm:hidden mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Current:</span>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: COLOR_OPTIONS.find(opt => opt.id === active)?.color || "hsl(18 100% 56%)",
              }}
            />
            <span className="text-xs font-medium">
              {COLOR_OPTIONS.find(opt => opt.id === active)?.label || "Default"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}