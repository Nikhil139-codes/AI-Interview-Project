require('dotenv').config();
const { getChatCompletion } = require('./services/groqService');

async function testGroq() {
  try {
    const res = await getChatCompletion([{ role: 'user', content: 'hello' }]);
    console.log('Groq Response:', res);
  } catch (err) {
    console.error('Groq test failed:', err);
  }
}

testGroq();
