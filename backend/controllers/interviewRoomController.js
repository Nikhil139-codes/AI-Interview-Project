const InterviewSession = require('../models/InterviewSession');
const InterviewConfig = require('../models/InterviewConfig');
const { getChatCompletion, getSystemPrompt, getCodeReview } = require('../services/groqService');

// @desc    Start or resume an interview session
// @route   POST /api/interviews/:id/start
// @access  Private
const startInterviewSession = async (req, res) => {
  try {
    const configId = req.params.id;
    const config = await InterviewConfig.findById(configId);

    if (!config) {
      return res.status(404).json({ message: 'Interview configuration not found' });
    }

    if (config.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if a session already exists for this config
    let session = await InterviewSession.findOne({ interviewConfig: configId });

    if (session) {
      return res.status(200).json(session);
    }

    // If no session exists, create a new one
    const systemPrompt = getSystemPrompt(config);
    const initialMessages = [
      { role: 'system', content: systemPrompt },
    ];

    // Generate the first question from Groq
    const firstQuestion = await getChatCompletion(initialMessages);

    initialMessages.push({ role: 'assistant', content: firstQuestion });

    session = await InterviewSession.create({
      interviewConfig: configId,
      user: req.user.id,
      messages: initialMessages,
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error starting interview session:', error);
    res.status(500).json({ message: 'Server error while starting interview session' });
  }
};

// @desc    Submit an answer and get next question
// @route   POST /api/interviews/:id/answer
// @access  Private
const submitAnswer = async (req, res) => {
  try {
    const configId = req.params.id;
    const { answer, code } = req.body;

    const session = await InterviewSession.findOne({ interviewConfig: configId });

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Format the user's answer (combining text and code if provided)
    let userMessageContent = answer;
    if (code && code.trim() !== '') {
      userMessageContent += `\n\nHere is my code:\n\`\`\`\n${code}\n\`\`\``;
    }

    const userMessage = { role: 'user', content: userMessageContent };
    session.messages.push(userMessage);

    // Prepare messages for Groq API (excluding timestamps)
    const messagesForApi = session.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Get response from Groq
    const aiResponse = await getChatCompletion(messagesForApi);

    const assistantMessage = { role: 'assistant', content: aiResponse };
    session.messages.push(assistantMessage);

    await session.save();

    res.status(200).json(session);
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Server error while submitting answer' });
  }
};

// @desc    Submit code for AI review
// @route   POST /api/interviews/:id/code-review
// @access  Private
const submitCodeReview = async (req, res) => {
  try {
    const configId = req.params.id;
    const { language, code, output } = req.body;

    const session = await InterviewSession.findOne({ interviewConfig: configId });

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Add user's submission to chat history
    session.messages.push({
      role: 'user',
      content: `I submitted a code solution in ${language}.\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nOutput:\n${output}`
    });

    // Get specialized code review from Groq
    const reviewResponse = await getCodeReview(language, code, output);

    session.messages.push({
      role: 'assistant',
      content: reviewResponse
    });

    await session.save();

    res.status(200).json(session);
  } catch (error) {
    console.error('Error in code review:', error);
    res.status(500).json({ message: 'Server error while performing code review' });
  }
};

module.exports = {
  startInterviewSession,
  submitAnswer,
  submitCodeReview,
};
