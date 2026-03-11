'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  studySetId: string
}

export default function ChatInterface({ studySetId }: Props) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I've read your notes. Ask me anything about them." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studySetId, messages: updatedMessages }),
      })
      const data = await res.json()
      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'No reply')
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const userBubbleClass = !mounted
    ? 'bg-[var(--surface-2)] text-[var(--text)]'
    : theme === 'dark'
    ? 'bg-gray-700 text-gray-100'
    : theme === 'light'
    ? 'bg-gray-200 text-gray-900'
    : 'bg-gradient-to-r from-pink-300 to-purple-300 text-white'

  const sendButtonClass = !mounted
    ? 'bg-[var(--surface-2)] text-[var(--text)]'
    : theme === 'dark'
    ? 'bg-white text-gray-900'
    : theme === 'light'
    ? 'bg-gray-800 text-white'
    : 'bg-gradient-to-r from-pink-300 to-purple-300 text-white'

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? userBubbleClass
                  : 'bg-[var(--surface-2)] text-[var(--text)]'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-[var(--surface-2)] px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-[var(--muted)] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--border)] p-4 flex gap-2 items-end">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Ask a question about your notes..."
          className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--border)] disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed ${sendButtonClass}`}
        >
          Send
        </button>
      </div>
    </div>
  )
}
