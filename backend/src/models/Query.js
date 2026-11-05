const mongoose = require('mongoose');

const entitySubSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    type: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    startPos: { type: Number },
    endPos: { type: Number },
  },
  { _id: false }
);

const ragSourceSchema = new mongoose.Schema(
  {
    title: { type: String },
    url: { type: String },
    snippet: { type: String },
    relevanceScore: { type: Number, min: 0, max: 1 },
  },
  { _id: false }
);

const querySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalText: {
      type: String,
      required: [true, 'Query text is required'],
      trim: true,
      maxlength: [5000, 'Query text cannot exceed 5000 characters'],
    },
    detectedLanguage: {
      type: String,
      default: 'en',
    },
    isCodeMixed: {
      type: Boolean,
      default: false,
    },
    extractedEntities: {
      symptoms: { type: [entitySubSchema], default: [] },
      diseases: { type: [entitySubSchema], default: [] },
      medicines: { type: [entitySubSchema], default: [] },
      doctors: { type: [entitySubSchema], default: [] },
      hospitals: { type: [entitySubSchema], default: [] },
      bodyParts: { type: [entitySubSchema], default: [] },
      durations: { type: [entitySubSchema], default: [] },
    },
    classifiedIntent: {
      type: String,
      default: 'unknown',
    },
    intentConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    ragSources: {
      type: [ragSourceSchema],
      default: [],
    },
    aiResponse: {
      type: String,
      default: '',
    },
    responseLanguage: {
      type: String,
      default: 'en',
    },
    processingTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
querySchema.index({ userId: 1, createdAt: -1 });
querySchema.index({ detectedLanguage: 1 });
querySchema.index({ classifiedIntent: 1 });

const Query = mongoose.model('Query', querySchema);

module.exports = Query;
