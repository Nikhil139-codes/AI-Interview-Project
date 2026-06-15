const axios = require('axios');

async function test() {
  try {
    // 1. Register
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
    const token = regRes.data.token;
    console.log('Registered, token:', token);

    // 2. Setup Interview
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const setupRes = await axios.post('http://localhost:5000/api/interviews/setup', {
      role: 'Frontend',
      experienceLevel: 'Entry',
      techStack: 'React'
    }, config);
    console.log('Setup complete, id:', setupRes.data._id);

    // 3. Start Interview
    const startRes = await axios.post(`http://localhost:5000/api/interviews/${setupRes.data._id}/start`, {}, config);
    console.log('Start complete, response:', startRes.data);

  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    } else {
      console.error(err);
    }
  }
}

test();
