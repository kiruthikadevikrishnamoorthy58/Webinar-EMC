import mongoose from 'mongoose'

const analysisSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    jdText: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    presentSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    evaluationMethod: { type: String, enum: ['ai', 'rules'], required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

export default mongoose.model('Analysis', analysisSchema)
