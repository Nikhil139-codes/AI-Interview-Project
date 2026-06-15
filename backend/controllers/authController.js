const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        bio: user.bio,
        skills: user.skills,
        socialLinks: user.socialLinks,
        experienceLevel: user.experienceLevel,
        achievements: user.achievements,
        badges: user.badges,
        streak: user.streak,
        uploadedResumes: user.uploadedResumes,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        bio: user.bio,
        skills: user.skills,
        socialLinks: user.socialLinks,
        experienceLevel: user.experienceLevel,
        achievements: user.achievements,
        badges: user.badges,
        streak: user.streak,
        uploadedResumes: user.uploadedResumes,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        bio: user.bio,
        skills: user.skills,
        socialLinks: user.socialLinks,
        experienceLevel: user.experienceLevel,
        achievements: user.achievements,
        badges: user.badges,
        streak: user.streak,
        uploadedResumes: user.uploadedResumes,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Google Client ID
// @route   GET /api/auth/google/client-id
// @access  Public
const getGoogleClientId = async (req, res) => {
  try {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID || '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate with Google Access Token
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    // Call Google OAuth userinfo endpoint to verify token and fetch user details
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    if (!response.ok) {
      return res.status(401).json({ message: 'Invalid Google access token' });
    }

    const googleUser = await response.json();
    const { sub, email, name, picture } = googleUser;

    let user = await User.findOne({ email });

    if (user) {
      // If user exists but has no googleId, link the account
      if (!user.googleId) {
        user.googleId = sub;
        if (!user.avatar) {
          user.avatar = picture || '';
        }
        await user.save();
      }
    } else {
      // Register new user
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture || '',
        password: '', // OAuth users do not require standard password
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      bio: user.bio,
      skills: user.skills,
      socialLinks: user.socialLinks,
      experienceLevel: user.experienceLevel,
      achievements: user.achievements,
      badges: user.badges,
      streak: user.streak,
      uploadedResumes: user.uploadedResumes,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate password reset token and send email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set expiry
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:1234';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const textMessage = `You are receiving this email because you (or someone else) have requested the reset of a password.\n\nPlease click on the following link, or paste this into your browser to complete the process within 30 minutes:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

    const htmlMessage = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">Password Reset Request</h2>
        <p>You are receiving this email because you (or someone else) have requested a password reset for your AI Interview Simulator account.</p>
        <p>Please click the button below to reset your password. This link is only valid for <strong>30 minutes</strong>:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If you cannot click the button, copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request - AI Interview Simulator',
        text: textMessage,
        html: htmlMessage,
      });

      res.json({ message: 'Password reset link has been sent to your email.' });
    } catch (err) {
      console.error('Email send failed:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Hash the token received in URL to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Set new password (pre-save middleware will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  getGoogleClientId,
  googleAuth,
  forgotPassword,
  resetPassword,
};

