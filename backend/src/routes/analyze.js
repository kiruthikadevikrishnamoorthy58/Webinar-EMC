import express from 'express'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import Analysis from '../models/Analysis.js'
import { matchSkills, extractPdfText } from '../utils/skillMatcher.js'
import { evaluateResumeWithAI } from '../utils/aiEvaluator.js'

const MAX_RESUME_BYTES = 4 * 1024 * 1024
const MAX_JD_CHARACTERS = 12_000

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES, files: 1, fields: 1, fieldSize: MAX_JD_CHARACTERS },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) cb(null, true)
    else cb(new Error('Only PDF files are accepted'))
  },
})

const router = express.Router()
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many analysis requests. Please try again in 15 minutes.' },
})

router.post('/analyze', analyzeLimiter, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Resume PDF is required' })
    }

    if (!req.file.buffer.subarray(0, 1024).includes(Buffer.from('%PDF-'))) {
      return res.status(400).json({ error: 'The uploaded file is not a valid PDF' })
    }

    if (typeof req.body.jd !== 'string' || req.body.jd.trim().length < 30) {
      return res.status(400).json({ error: 'A job description of at least 30 characters is required' })
    }

    if (req.body.jd.length > MAX_JD_CHARACTERS) {
      return res.status(400).json({ error: `Job description must be no longer than ${MAX_JD_CHARACTERS} characters` })
    }

    const extractedText = await extractPdfText(req.file.buffer)
    if (!extractedText.trim()) {
      return res.status(422).json({ error: 'No selectable text was found in the PDF. Scanned resumes need OCR.' })
    }

    const resumeText = extractedText.slice(0, 30_000)
    const aiResult = await evaluateResumeWithAI({ resumeText, jdText: req.body.jd.trim() })
    const result = aiResult || matchSkills(resumeText, req.body.jd)
    const evaluationMethod = aiResult ? 'ai' : 'rules'

    const saved = await Analysis.create({
      fileName: req.file.originalname.slice(0, 255),
      jdText: req.body.jd.trim(),
      score: result.score,
      presentSkills: result.presentSkills || result.present || [],
      missingSkills: result.missingSkills || result.missing || [],
      evaluationMethod,
    })

    res.json({
      id: saved._id,
      score: result.score,
      present: result.presentSkills || result.present || [],
      missing: result.missingSkills || result.missing || [],
      summary: result.summary || '',
      evaluationMethod,
    })
  } catch (err) {
    console.error('[analyze]', err.message)
    res.status(500).json({ error: 'Failed to analyze resume' })
  }
})

router.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Resume PDF must be 4 MB or smaller' })
    }
    if (error.code === 'LIMIT_FIELD_VALUE') {
      return res.status(413).json({ error: `Job description must be no longer than ${MAX_JD_CHARACTERS} characters` })
    }
    return res.status(400).json({ error: 'Upload only one PDF resume and one job description' })
  }

  console.warn('[upload]', error.message)
  return res.status(400).json({ error: error.message || 'Invalid upload' })
})

export default router
