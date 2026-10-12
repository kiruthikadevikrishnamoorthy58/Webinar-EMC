import { config } from '../config.js'

function parseJsonContent(rawText) {
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim()

    return JSON.parse(cleaned)
  } catch {
    const start = rawText.indexOf('{')
    const end = rawText.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(rawText.slice(start, end + 1))
    }
    return null
  }
}

export async function evaluateResumeWithAI({ resumeText, jdText }) {
  if (!config.aiApiKey) return null

  const prompt = `
You are an expert recruiter and technical hiring analyst.
Evaluate this resume against the job description and return valid JSON only.

Rules:
- score must be an integer from 0 to 100.
- presentSkills and missingSkills must be arrays of skill names.
- If the resume does not clearly mention a skill, include it in missingSkills.
- Focus on technical skills, tools, and domain experience relevant to the job.
- Keep skill names concise and specific.
- Return a JSON object shaped like:
{
  "score": 86,
  "presentSkills": ["Python", "SQL"],
  "missingSkills": ["Docker", "AWS"],
  "summary": "Short explanation of fit"
}

Job description:
${jdText}

Resume:
${resumeText}
  `.trim()

  try {
    const response = await fetch(config.aiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.aiApiKey}`,
      },
      body: JSON.stringify({
        model: config.aiModel,
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are an expert hiring analyst. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`AI request failed: ${response.status} ${errText}`)
    }

    const payload = await response.json()
    const text = payload?.choices?.[0]?.message?.content

    if (!text) {
      throw new Error('AI response missing content')
    }

    const parsed = parseJsonContent(text)
    if (!parsed || typeof parsed.score !== 'number') {
      throw new Error('Invalid AI response format')
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      presentSkills: Array.isArray(parsed.presentSkills) ? parsed.presentSkills : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    }
  } catch (error) {
    console.warn('[ai] evaluation unavailable, using fallback matcher:', error.message)
    return null
  }
}
