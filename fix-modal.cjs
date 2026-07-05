const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'We couldn\\'t access your microphone. If you are using this app inside a preview (like AI Studio) or if permissions were denied, you might need to open the app in a new tab or update your browser permissions.',
  'We couldn\\'t access your microphone. Please allow microphone access via your mobile browser\\'s address bar settings (e.g., tap the Lock icon in Chrome or the "aA" icon in Safari), or try opening the app in a new tab.'
);

// We also need to hide mic button if !isSpeechRecognitionSupported
// In Chat Input:
code = code.replace(
  /<button \n                    onClick=\{\(\) => toggleListening\('chat'\)\}/,
  '{isSpeechRecognitionSupported && <button \\n                    onClick={() => toggleListening(\\'chat\\')}'
);
code = code.replace(
  /                     <Mic className="w-4 h-4" \/>\n                  <\/button>/,
  '                     <Mic className="w-4 h-4" />\\n                  </button>}'
);

// In Keyboard map
code = code.replace(
  'const isSpecial = [\\'shift\\', \\'backspace\\', \\'globe\\', \\'space\\', \\'enter\\', \\'123\\', \\'mic\\', \\'emoji\\', \\'ABC\\'].includes(key);',
  'if (key === \\'mic\\' && !isSpeechRecognitionSupported) return null;\\n              const isSpecial = [\\'shift\\', \\'backspace\\', \\'globe\\', \\'space\\', \\'enter\\', \\'123\\', \\'mic\\', \\'emoji\\', \\'ABC\\'].includes(key);'
);


fs.writeFileSync('src/App.tsx', code);
