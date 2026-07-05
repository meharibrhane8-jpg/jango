const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state variables
if (!code.includes('enhancedTigrinyaMode')) {
  code = code.replace(
    'const isSpeechRecognitionSupported = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);',
    `const isSpeechRecognitionSupported = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const [enhancedTigrinyaMode, setEnhancedTigrinyaMode] = useState(false);
  const enhancedMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const enhancedChunksRef = useRef<BlobPart[]>([]);
  const [isEnhancedRecording, setIsEnhancedRecording] = useState(false);`
  );
}

// 2. Modify toggleListening to handle enhancedTigrinyaMode
const toggleListeningStart = code.indexOf(`const toggleListening = (target: 'main' | 'chat' = 'main') => {`);
if (toggleListeningStart !== -1) {
  const toggleListeningEnd = code.indexOf(`const handleSpaceSwipeStart =`, toggleListeningStart);
  
  const originalToggle = code.substring(toggleListeningStart, toggleListeningEnd);
  
  const newToggle = `const toggleListening = async (target: 'main' | 'chat' = 'main') => {
    if (isListening || isEnhancedRecording) {
      if (isEnhancedRecording && enhancedMediaRecorderRef.current) {
        enhancedMediaRecorderRef.current.stop();
      } else if (recognitionRef.current) {
         recognitionRef.current.stop();
      }
      return;
    }
        
    setListeningTarget(target);
    speechRetryCountRef.current = 0; // Reset retry count
    
    if (enhancedTigrinyaMode) {
       try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          enhancedMediaRecorderRef.current = recorder;
          enhancedChunksRef.current = [];
          
          recorder.ondataavailable = (e) => {
             if (e.data.size > 0) enhancedChunksRef.current.push(e.data);
          };
          
          recorder.onstart = () => setIsEnhancedRecording(true);
          
          recorder.onstop = async () => {
             setIsEnhancedRecording(false);
             stream.getTracks().forEach(track => track.stop());
             const blob = new Blob(enhancedChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
             
             // Convert blob to base64
             const reader = new FileReader();
             reader.readAsDataURL(blob);
             reader.onloadend = async () => {
                const base64data = reader.result as string;
                const base64Audio = base64data.split(',')[1];
                let mimeType = base64data.split(';')[0].split(':')[1] || 'audio/webm';
                
                try {
                   showToast("Transcribing...");
                   const lang = target === 'chat' ? (chatLanguage === 'auto' ? 'ti' : chatLanguage) : activeLanguage;
                   const text = await geminiTranscribe(base64Audio, mimeType, lang);
                   
                   if (text) {
                      if (target === 'chat') {
                         setChatInput(prev => prev + text + ' ');
                      } else {
                         setText(prev => {
                            const index = cursorIndexRef.current;
                            const insertText = (prev[index - 1] === ' ' || index === 0 ? '' : ' ') + text + ' ';
                            const newText = prev.slice(0, index) + insertText + prev.slice(index);
                            setCursorIndex(index + insertText.length);
                            return newText;
                         });
                      }
                   }
                } catch (err) {
                   console.error("Enhanced transcription failed", err);
                   showToast("Transcription failed. Please try again.");
                }
             };
          };
          
          recorder.start();
       } catch (err: any) {
          console.error("Mic access denied for enhanced mode", err);
          showToast("Microphone access denied. Check your browser permissions.");
       }
       return;
    }
    
    if (recognitionRef.current) {
      if (target === 'chat') {
        const langMap: Record<string, string> = { ti: 'ti-ER', am: 'am-ET', en: 'en-US', auto: 'ti-ER' };
        // @ts-ignore
        recognitionRef.current.lang = langMap[chatLanguage] || 'ti-ER';
      } else {
        recognitionRef.current.lang = activeLanguage === 'en' ? 'en-US' : (activeLanguage === 'am' ? 'am-ET' : 'ti-ER');
      }
      
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
           // On mobile some browsers need us to explicitly request getUserMedia before SpeechRecognition
           try {
             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
             stream.getTracks().forEach(track => track.stop());
           } catch(ignore){}
        }
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

  `;
  
  code = code.replace(originalToggle, newToggle);
}

// 3. Update the chat toolbar UI
const chatMicRegex = /\{isSpeechRecognitionSupported && \(\s*<button\s*onClick=\{\(\) => toggleListening\('chat'\)\}\s*className=\{`p-2 rounded-full transition-all duration-200 flex items-center justify-center \$\{isListening \? 'bg-rose-500 text-white shadow-lg shadow-rose-500\/20 animate-pulse' : \(currentTheme\.isDark \? 'text-white\/30 hover:bg-white\/5 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'\)\}`\}\s*title="Voice Input"\s*>\s*<Mic className="w-4 h-4" \/>\s*<\/button>\s*\)\}/;

const newChatMic = `<label className="flex items-center gap-2 cursor-pointer mr-2">
                    <span className={\`text-[10px] font-bold uppercase tracking-wider \${currentTheme.isDark ? 'text-white/50' : 'text-slate-500'}\`}>Enhanced Mode</span>
                    <div className="relative inline-flex items-center">
                      <input type="checkbox" className="sr-only peer" checked={enhancedTigrinyaMode} onChange={(e) => setEnhancedTigrinyaMode(e.target.checked)} />
                      <div className="w-6 h-3 bg-slate-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </div>
                  </label>
                  {(isSpeechRecognitionSupported || enhancedTigrinyaMode) && (
                    <button 
                      onClick={() => toggleListening('chat')}
                      className={\`p-2 rounded-full transition-all duration-200 flex items-center justify-center \${(isListening || isEnhancedRecording) ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 animate-pulse' : (currentTheme.isDark ? 'text-white/30 hover:bg-white/5 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700')}\`}
                      title="Voice Input"
                    >
                       <Mic className="w-4 h-4" />
                    </button>
                  )}`;

code = code.replace(chatMicRegex, newChatMic);


fs.writeFileSync('src/App.tsx', code);
