"use client"

import { useState } from "react"
import AIChat from "@/components/AIChat"
import { MessageCircle, X } from "lucide-react"

export default function AIChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-[100]
                  bg-gradient-to-r from-orange-500 to-red-500
                  hover:from-orange-600 hover:to-red-600
                  text-white p-3 rounded-full shadow-lg
                  transition"
      >
        <MessageCircle size={22} />
      </button>


      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-20 left-6 z-[100]
                     w-[90vw] sm:w-[360px]
                     h-[65vh] sm:h-[420px]
                     bg-zinc-900 border border-zinc-800
                     rounded-xl shadow-xl p-4 flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm">
              Mayank's AI Portfolio Assistant
            </h3>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Chat */}
          <AIChat />
        </div>
      )}
    </>
  )
}
