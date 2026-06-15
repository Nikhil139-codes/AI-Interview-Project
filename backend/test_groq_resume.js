require('dotenv').config();
const { getResumeAnalysis } = require('./services/groqService');
const pdfParse = require('pdf-parse');
const fs = require('fs');

async function test() {
  try {
    const buffer = fs.readFileSync('dummy.pdf');
    const pdfData = await pdfParse(buffer);
    console.log('PDF parsed:', pdfData.text.substring(0, 50));

    const analysis = await getResumeAnalysis(pdfData.text);
    console.log('Analysis:', analysis);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
