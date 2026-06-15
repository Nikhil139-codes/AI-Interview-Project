const InterviewSession = require('../models/InterviewSession');
const { getInterviewEvaluation } = require('../services/groqService');

// @desc    End interview and generate feedback
// @route   POST /api/interviews/:id/end
// @access  Private
const endInterviewAndEvaluate = async (req, res) => {
  try {
    const configId = req.params.id;
    const session = await InterviewSession.findOne({ interviewConfig: configId }).populate('interviewConfig');

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (session.status === 'completed') {
      return res.status(200).json(session);
    }

    // Format messages for evaluation
    const messagesForApi = session.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const feedbackData = await getInterviewEvaluation(messagesForApi);

    session.status = 'completed';
    session.score = feedbackData.overallScore || 0;
    session.feedbackData = feedbackData;

    await session.save();

    res.status(200).json(session);
  } catch (error) {
    console.error('Error ending interview:', error);
    res.status(500).json({ message: 'Server error while ending interview' });
  }
};

// @desc    Get user analytics
// @route   GET /api/interviews/analytics
// @access  Private
const getUserAnalytics = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user.id, status: 'completed' });
    
    const totalInterviews = sessions.length;
    let averageScore = 0;
    
    if (totalInterviews > 0) {
      const totalScore = sessions.reduce((acc, curr) => acc + (curr.score || 0), 0);
      averageScore = Math.round(totalScore / totalInterviews);
    }

    // Recent scores for a chart
    const recentScores = sessions.slice(-5).map(s => s.score || 0);

    res.status(200).json({
      totalInterviews,
      averageScore,
      recentScores,
      recentSessions: sessions.slice(-5).reverse(), // Send some recent completed sessions
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
};

// @desc    Get specific session details
// @route   GET /api/interviews/:id
// @access  Private
const getSessionDetails = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ interviewConfig: req.params.id }).populate('interviewConfig');
    
    if (!session || session.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Server error while fetching session' });
  }
};

module.exports = {
  endInterviewAndEvaluate,
  getUserAnalytics,
  getSessionDetails
};
