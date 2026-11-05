const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    language: {
      type: String,
      default: 'en',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    analysis: {
      detectedLanguage: { type: String },
      isCodeMixed: { type: Boolean, default: false },
      intent: { type: String },
      intentConfidence: { type: Number, min: 0, max: 1 },
      entities: { type: mongoose.Schema.Types.Mixed, default: {} },
      processingTime: { type: Number, default: 0 },
    },
  },
  { _id: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      maxlength: 200,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

chatSessionSchema.index({ userId: 1, createdAt: -1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;
