const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');
if (code.includes('Enhanced Mode')) {
  console.log("Found 'Enhanced Mode' text");
}
