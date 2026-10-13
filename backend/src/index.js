import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import analyzeRouter from './routes/analyze.js'
import { connectToDatabase } from './database.js'

const app = express()

app.set('trust proxy', 1)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
}))
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))

app.get('/api/health', async (_req, res) => {
  try {
    await connectToDatabase()
    if (!mongoose.connection.db) return res.status(503).json({ ok: false, database: false })

    await mongoose.connection.db.admin().ping()
      return res.json({ ok: true, database: true })
    } catch (error) {
      console.warn('[health] database unavailable:', error.message)
      return res.json({ ok: true, database: false })
    }
})

app.use('/api', analyzeRouter)

if (process.env.VERCEL !== '1') {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`[server] listening on http://localhost:${process.env.PORT || 5000}`)
    })
}

export default app
