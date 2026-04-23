const parser = require('./src/grammar/parser');

try {
  const result = parser.parse('print(5+3);');
  console.log('Parsed successfully:', result);
} catch (error) {
  console.log('Parse error:', error.message);
}