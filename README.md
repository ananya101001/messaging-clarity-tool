# Messaging Clarity Analyzer

Paste any website URL and get an AI-powered assessment of how clearly it communicates its value to visitors. The tool extracts key copy from the page — headlines, descriptions, CTAs — and returns a scored analysis with concrete suggestions to improve messaging clarity.

## Setup

```bash
git clone <repo-url>
cd messaging-clarity-tool
npm install
```

Add your Anthropic API key to `.env.local`:

```
ANTHROPIC_API_KEY=your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

- **Scraping** — the API route fetches the target URL with axios and uses cheerio to extract the page title, meta description, H1/H2 headings, hero paragraph text, and CTA button copy
- **Analysis** — the extracted text is sent to Claude with a structured prompt that returns a clarity score (1–10), a plain-English reason for the score, a one-sentence business summary, and three actionable improvement suggestions
- **PDF export** — results can be downloaded as a two-page formatted PDF report via jsPDF, with a visual score circle and labeled sections

## Tech stack

| | |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **AI** | Claude (`claude-sonnet-4-20250514`) via Anthropic SDK |
| **Styling** | Tailwind CSS v4 |
| **PDF** | jsPDF |
| **Scraping** | axios + cheerio |
