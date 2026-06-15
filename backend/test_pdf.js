const pdfParseObj = require('pdf-parse');
console.log('pdfParseObj.default type:', typeof pdfParseObj.default);
if (typeof pdfParseObj.default === 'function') {
  console.log('pdfParseObj.default is a function');
}
