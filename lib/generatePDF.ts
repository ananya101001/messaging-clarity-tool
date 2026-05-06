import jsPDF from 'jspdf'

export interface AnalysisResult {
  businessSummary: string
  clarityScore: number
  clarityReason: string
  suggestions: [string, string, string]
}

function scoreRGB(score: number): [number, number, number] {
  if (score >= 8) return [34, 197, 94]
  if (score >= 5) return [234, 179, 8]
  return [239, 68, 68]
}

function scoreLabel(score: number): string {
  if (score >= 8) return 'Excellent'
  if (score >= 5) return 'Fair'
  return 'Needs Work'
}

export function generatePDF(data: AnalysisResult, url: string): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentW = pageW - margin * 2
  const [sr, sg, sb] = scoreRGB(data.clarityScore)

  // ── PAGE 1 ──────────────────────────────────────────────────────────────────

  // Dark header band
  doc.setFillColor(10, 22, 40)
  doc.rect(0, 0, pageW, 52, 'F')

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text('Messaging Clarity Report', margin, 27)

  // Subtitle
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184)
  doc.text('AI-powered website messaging analysis', margin, 38)

  // Thin accent line under header
  doc.setDrawColor(sr, sg, sb)
  doc.setLineWidth(1)
  doc.line(0, 52, pageW, 52)

  // Metadata block
  let y = 68

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text('ANALYZED URL', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(30, 41, 59)
  const urlLines = doc.splitTextToSize(url, contentW)
  doc.text(urlLines, margin, y)
  y += urlLines.length * 5 + 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text('DATE GENERATED', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(30, 41, 59)
  doc.text(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    margin,
    y
  )

  // Score circle — centered in lower half of page
  const cx = pageW / 2
  const cy = 185
  const outerR = 28
  const innerR = 24

  // Outer filled ring (score color at low opacity — simulated with a slightly larger circle)
  doc.setFillColor(sr, sg, sb)
  doc.circle(cx, cy, outerR, 'F')

  // Inner white fill
  doc.setFillColor(252, 252, 253)
  doc.circle(cx, cy, innerR, 'F')

  // Score number
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(38)
  doc.setTextColor(sr, sg, sb)
  doc.text(`${data.clarityScore}`, cx, cy + 6, { align: 'center' })

  // "/10" label
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text('/ 10', cx, cy + 14, { align: 'center' })

  // Label badge below circle
  const labelText = scoreLabel(data.clarityScore)
  const labelY = cy + outerR + 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(sr, sg, sb)
  doc.text(labelText, cx, labelY, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(100, 116, 139)
  doc.text('CLARITY SCORE', cx, labelY + 7, { align: 'center' })

  // Page number
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('1 / 2', pageW / 2, pageH - 8, { align: 'center' })

  // ── PAGE 2 ──────────────────────────────────────────────────────────────────

  doc.addPage()

  // Thin header band on page 2
  doc.setFillColor(10, 22, 40)
  doc.rect(0, 0, pageW, 18, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('Messaging Clarity Report', margin, 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('2 / 2', pageW - margin, 12, { align: 'right' })

  // Accent line
  doc.setDrawColor(sr, sg, sb)
  doc.setLineWidth(0.8)
  doc.line(0, 18, pageW, 18)

  y = 32

  // ── Section helper ──────────────────────────────────────────────────────────
  const section = (title: string) => {
    doc.setFillColor(241, 245, 249)
    doc.rect(margin, y - 4, contentW, 10, 'F')
    doc.setFillColor(sr, sg, sb)
    doc.rect(margin, y - 4, 2.5, 10, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(30, 41, 59)
    doc.text(title.toUpperCase(), margin + 6, y + 3)
    y += 14
  }

  const body = (text: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(51, 65, 85)
    const lines = doc.splitTextToSize(text, contentW)
    doc.text(lines, margin, y)
    y += lines.length * 5.5 + 10
  }

  // Business Summary
  section('What this business does')
  body(data.businessSummary)

  // Score + reason
  section('Why this score')

  // Inline score badge
  doc.setFillColor(sr, sg, sb)
  doc.roundedRect(margin, y - 3.5, 13, 8, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(255, 255, 255)
  doc.text(`${data.clarityScore}`, margin + 6.5, y + 2, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  const reasonLines = doc.splitTextToSize(data.clarityReason, contentW - 18)
  doc.text(reasonLines, margin + 17, y + 2)
  y += Math.max(reasonLines.length * 5.5, 8) + 12

  // 3 Suggestions
  section('3 Ways to Improve Clarity')

  data.suggestions.forEach((suggestion, i) => {
    // Numbered circle
    doc.setFillColor(10, 22, 40)
    doc.circle(margin + 4, y + 0.5, 4, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(255, 255, 255)
    doc.text(`${i + 1}`, margin + 4, y + 3, { align: 'center' })

    // Suggestion text
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(51, 65, 85)
    const lines = doc.splitTextToSize(suggestion, contentW - 14)
    doc.text(lines, margin + 12, y + 3)
    y += lines.length * 5.5 + 9
  })

  // Footer line
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(margin, pageH - 15, pageW - margin, pageH - 15)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text('Generated by Messaging Clarity Analyzer', pageW / 2, pageH - 9, { align: 'center' })

  doc.save('messaging-clarity-report.pdf')
}
