"use client"

import React, { useEffect, useState } from "react"

const COLOR_KEY = "color-theme" // localStorage key
const COLOR_CLASSES = ["color-lime", "color-purple", "color-gold", ""] // "" = default

export default function ColorThemeToggle() {
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    const saved = localStorage.getItem(COLOR_KEY) || ""
    apply(saved)
  }, [])

  function apply(cls: string) {
    const doc = document.documentElement

    // remove other color classes
    COLOR_CLASSES.forEach((c) => {
      if (c) doc.classList.remove(c)
    })

    // 🔥 remove inline override so classes can work
    doc.style.removeProperty("--accent")

    if (cls) {
      doc.classList.add(cls)
    } else {
      // restore DEFAULT ORANGE when reset
      doc.style.setProperty("--accent", "18 100% 56%")
    }

    setActive(cls)
    localStorage.setItem(COLOR_KEY, cls)
  }

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-medium text-muted-foreground mb-1">
        Color Theme
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <button
          aria-label="Default theme"
          title="Default Orange"
          onClick={() => apply("")}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
            ${active === "" 
              ? "bg-accent text-accent-foreground" 
              : "bg-muted hover:bg-accent/10"
            }
          `}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: "hsl(18 100% 56%)",
            }}
          />
          Default
        </button>
        <button
          aria-label="Lime theme"
          title="Lime"
          onClick={() => apply("color-lime")}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
            ${active === "color-lime" 
              ? "bg-accent text-accent-foreground" 
              : "bg-muted hover:bg-accent/10"
            }
          `}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: "hsl(85 100% 48%)",
            }}
          />
          Lime
        </button>
        <button
          aria-label="Purple theme"
          title="Purple"
          onClick={() => apply("color-purple")}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
            ${active === "color-purple" 
              ? "bg-accent text-accent-foreground" 
              : "bg-muted hover:bg-accent/10"
            }
          `}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: "hsl(270 90% 55%)",
            }}
          />
          Purple
        </button>
        <button
          aria-label="Gold theme"
          title="Gold"
          onClick={() => apply("color-gold")}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
            ${active === "color-gold" 
              ? "bg-accent text-accent-foreground" 
              : "bg-muted hover:bg-accent/10"
            }
          `}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: "hsl(42 85% 48%)",
            }}
          />
          Gold
        </button>
      </div>
    </div>
  )
}