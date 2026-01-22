"use client"

import { useState, useRef, useEffect } from "react"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function AIChat() {
  const [q, setQ] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const ask = async () => {
    if (!q.trim() || loading) return

    const userMessage: Message = { role: "user", content: q }
    setMessages(prev => [...prev, userMessage])
    setQ("")
    setLoading(true)

    try {
      const res = await fetch("https://MortalMax-portfolio-api.hf.space/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content }),
      })

      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.answer }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-sm">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-xs">
            Ask about my projects, skills, experience…
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-3 py-2 break-words
              ${
                m.role === "user"
                  ? "ml-auto bg-orange-500 text-black"
                  : "mr-auto bg-muted text-foreground"
              }`}
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div className="mr-auto bg-muted px-3 py-2 rounded-lg text-muted-foreground">
            <span className="flex gap-1">
              <span className="animate-bounce">•</span>
              <span className="animate-bounce delay-100">•</span>
              <span className="animate-bounce delay-200">•</span>
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 border-t border-border pt-3">
        <input
          className="
            w-full p-2 text-sm rounded-md outline-none
            bg-background text-foreground
            border border-border
          "
          placeholder="Type your question…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ask()}
        />

        <button
          onClick={ask}
          disabled={loading}
          className="
            mt-2 w-full bg-orange-500 hover:bg-orange-600
            text-sm py-2 rounded-md transition disabled:opacity-60
          "
        >
          Ask
        </button>
      </div>
    </div>
  )
}
