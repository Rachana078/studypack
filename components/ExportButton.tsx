'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

interface Flashcard {
  question: string
  answer: string
}

interface QuizQuestion {
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
}

interface ExportButtonProps {
  title: string
  flashcards: Flashcard[]
  quizQuestions: QuizQuestion[]
}

export default function ExportButton({ title, flashcards, quizQuestions }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const isDark = mounted && theme === 'dark'

  function sanitizeFilename(name: string) {
    return name.replace(/[^a-z0-9\s-_]/gi, '').trim() || 'studypack-export'
  }

  function exportCSV() {
    setOpen(false)
    const header = 'Question,Answer\n'
    const rows = flashcards.map(f => {
      const q = `"${f.question.replace(/"/g, '""')}"`
      const a = `"${f.answer.replace(/"/g, '""')}"`
      return `${q},${a}`
    }).join('\n')
    download(`${sanitizeFilename(title)}.csv`, 'text/csv', header + rows)
  }

  function normalizeText(str: string): string {
    return str
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") // curly single quotes / prime
      .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"') // curly double quotes
      .replace(/[\u2013\u2014\u2015]/g, '-')                   // en-dash, em-dash, horizontal bar
      .replace(/\u2026/g, '...')                                // ellipsis
      .replace(/[\u2022\u2023\u25E6\u2043]/g, '-')             // bullets
      .replace(/[\u00A0]/g, ' ')                                // non-breaking space
      .replace(/[^\x00-\x7E]/g, (c) => {                       // remaining non-ASCII → strip
        const map: Record<string, string> = {
          '\u00E9': 'e', '\u00E8': 'e', '\u00EA': 'e', '\u00EB': 'e',
          '\u00E0': 'a', '\u00E1': 'a', '\u00E2': 'a', '\u00E4': 'a',
          '\u00F3': 'o', '\u00F2': 'o', '\u00F4': 'o', '\u00F6': 'o',
          '\u00FA': 'u', '\u00F9': 'u', '\u00FB': 'u', '\u00FC': 'u',
          '\u00ED': 'i', '\u00EC': 'i', '\u00EE': 'i', '\u00EF': 'i',
          '\u00F1': 'n', '\u00E7': 'c',
        }
        return map[c] ?? ''
      })
  }

  async function exportPDF() {
    setOpen(false)
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })

    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 48
    const contentW = pageW - margin * 2
    let y = margin

    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(30, 30, 30)
    doc.text(normalizeText(title), margin, y)
    y += 10

    // Subtitle line
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(margin, y + 6, pageW - margin, y + 6)
    y += 24

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text(`${flashcards.length} flashcard${flashcards.length !== 1 ? 's' : ''}`, margin, y)
    y += 28

    flashcards.forEach((card, i) => {
      // Estimate height needed
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      const qLines = doc.splitTextToSize(normalizeText(`Q: ${card.question}`), contentW - 56)
      const aLines = doc.splitTextToSize(normalizeText(`A: ${card.answer}`), contentW - 56)
      const blockH = 16 + qLines.length * 15 + 16 + aLines.length * 15 + 16

      if (y + blockH > pageH - margin) {
        doc.addPage()
        y = margin
      }

      // Card background
      doc.setFillColor(248, 248, 248)
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.5)
      doc.roundedRect(margin, y, contentW, blockH - 8, 6, 6, 'FD')

      // Card number badge
      doc.setFillColor(200, 200, 210)
      doc.roundedRect(margin + 8, y + 8, 22, 14, 3, 3, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(80, 80, 100)
      doc.text(`${i + 1}`, margin + 19, y + 18, { align: 'center' })

      let cardY = y + 12

      // Question
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(40, 40, 40)
      doc.text(qLines, margin + 36, cardY)
      cardY += qLines.length * 15 + 8

      // Divider
      doc.setDrawColor(220, 220, 220)
      doc.line(margin + 12, cardY, margin + contentW - 12, cardY)
      cardY += 12

      // Answer
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(70, 70, 70)
      doc.text(aLines, margin + 36, cardY)

      y += blockH + 4
    })

    // Quiz section
    if (quizQuestions.length > 0) {
      // Section header — new page if not enough room
      if (y + 60 > pageH - margin) { doc.addPage(); y = margin }

      y += 12
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageW - margin, y)
      y += 18

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(30, 30, 30)
      doc.text('Quiz Questions', margin, y)
      y += 8

      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y + 6, pageW - margin, y + 6)
      y += 20

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(120, 120, 120)
      doc.text(`${quizQuestions.length} question${quizQuestions.length !== 1 ? 's' : ''}`, margin, y)
      y += 24

      const OPTIONS: Array<{ key: 'A' | 'B' | 'C' | 'D'; field: keyof QuizQuestion }> = [
        { key: 'A', field: 'option_a' },
        { key: 'B', field: 'option_b' },
        { key: 'C', field: 'option_c' },
        { key: 'D', field: 'option_d' },
      ]

      quizQuestions.forEach((q, i) => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        const qLines = doc.splitTextToSize(normalizeText(q.question), contentW - 56)
        const optionLines = OPTIONS.map(({ key, field }) =>
          doc.splitTextToSize(normalizeText(`${key}) ${String(q[field])}`), contentW - 56)
        )
        const blockH = 14 + qLines.length * 15 + optionLines.reduce((s, l) => s + l.length * 13, 0) + OPTIONS.length * 4 + 16

        if (y + blockH > pageH - margin) { doc.addPage(); y = margin }

        // Card background
        doc.setFillColor(248, 248, 248)
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.5)
        doc.roundedRect(margin, y, contentW, blockH - 8, 6, 6, 'FD')

        // Card number badge
        doc.setFillColor(200, 200, 210)
        doc.roundedRect(margin + 8, y + 8, 22, 14, 3, 3, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(80, 80, 100)
        doc.text(`${i + 1}`, margin + 19, y + 18, { align: 'center' })

        let cardY = y + 12

        // Question
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(40, 40, 40)
        doc.text(qLines, margin + 36, cardY)
        cardY += qLines.length * 15 + 8

        // Options
        OPTIONS.forEach(({ key, field }) => {
          const isCorrect = q.correct_answer.toUpperCase() === key
          const lines = doc.splitTextToSize(normalizeText(`${key}) ${String(q[field])}`), contentW - 56)
          doc.setFont('helvetica', isCorrect ? 'bold' : 'normal')
          doc.setFontSize(10)
          doc.setTextColor(isCorrect ? 34 : 70, isCorrect ? 120 : 70, isCorrect ? 34 : 70)
          doc.text(lines, margin + 36, cardY)
          if (isCorrect) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(34, 120, 34)
            doc.text('✓', margin + contentW - 16, cardY)
          }
          cardY += lines.length * 13 + 4
        })

        y += blockH + 4
      })
    }

    // Page numbers
    const totalPages = (doc.internal as any).getNumberOfPages()
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(160, 160, 160)
      doc.text(`${p} / ${totalPages}`, pageW / 2, pageH - 24, { align: 'center' })
    }

    doc.save(`${sanitizeFilename(title)}.pdf`)
  }

  function download(filename: string, type: string, content: string) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--text)] transition-all duration-200"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
        <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={`absolute right-0 top-11 z-30 w-48 rounded-xl border border-[var(--border)] shadow-xl overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-[var(--surface)]'}`}>
          {[
            { label: 'Export as CSV', icon: '📄', action: exportCSV },
            { label: 'Export as PDF', icon: '📑', action: exportPDF },
          ].map(({ label, icon, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors text-left"
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
