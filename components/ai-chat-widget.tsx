"use client"

import { useState } from "react"
import AIChat from "@/components/AIChat"
import { MessageCircle, X } from "lucide-react"

export default function AIChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating Button (brand color stays same) */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-12 sm:bottom-14 right-3 sm:right-6 z-50
          bg-gradient-to-r from-orange-500 to-red-500
          hover:from-orange-600 hover:to-red-600
          text-white p-3 rounded-full shadow-lg
          transition transform hover:scale-105
        "
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-orange-500/40 animate-ping" />
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
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm">
              Mayank&apos;s AI Portfolio Assistant
            </h3>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <AIChat />
        </div>
      )}
    </>
  )
}
