"use client"

import { useState } from "react"

export default function AIChat() {
  const [q, setQ] = useState("")
  const [a, setA] = useState("")
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if (!q.trim()) return
    setLoading(true)

    const res = await fetch("https://MortalMax-portfolio-rag.hf.space/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    })

    const data = await res.json()
    setA(data.answer)
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 🔑 Scrollable message area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 text-sm text-zinc-300">
        {a ? (
          <div className="bg-zinc-800 p-3 rounded-lg whitespace-pre-wrap break-words">
            {a}
          </div>
        ) : (
          <p className="text-zinc-500 text-xs">
            Ask about my projects, skills, experience…
          </p>
        )}
      </div>

      {/* 🔒 Fixed input area */}
      <div className="shrink-0 mt-3 border-t border-zinc-800 pt-3">
        <input
          className="w-full p-2 text-sm text-black rounded-md outline-none"
          placeholder="Type your question…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ask()}
        />

        <button
          onClick={ask}
          disabled={loading}
          className="mt-2 w-full bg-orange-500 hover:bg-orange-600
                     text-sm py-2 rounded-md transition disabled:opacity-60"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>
    </div>
  )
}
