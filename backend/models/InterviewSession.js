const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['system', 'user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const interviewSessionSchema = new mongoose.Schema(
  {
    interviewConfig: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'InterviewConfig',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    messages: [messageSchema],
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    score: {
      type: Number,
      default: null,
    },
    feedbackData: {
      type: Object, // Will store the JSON response from Groq
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
