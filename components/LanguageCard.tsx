"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { GBFlag, INFlag, DEFlag } from "./flags"

const LANGUAGE_FLAGS: Record<string, JSX.Element> = {
  English: <GBFlag />,
  Hindi: <INFlag />,
  Marathi: <INFlag />,
  German: <DEFlag />,
}

interface Language {
  name: string
  proficiency: string
  level: number
}

export function LanguageCard({ languages }: { languages: Language[] }) {
  const [active, setActive] = useState(0)
  const isGerman = languages[active].name === "German"

  const next = () => setActive((i) => (i + 1) % languages.length)
  const prev = () => setActive((i) => (i - 1 + languages.length) % languages.length)

  const getProgressLabel = (name: string) => {
    if (name === "English" || name === "German") return "Fluent"
    if (name === "Hindi" || name === "Marathi") return "Native"
    return "Native"
  }

  return (
    <div className="relative w-full max-w-sm mx-auto rounded-3xl border border-border bg-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prev}
          className="p-2 rounded-full hover:bg-muted transition active:scale-[0.95]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {languages.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === active
                  ? "w-5 h-2" // keep sizing via tailwind, color via inline style
                  : "w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/60"
              )}
              // active dot uses accent variable
              style={i === active ? { background: "hsl(var(--accent))" } : undefined}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="p-2 rounded-full hover:bg-muted transition active:scale-[0.95]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Animated Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={languages[active].name}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-3"
        >
          {/* Language Name */}
          <div className="text-center space-y-1">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Language
            </div>

            <div className="flex items-center justify-center gap-2">
              {LANGUAGE_FLAGS[languages[active].name]}
              <span className="text-sm font-semibold">{languages[active].name}</span>
            </div>
          </div>

          {/* Proficiency */}
          <div className="text-center">
            <div className="text-sm font-medium">{languages[active].proficiency}</div>
            <div className="text-[11px] text-muted-foreground">
              Skill Level · {languages[active].level}%
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span>
              <span>{getProgressLabel(languages[active].name)}</span>
            </div>

            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${languages[active].level}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full"
                // gradient & glow driven by --accent so they follow the selected theme
                style={{
                  background:
                    "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent) / 0.85))",
                  boxShadow: "0 0 12px hsl(var(--accent) / 0.5)",
                }}
              />
            </div>

            {/* CEFR scale */}
            {isGerman && (
              <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
