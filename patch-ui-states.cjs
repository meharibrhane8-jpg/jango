const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update keyboard mic key
code = code.replace(
  "if (key === 'mic' && !isSpeechRecognitionSupported) return null;",
  "if (key === 'mic' && !isSpeechRecognitionSupported && !enhancedTigrinyaMode) return null;"
);

// Update status text
code = code.replace(
  "{isListening ? t('listening') : t('ready')}",
  "{(isListening || isEnhancedRecording) ? t('listening') : t('ready')}"
);

// Update status dot color
code = code.replace(
  "isListening ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'",
  "(isListening || isEnhancedRecording) ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'"
);

// Update main keyboard mic button
code = code.replace(
  "{isListening ? <MicOff className=\"w-5 h-5 sm:w-6 sm:h-6 text-indigo-400\" /> : <Mic className=\"w-5 h-5 sm:w-6 sm:h-6 opacity-60\" />}",
  "{(isListening || isEnhancedRecording) ? <MicOff className=\"w-5 h-5 sm:w-6 sm:h-6 text-indigo-400\" /> : <Mic className=\"w-5 h-5 sm:w-6 sm:h-6 opacity-60\" />}"
);

fs.writeFileSync('src/App.tsx', code);
