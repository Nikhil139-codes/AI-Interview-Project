const pdfParse = require('pdf-parse');
console.log('Type:', typeof pdfParse);
if (typeof pdfParse === 'function') {
  console.log('It is a function');
} else {
  console.log('Keys:', Object.keys(pdfParse));
}
