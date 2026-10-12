import express from 'express'
import multer from 'multer'
import Analysis from '../models/Analysis.js'
import { matchSkills, extractPdfText } from '../utils/skillMatcher.js'
import { evaluateResumeWithAI } from '../utils/aiEvaluator.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are accepted'))
  },
})

const router = express.Router()

router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Resume PDF is required' })
    }

    if (!req.body.jd || req.body.jd.trim().length < 30) {
      return res.status(400).json({ error: 'A job description of at least 30 characters is required' })
    }

    const resumeText = await extractPdfText(req.file.buffer)
    const aiResult = await evaluateResumeWithAI({ resumeText, jdText: req.body.jd })
    const result = aiResult || matchSkills(resumeText, req.body.jd)

    const saved = await Analysis.create({
      fileName: req.file.originalname,
      jdText: req.body.jd,
      score: result.score,
      presentSkills: result.presentSkills || result.present || [],
      missingSkills: result.missingSkills || result.missing || [],
    })

    res.json({
      id: saved._id,
      score: result.score,
      present: result.presentSkills || result.present || [],
      missing: result.missingSkills || result.missing || [],
      summary: result.summary || '',
    })
  } catch (err) {
    console.error('[analyze]', err.message)
    res.status(500).json({ error: 'Failed to analyze resume' })
  }
})

export default router
