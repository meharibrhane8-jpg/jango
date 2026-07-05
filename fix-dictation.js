const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add speechRetryCountRef
if (!code.includes('speechRetryCountRef')) {
  code = code.replace(
    'const recognitionRef = useRef<any>(null);',
    'const recognitionRef = useRef<any>(null);\n  const speechRetryCountRef = useRef<number>(0);\n  const isSpeechRecognitionSupported = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);'
  );
}

// Write the code back so we can see if it worked
fs.writeFileSync('src/App.tsx', code);
