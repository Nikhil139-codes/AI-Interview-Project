const InterviewConfig = require('../models/InterviewConfig');
const pdfParse = require('pdf-parse');

// @desc    Create a new interview setup and parse resume
// @route   POST /api/interviews/setup
// @access  Private
const createInterviewSetup = async (req, res) => {
  try {
    const { role, experienceLevel, techStack } = req.body;

    // Convert techStack from string to array if it's sent as a comma-separated string
    let parsedTechStack = techStack;
    if (typeof techStack === 'string') {
      parsedTechStack = techStack.split(',').map((item) => item.trim());
    }

    let resumeText = '';
    let resumeFileName = '';

    if (req.file) {
      // Parse the PDF
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
      resumeFileName = req.file.originalname;
    }

    const config = await InterviewConfig.create({
      user: req.user.id,
      role,
      experienceLevel,
      techStack: parsedTechStack,
      resumeText,
      resumeFileName
    });

    res.status(201).json(config);
  } catch (error) {
    console.error('Error creating interview setup:', error);
    res.status(500).json({ message: 'Server error while creating interview setup' });
  }
};

// @desc    Get all interview configurations for a user
// @route   GET /api/interviews
// @access  Private
const getUserInterviews = async (req, res) => {
  try {
    const interviews = await InterviewConfig.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(interviews);
  } catch (error) {
    console.error('Error fetching user interviews:', error);
    res.status(500).json({ message: 'Server error while fetching interviews' });
  }
};

module.exports = {
  createInterviewSetup,
  getUserInterviews,
};
