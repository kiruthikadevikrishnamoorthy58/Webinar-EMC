import mongoose from 'mongoose'
import { config } from './config.js'

let connectionPromise

mongoose.connection.on('disconnected', () => {
  connectionPromise = null
})

export async function connectToDatabase() {
  if (process.env.VERCEL && !process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured')
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
