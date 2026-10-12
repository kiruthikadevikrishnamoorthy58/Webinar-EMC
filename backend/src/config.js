export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-parser',
  aiApiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '',
  aiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  aiEndpoint: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions',
}
