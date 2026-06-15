const mongoose = require('mongoose');

const interviewConfigSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    role: {
      type: String,
      required: [true, 'Please add a role for the interview'],
    },
    experienceLevel: {
      type: String,
      required: [true, 'Please add an experience level'],
    },
    techStack: {
      type: [String],
      required: [true, 'Please provide at least one technology in the stack'],
    },
    resumeText: {
      type: String,
      required: false,
    },
    resumeFileName: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InterviewConfig', interviewConfigSchema);
