const pdfParse = require('pdf-parse');
const { getResumeAnalysis } = require('../services/groqService');

// @desc    Analyze a resume and return an ATS score
// @route   POST /api/resume/analyze
// @access  Private
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF resume file' });
    }

    // Parse the PDF
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    // Send the text to Groq for analysis
    const analysis = await getResumeAnalysis(resumeText);

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ message: 'Server error while analyzing resume' });
  }
};

module.exports = {
  analyzeResume,
};
