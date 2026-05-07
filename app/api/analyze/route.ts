import axios from 'axios'
import * as cheerio from 'cheerio'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

function extractContent(html: string): string {
  const $ = cheerio.load(html)

  $('script, style, noscript').remove()

  const parts: string[] = []

  const title = $('title').first().text().trim()
  if (title) parts.push(`Title: ${title}`)

  const metaDesc = $('meta[name="description"]').attr('content')?.trim()
  if (metaDesc) parts.push(`Meta description: ${metaDesc}`)

  $('h1').each((_, el) => {
    const text = $(el).text().trim()
    if (text) parts.push(`H1: ${text}`)
  })

  $('h2').each((_, el) => {
    const text = $(el).text().trim()
    if (text) parts.push(`H2: ${text}`)
  })

  const heroSelectors = ['main p', 'hero p', '[class*="hero"] p', '[class*="banner"] p', 'header p', 'section:first-of-type p']
  const seenParagraphs = new Set<string>()
  for (const selector of heroSelectors) {
    $(selector).each((_, el) => {
      const text = $(el).text().trim()
      if (text && text.length > 20 && !seenParagraphs.has(text)) {
        seenParagraphs.add(text)
        parts.push(`Paragraph: ${text}`)
      }
    })
    if (seenParagraphs.size >= 3) break
  }

  const ctaSelectors = ['a[class*="cta"]', 'button[class*="cta"]', 'a[class*="btn"]', 'button[class*="btn"]', '.cta', 'button', '[role="button"]']
  const seenCTAs = new Set<string>()
  for (const selector of ctaSelectors) {
    $(selector).each((_, el) => {
      const text = $(el).text().trim()
      if (text && text.length <= 60 && !seenCTAs.has(text)) {
        seenCTAs.add(text)
        parts.push(`CTA: ${text}`)
      }
    })
    if (seenCTAs.size >= 5) break
  }

  return parts.join('\n')
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'url is required' }, { status: 400 })
    }

    const { data: html } = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MessagingClarityBot/1.0)' },
      maxRedirects: 5,
    })

    const extractedText = extractContent(html)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are a messaging clarity expert. Analyze the website content and return ONLY valid JSON with exactly this structure:
{
  "businessSummary": string (1-2 sentences: what does this business do),
  "clarityScore": number (1-10: how clearly does the site communicate its value),
  "clarityReason": string (one sentence explaining the score),
  "suggestions": [string, string, string] (exactly 3 actionable suggestions to improve messaging clarity)
}`,
      messages: [
        {
          role: 'user',
          content: extractedText,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Failed to parse Claude response as JSON' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return Response.json(parsed)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
