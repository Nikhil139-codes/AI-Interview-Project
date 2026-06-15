const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.skills = req.body.skills || user.skills;
      user.experienceLevel = req.body.experienceLevel || user.experienceLevel;
      
      if (req.body.socialLinks) {
        user.socialLinks = { ...user.socialLinks, ...req.body.socialLinks };
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        socialLinks: updatedUser.socialLinks,
        experienceLevel: updatedUser.experienceLevel,
        token: req.headers.authorization.split(' ')[1] // keep same token
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// @desc    Upload resume
// @route   POST /api/users/resume
// @access  Private
const uploadResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
      }

      const newResume = {
        fileName: req.file.originalname,
        fileUrl: '', // In a real app, this would be an S3 or Cloudinary URL
        uploadedAt: Date.now()
      };

      user.uploadedResumes.push(newResume);
      await user.save();

      res.json(user.uploadedResumes);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Server error while uploading resume' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadResume
};
