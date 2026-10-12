import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import analyzeRouter from './routes/analyze.js'
import { config } from './config.js'

const app = express()
let connectionPromise

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
    console.error('[health] database ping failed:', error.message)
    return res.status(503).json({ ok: false, database: false })
  }
})

async function connectToDatabase() {
  if (process.env.VERCEL && !process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured in the Vercel project')
  }

  if (mongoose.connection.readyState === 1) return
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 }).catch((error) => {
      connectionPromise = null
      throw error
    })
  }
  await connectionPromise
}

mongoose.connection.on('disconnected', () => {
  connectionPromise = null
})

app.use('/api', (req, res, next) => {
  connectToDatabase()
    .then(next)
    .catch((error) => {
      console.error('[db] connection failed:', error.message)
      res.status(503).json({ error: 'Database unavailable' })
    })
})

app.use('/api', analyzeRouter)

if (process.env.VERCEL !== '1') {
  connectToDatabase()
    .then(() => {
      console.log('[db] connected to MongoDB')
      app.listen(config.port, () => {
        console.log(`[server] listening on http://localhost:${config.port}`)
      })
    })
    .catch((error) => {
      console.error('[db] connection failed:', error.message)
      process.exit(1)
    })
}

export default app
