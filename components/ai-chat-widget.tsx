"use client"

import { useState } from "react"
import AIChat from "@/components/AIChat"
import { MessageCircle, X } from "lucide-react"

export default function AIChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating Button (now accent-driven) */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-12 sm:bottom-14 right-3 sm:right-6 z-50
          text-white p-3 rounded-full shadow-lg
          transition transform hover:scale-105
        "
        style={{
          background: `linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent) / 0.85))`,
        }}
        aria-label="Open chat"
      >
        {!open && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "hsl(var(--accent) / 0.35)" }}
            aria-hidden
          />
        )}
        <MessageCircle size={22} className="relative z-10" />
      </button>

      {open && (
        <div
          className="
            fixed bottom-20 right-3 sm:right-6 z-[100]
            w-[90vw] sm:w-[360px]
            h-[65vh] sm:h-[420px]
            bg-card text-foreground
            border border-border
            rounded-xl shadow-xl p-4 flex flex-col
            transition-all duration-300 ease-out
          "
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm">Mayank&apos;s AI Portfolio Assistant</h3>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} style={{ color: "hsl(var(--accent))" }} />
            </button>
          </div>

          <AIChat />
        </div>
      )}
    </>
  )
}
