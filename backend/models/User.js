const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    avatar: {
      type: String,
      default: '',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    experienceLevel: {
      type: String,
      default: '',
    },
    achievements: [
      {
        title: String,
        description: String,
        date: { type: Date, default: Date.now },
      }
    ],
    badges: {
      type: [String],
      default: [],
    },
    streak: {
      type: Number,
      default: 0,
    },
    uploadedResumes: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  if (!this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
