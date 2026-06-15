const axios = require('axios');

async function testDSA() {
  try {
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'DSA User',
      email: `dsa${Date.now()}@example.com`,
      password: 'password123'
    });
    const token = regRes.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const payload = {
      role: `DSA Practice: Two Sum`,
      experienceLevel: 'Practice',
      techStack: ['Arrays', 'Data Structures', 'Algorithms']
    };

    console.log('Setting up DSA interview...');
    const setupRes = await axios.post('http://localhost:5000/api/interviews/setup', payload, config);
    const id = setupRes.data._id;
    console.log('Setup complete, config id:', id);

    console.log('Starting session...');
    const startRes = await axios.post(`http://localhost:5000/api/interviews/${id}/start`, {}, config);
    console.log('Session started, messages:', startRes.data.messages);
    
    console.log('Ending session...');
    const endRes = await axios.post(`http://localhost:5000/api/interviews/${id}/end`, {}, config);
    console.log('Session ended successfully');

  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

testDSA();
