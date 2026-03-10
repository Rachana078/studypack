'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type StepStatus = 'pending' | 'active' | 'complete' | 'error'

interface Step {
  label: string
  status: StepStatus
}

const INITIAL_STEPS: Step[] = [
  { label: 'Uploading file',                   status: 'pending' },
  { label: 'Extracting text',                  status: 'pending' },
  { label: 'Generating flashcards and quiz',   status: 'pending' },
  { label: 'Done! Redirecting...',             status: 'pending' },
]

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export default function UploadForm() {
  const [file, setFile]       = useState<File | null>(null)
  const [title, setTitle]     = useState('')
  const [steps, setSteps]     = useState<Step[]>(INITIAL_STEPS.map(s => ({ ...s })))
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const router = useRouter()
  const activeStepRef = useRef(0)

  function updateStep(index: number, status: StepStatus) {
    if (status === 'active') activeStepRef.current = index
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, status } : s))
  }

  function reset() {
    setSteps(INITIAL_STEPS.map(s => ({ ...s })))
    setErrorMsg(null)
    setRunning(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setRunning(true)
    setErrorMsg(null)
    setSteps(INITIAL_STEPS.map(s => ({ ...s })))

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title || file.name.replace(/\.[^.]+$/, ''))

    // Step 1: uploading
    updateStep(0, 'active')

    // After 1.5s transition to extraction step (both happen server-side in one request)
    const extractTimer = setTimeout(() => {
      updateStep(0, 'complete')
      updateStep(1, 'active')
    }, 1500)

    let studySetId: string
    try {
      const res = await fetch('/api/generate/prepare', { method: 'POST', body: formData })
      clearTimeout(extractTimer)

      if (!res.ok) {
        const body = await res.json()
        const failedStep = body.phase === 'extract' ? 1 : 0
        updateStep(failedStep, 'error')
        setErrorMsg(body.error ?? 'Upload or extraction failed')
        setRunning(false)
        return
      }

      const data = await res.json()
      studySetId = data.studySetId
      updateStep(0, 'complete')
      await sleep(200)
      updateStep(1, 'complete')
      await sleep(200)
    } catch (err) {
      clearTimeout(extractTimer)
      updateStep(activeStepRef.current, 'error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setRunning(false)
      return
    }

    // Step 3: generating
    updateStep(2, 'active')
    try {
      const res = await fetch('/api/generate/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studySetId }),
      })

      if (!res.ok) {
        const body = await res.json()
        updateStep(2, 'error')
        setErrorMsg(body.error ?? 'Generation failed')
        setRunning(false)
        return
      }

      updateStep(2, 'complete')
      await sleep(200)
    } catch (err) {
      updateStep(2, 'error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setRunning(false)
      return
    }

    // Step 4: done
    updateStep(3, 'complete')
    await sleep(700)
    router.push(`/study-sets/${studySetId!}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[var(--text)]">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={running}
          placeholder="e.g. Biology Chapter 5"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        />
      </div>

      {/* File */}
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-[var(--text)]">
          File <span className="text-[var(--muted)]">(PDF or DOCX)</span>
        </label>
        <input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          disabled={running}
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm text-[var(--text)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--surface-2)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--text)] hover:file:bg-[var(--border)] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        />
      </div>

      {/* Step indicator */}
      {running && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              {/* Circle + connector */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  step.status === 'complete' ? 'bg-green-500' :
                  step.status === 'active'   ? 'bg-[var(--accent)]' :
                  step.status === 'error'    ? 'bg-red-500' :
                  'bg-[var(--border)]'
                }`}>
                  {step.status === 'complete' && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {step.status === 'active' && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {step.status === 'error' && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {step.status === 'pending' && (
                    <span className="text-xs font-bold text-[var(--muted)]">{i + 1}</span>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-0.5 h-5 my-0.5 transition-colors duration-300 ${
                    step.status === 'complete' ? 'bg-green-500' : 'bg-[var(--border)]'
                  }`} />
                )}
              </div>

              {/* Label */}
              <div className="pb-5 flex items-start pt-1">
                <p className={`text-sm transition-colors duration-300 ${
                  step.status === 'active'   ? 'text-[var(--text)] font-semibold' :
                  step.status === 'complete' ? 'text-[var(--muted)]' :
                  step.status === 'error'    ? 'text-red-500 font-semibold' :
                  'text-[var(--muted)]'
                }`}>
                  {step.label}
                  {step.status === 'active' && (
                    <span className="animate-pulse">...</span>
                  )}
                </p>
              </div>
            </div>
          ))}

          {/* Error + Try Again */}
          {errorMsg && (
            <div className="mt-1 space-y-3 pl-10">
              <p className="text-sm text-red-500">{errorMsg}</p>
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Submit button — hidden while running */}
      {!running && (
        <button
          type="submit"
          disabled={!file}
          className="w-full rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Generate Study Set
        </button>
      )}
    </form>
  )
}
