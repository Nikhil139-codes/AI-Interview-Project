const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testResume() {
  try {
    // 1. Register to get token
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test Resume',
      email: `test_resume${Date.now()}@example.com`,
      password: 'password123'
    });
    const token = regRes.data.token;

    // 2. Create a dummy PDF file
    fs.writeFileSync('dummy.pdf', '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000219 00000 n \n0000000307 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n399\n%%EOF');

    const data = new FormData();
    data.append('resume', fs.createReadStream('dummy.pdf'));

    const config = {
      headers: {
        ...data.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    };

    const res = await axios.post('http://localhost:5000/api/resume/analyze', data, config);
    console.log('Success:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    } else {
      console.error(err);
    }
  }
}

testResume();
