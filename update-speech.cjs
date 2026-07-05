const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the fallback stuff
code = code.replace(/  const dictationRecorderRef = useRef<MediaRecorder \| null>\(null\);\n  const dictationChunksRef = useRef<BlobPart\[\]>\(\[\]\);\n  const \[isDictatingFallback, setIsDictatingFallback\] = useState\(false\);/, '');
code = code.replace(/ \(isListening \|\| isDictatingFallback\) /g, ' isListening ');

// Add retry logic and specific instructions in onerror
const onerrorRegex = /recognitionRef\.current\.onerror = \(event: any\) => \{[\s\S]*?setIsListening\(false\);\s*setInterimTranscript\(''\);\s*\};/m;
const newOnError = `recognitionRef.current.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setShowMicPermissionModal(true);
        } else if (event.error === 'network' || event.error === 'no-speech') {
          if (speechRetryCountRef.current < 2) {
             speechRetryCountRef.current += 1;
             try {
               recognitionRef.current.start();
               return; // Skip setting isListening to false
             } catch (e) {
               console.error("Retry failed", e);
             }
          }
          if (event.error === 'network') {
             showToast("Network error. Check your connection.");
          }
        } else {
          showToast(\`Voice input error: \${event.error}\`);
        }
        setIsListening(false);
        setInterimTranscript('');
      };`;
code = code.replace(onerrorRegex, newOnError);

// Update toggleListening
const toggleListeningRegex = /const toggleListening = async \(target: 'main' \| 'chat' = 'main'\) => \{[\s\S]*?const handleSpaceSwipeStart = \(e: any\) => \{/m;
const newToggleListening = `const toggleListening = (target: 'main' | 'chat' = 'main') => {
    if (isListening) {
      if (recognitionRef.current) {
         recognitionRef.current.stop();
      }
      return;
    }
    
    setListeningTarget(target);
    speechRetryCountRef.current = 0; // Reset retry count
    
    if (recognitionRef.current) {
      if (target === 'chat') {
        const langMap: Record<string, string> = { ti: 'ti-ER', am: 'am-ET', en: 'en-US', auto: 'ti-ER' };
        // @ts-ignore
        recognitionRef.current.lang = langMap[chatLanguage] || 'ti-ER';
      } else {
        recognitionRef.current.lang = activeLanguage === 'en' ? 'en-US' : (activeLanguage === 'am' ? 'am-ET' : 'ti-ER');
      }
      
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        console.error('Failed to start recognition', e);
        if (e.name === 'NotAllowedError') {
           setShowMicPermissionModal(true);
        } else {
           showToast("Failed to start mic.");
        }
      }
    }
  };

  const handleSpaceSwipeStart = (e: any) => {`;
code = code.replace(toggleListeningRegex, newToggleListening);

// Update Modal Text
code = code.replace(
  "We couldn't access your microphone. If you are using this app inside a preview (like AI Studio) or if permissions were denied, you might need to open the app in a new tab or update your browser permissions.",
  "We couldn't access your microphone. Please allow microphone access via your mobile browser's address bar settings (e.g., tap the Lock icon in Chrome or the \"aA\" icon in Safari), or try opening the app in a new tab."
);

fs.writeFileSync('src/App.tsx', code);
