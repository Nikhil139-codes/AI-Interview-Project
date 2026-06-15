const axios = require('axios');

async function testPiston() {
  try {
    const res = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: 'javascript',
      version: '18.15.0',
      files: [{ content: 'console.log("hello piston");' }]
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error status:', err.response ? err.response.status : err.message);
    if (err.response) console.error(err.response.data);
  }
}

testPiston();
