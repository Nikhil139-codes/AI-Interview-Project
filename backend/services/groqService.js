const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getChatCompletion = async (messages) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to generate response from Groq API');
  }
};

const getSystemPrompt = (config) => {
  return `You are an expert technical interviewer conducting a mock interview.
The candidate is applying for the role of ${config.role}.
Their experience level is: ${config.experienceLevel}.
Their tech stack includes: ${config.techStack.join(', ')}.

Instructions:
1. Start by welcoming the candidate and immediately asking the first technical question.
2. Ask one question at a time. Do not overwhelm the candidate.
3. If they provide code, evaluate it for correctness, time/space complexity, and best practices.
4. Keep your responses concise, professional, and constructive.
5. If the candidate struggles, provide a small hint before giving the answer.
6. Make the questions relevant to their tech stack and experience level.

Candidate's Resume Extract:
${config.resumeText ? config.resumeText.substring(0, 2000) : 'No resume provided.'}`;
};

const getCodeReview = async (language, code, output) => {
  const systemPrompt = `You are a Senior Staff Engineer conducting a technical interview.
The candidate has submitted a code solution in ${language}.
Execution Output:
${output ? output : 'No output (or code failed to run).'}

Your task is to provide a comprehensive code review. Focus on:
1. Correctness (does it solve the problem?).
2. Time and Space Complexity.
3. Best Practices (naming conventions, edge cases).
4. Optimization suggestions.

Be constructive and professional. Use markdown to format your response.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Here is my code:\n\`\`\`${language}\n${code}\n\`\`\`` }
  ];

  return await getChatCompletion(messages);
};

const getInterviewEvaluation = async (messages) => {
  const systemPrompt = `You are a Senior Technical Recruiter and Staff Engineer.
Review the following interview transcript and provide a comprehensive evaluation of the candidate.

You MUST respond with a raw JSON object and nothing else. Do not include markdown formatting or backticks around the JSON.
The JSON must match this exact structure:
{
  "overallScore": 85,
  "technicalScore": 80,
  "communicationScore": 90,
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "feedback": "A paragraph summarizing the performance."
}`;

  const evalMessages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify(messages) }
  ];

  try {
    const response = await getChatCompletion(evalMessages);
    // Parse the JSON (sometimes LLMs add markdown despite instructions)
    const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse evaluation JSON', error);
    return {
      overallScore: 0,
      technicalScore: 0,
      communicationScore: 0,
      strengths: ["Failed to generate strengths"],
      weaknesses: ["Failed to generate weaknesses"],
      feedback: "There was an error generating your feedback."
    };
  }
};

const getResumeAnalysis = async (resumeText) => {
  const systemPrompt = `You are an expert Technical Recruiter and ATS (Applicant Tracking System) software.
Review the following resume and provide a comprehensive evaluation.

You MUST respond with a raw JSON object and nothing else. Do not include markdown formatting or backticks around the JSON.
The JSON must match this exact structure:
{
  "atsScore": 85,
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "missingKeywords": ["string", "string"],
  "summary": "A brief summary of their profile."
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: resumeText ? resumeText.substring(0, 3000) : 'No resume text provided.' }
  ];

  try {
    const response = await getChatCompletion(messages);
    const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse resume analysis JSON', error);
    return {
      atsScore: 0,
      strengths: ["Failed to analyze"],
      weaknesses: ["Failed to analyze"],
      missingKeywords: ["Failed to analyze"],
      summary: "Error processing your resume."
    };
  }
};

module.exports = {
  getChatCompletion,
  getSystemPrompt,
  getCodeReview,
  getInterviewEvaluation,
  getResumeAnalysis,
};
