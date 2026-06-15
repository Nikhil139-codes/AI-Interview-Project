const User = require('../models/User');
const InterviewSession = require('../models/InterviewSession');
const SystemPrompt = require('../models/SystemPrompt');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInterviews = await InterviewSession.countDocuments();
    
    // Calculate average score across all completed interviews
    const sessions = await InterviewSession.find({ status: 'completed' });
    let totalScore = 0;
    sessions.forEach(s => totalScore += (s.score || 0));
    const averageScore = sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0;

    res.json({
      totalUsers,
      totalInterviews,
      averageScore,
      activeInterviews: await InterviewSession.countDocuments({ status: 'active' })
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
};

// @desc    Get all system prompts
// @route   GET /api/admin/prompts
// @access  Private/Admin
const getSystemPrompts = async (req, res) => {
  try {
    const prompts = await SystemPrompt.find({});
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ message: 'Server error while fetching prompts' });
  }
};

// @desc    Update system prompt
// @route   PUT /api/admin/prompts/:id
// @access  Private/Admin
const updateSystemPrompt = async (req, res) => {
  try {
    const prompt = await SystemPrompt.findById(req.params.id);
    if (prompt) {
      prompt.name = req.body.name || prompt.name;
      prompt.content = req.body.content || prompt.content;
      prompt.description = req.body.description || prompt.description;
      if (req.body.isActive !== undefined) {
        prompt.isActive = req.body.isActive;
      }
      
      const updatedPrompt = await prompt.save();
      res.json(updatedPrompt);
    } else {
      // If it doesn't exist, we can optionally create it (for initial seeding)
      if (req.body.name && req.body.content) {
        const newPrompt = await SystemPrompt.create({
          name: req.body.name,
          content: req.body.content,
          description: req.body.description,
          isActive: req.body.isActive !== undefined ? req.body.isActive : true
        });
        return res.status(201).json(newPrompt);
      }
      res.status(404).json({ message: 'Prompt not found' });
    }
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ message: 'Server error while updating prompt' });
  }
};

module.exports = {
  getUsers,
  deleteUser,
  getAnalytics,
  getSystemPrompts,
  updateSystemPrompt
};
