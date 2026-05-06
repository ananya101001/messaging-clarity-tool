'use client'

import { useState } from 'react'
import { generatePDF, type AnalysisResult } from '@/lib/generatePDF'

function scoreColor(score: number) {
  if (score >= 8) return { ring: '#22c55e', text: '#22c55e', label: 'Excellent' }
  if (score >= 5) return { ring: '#eab308', text: '#eab308', label: 'Fair' }
  return { ring: '#ef4444', text: '#ef4444', label: 'Needs Work' }
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    const trimmed = url.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAnalyze()
  }

  const colors = result ? scoreColor(result.clarityScore) : null

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight">
            Messaging Clarity Analyzer
          </h1>
          <p className="text-lg text-slate-400">
            Find out how clearly your website communicates its value
          </p>
        </div>

        {/* Input */}
        <div className="mb-10 flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            disabled={loading}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Analyze
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />
            <p className="text-slate-400">Analyzing messaging clarity...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-300">
            {error}
          </div>
        )}

        {/* Results */}
        {result && !loading && colors && (
          <div className="space-y-6">

            {/* Score */}
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-10">
              <div
                className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 font-bold"
                style={{ borderColor: colors.ring }}
              >
                <span className="text-4xl" style={{ color: colors.text }}>
                  {result.clarityScore}
                </span>
                <span className="text-sm text-slate-400">/ 10</span>
              </div>
              <span
                className="rounded-full px-3 py-1 text-sm font-semibold"
                style={{ color: colors.text, backgroundColor: `${colors.ring}20` }}
              >
                {colors.label}
              </span>
            </div>

            {/* Business summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                What this business does
              </h2>
              <p className="text-slate-100 leading-relaxed">{result.businessSummary}</p>
            </div>

            {/* Clarity reason */}
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Why this score
              </h2>
              <p className="text-slate-100 leading-relaxed">{result.clarityReason}</p>
            </div>

            {/* Suggestions */}
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                3 Ways to Improve Clarity
              </h2>
              <div className="space-y-3">
                {result.suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-5"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-400">
                      {i + 1}
                    </span>
                    <p className="text-slate-100 leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Download PDF */}
            <button
              onClick={() => generatePDF(result, url)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Download PDF
            </button>

          </div>
        )}

      </div>
    </div>
  )
}
