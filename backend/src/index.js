import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import analyzeRouter from './routes/analyze.js'
import { config } from './config.js'

const app = express()

app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api', analyzeRouter)

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log(`[db] connected to MongoDB`)
    app.listen(config.port, () => {
      console.log(`[server] listening on http://localhost:${config.port}`)
    })
  })
  .catch((err) => {
    console.error('[db] connection failed:', err.message)
    process.exit(1)
  })
