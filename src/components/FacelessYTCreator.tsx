import React, { useState, useEffect, useRef } from 'react';
import { 
  Clapperboard, Sparkles, Loader2, ArrowRight, ArrowLeft, Check, 
  RefreshCw, Video, Film, Music, Compass, AlignLeft, CheckCircle2,
  Copy, Save, HelpCircle, Eye, ChevronRight, PenTool, Plus, Trash2, X
} from 'lucide-react';
import { callGeminiAPI } from '../services/geminiService';

interface FacelessYTCreatorProps {
  activeLanguage: string;
  currentTheme: { isDark: boolean };
  onClose: () => void;
  onAppendScriptToChat: (title: string, scriptMarkdown: string) => void;
  onOpenSavePanel: (scriptData: any) => void;
  onScrollToBottom?: () => void;
  initialContextText?: string;
  onClearContext?: () => void;
  onChoiceSelected?: (stepNum: number, stepName: string, choice: string) => void;
}

export const FacelessYTCreator: React.FC<FacelessYTCreatorProps> = ({
  activeLanguage,
  currentTheme,
  onClose,
  onAppendScriptToChat,
  onOpenSavePanel,
  onScrollToBottom,
  initialContextText,
  onClearContext,
  onChoiceSelected
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Localization Dictionary
  const translations: Record<string, Record<string, string>> = {
    en: {
      title: "Faceless YouTube Script Wizard",
      subtitle: "Build viral automation videos in minutes",
      step1Title: "Step 1: Choose Your Channel Niche & Audience Theme",
      step2Title: "Step 2: Choose Your Attention-Grabbing Video Concept",
      step3Title: "Step 3: Select Your Voiceover Narrative Tone & Pacing",
      step4Title: "Step 4: Choose the Script Layout Structure",
      step5Title: "Step 5: Pick the Visual Style & Aesthetic Themes",
      step1Desc: "Select the core theme of your faceless YouTube channel to begin.",
      step2Desc: "Pick an ultra-viral topic idea designed to capture user curiosity.",
      step3Desc: "Determine the speed, delivery, and atmospheric vibe of your voiceover.",
      step4Desc: "Select how your video should flow chronologically from hook to conclusion.",
      step5Desc: "Define what kind of graphics or B-roll footage you'll match with your script.",
      loadingSuggestions: "Consulting YouTube Algorithms...",
      specifyCustom: "+ Specify Custom Topic",
      customPlaceholder1: "e.g., Unsolved Ancient Civilization mysteries",
      customPlaceholder2: "e.g., The secret map found inside the Great Pyramid",
      customPlaceholderDefault: "Type your custom option here...",
      next: "Next",
      cancel: "Cancel",
      back: "Back",
      stepOf: "Step {step} of 5",
      finishGenerate: "Finish & Generate Script",
      generatingTitle: "Generating Detailed YouTube Script",
      generatingDesc: "Deep thinking AI is writing retention hooks, visual cues, scene directions, and pacing prompts...",
      scriptReady: "✓ YouTube Video Script Ready!",
      scriptReadyDesc: "Fully structured with B-roll directions, voice scripts, tags, and visuals.",
      sendToChat: "Send to Chat",
      saveProject: "Save Project",
      newScript: "New Script",
      activeContext: "Talking point context detected:",
      clearContext: "Reset context",
      retry: "Retry Generation"
    },
    ti: {
      title: "ናይ ዩቱብ ስክሪፕት ፈጣሪ",
      subtitle: "ኣብ ውሑድ ደቓይቕ ዝውርወሩ ቪድዮታት ስክሪፕት ስራሕ",
      step1Title: "ደረጃ 1: ናይ ቻነልኩም ዓውዲ (Niche) ምረጹ",
      step2Title: "ደረጃ 2: ተሰሓቢ ናይ ቪድዮ ሓሳብ ምረጹ",
      step3Title: "ደረጃ 3: ናይ ድምጺ ኣቀራርባን ቅዲን ምረጹ",
      step4Title: "ደረጃ 4: ናይ ስክሪፕት መዋቅር ምረጹ",
      step5Title: "ደረጃ 5: ናይ ምርኣይ ስእላዊ ቅዲ ምረጹ",
      step1Desc: "ካብቶም ዝቐረቡ ናይ ቻነል ኣርእስትታት ሓደ ብምምራጽ ይጀምሩ።",
      step2Desc: "ተዓዘብቲ ንምስሓብ ዝተዳለወ ዝበለጸ ናይ ቪድዮ ኣርእስቲ ምረጹ።",
      step3Desc: "ናይ ድምጺ ፍጥነትን ስምዒትን ኣብዚ ይውስኑ።",
      step4Desc: "ቪድዮኹም ብኸመይ ቅደም-ሰዓብ ክኸይድ ከምዘለዎ ምረጹ።",
      step5Desc: "ምስ ድምጺ ዝሰማማዕ ናይ ስእልታት ወይ ቪድዮታት ንድፊ ይውስኑ።",
      loadingSuggestions: "ንድፍታት ካብ ዩቱብ ይድለ ኣሎ...",
      specifyCustom: "+ ናይ ባዕልኹም ኣርእስቲ ጽሓፉ",
      customPlaceholder1: "ንኣብነት: ስውር ምስጢራት ጥንታዊ ስልጣነታት",
      customPlaceholder2: "ንኣብነት: ኣብ ፒራሚድ ዝተረኽበ ስውር ካርታ",
      customPlaceholderDefault: "ናይ ባዕልኹም ምርጫ ኣብዚ ጽሓፉ...",
      next: "ቀጽል",
      cancel: "ሰርዝ",
      back: "ንድሕሪት",
      stepOf: "ደረጃ {step} ካብ 5",
      finishGenerate: "ወድእ እሞ ስክሪፕት ፍጠር",
      generatingTitle: "ዝርዝር ስክሪፕት ይዳሎ ኣሎ",
      generatingDesc: "ብሉጽ ኣእምሮኣዊ ኤኣይ (AI) ድምጺ፣ ስእላዊ መግለጺታትን ስክሪፕትን ይጽሕፍ ኣሎ...",
      scriptReady: "✓ ናይ ዩቱብ ስክሪፕት ተዳልዩ ኣሎ!",
      scriptReadyDesc: "ምሉእ ስእላዊ መግለጺታት፣ ናይ ድምጺ ጽሑፍ፣ ታግታትን ትሕዝቶን ዘጠቓለለ።",
      sendToChat: "ናብ ዕላል ስደድ",
      saveProject: "ፕሮጀክት ዓቅብ",
      newScript: "ሓድሽ ስክሪፕት",
      activeContext: "ካብ ዕላል ዝተረኽበ ኣርእስቲ:",
      clearContext: "ኣርእስቲ ኣጽሪ",
      retry: "እንደገና ፈትን"
    },
    am: {
      title: "የዩቲዩብ ስክሪፕት ፈጣሪ",
      subtitle: "በጥቂት ደቂቃዎች ውስጥ ተወዳጅ የሆኑ ቪዲዮዎችን ስክሪፕት ይስሩ",
      step1Title: "ደረጃ 1: የቻናልዎን ዘርፍ (Niche) ይምረጡ",
      step2Title: "ደረጃ 2: ሳቢ የቪዲዮ ሃሳብ ይምረጡ",
      step3Title: "ደረጃ 3: የድምፅ አቀራረብ እና ስልት ይምረጡ",
      step4Title: "ደረጃ 4: የስክሪፕት መዋቅር ይምረጡ",
      step5Title: "ደረጃ 5: የእይታ እና የስዕል ስልት ይምረጡ",
      step1Desc: "ለመጀመር የዩቲዩብ ቻናልዎን ዋና ጭብጥ ይምረጡ።",
      step2Desc: "ተመልካቾችን ለመሳብ የተዘጋጀ ምርጥ የቪዲዮ አርእስት ይምረጡ።",
      step3Desc: "የድምፅዎን ፍጥነትና ስሜት እዚህ ይወስኑ።",
      step4Desc: "ቪዲዮዎ በምን ቅደም-ተከተል መሄድ እንዳለበት ይምረጡ።",
      step5Desc: "ከድምፁ ጋር የሚስማማ የምስሎች ወይም የቪዲዮዎች ንድፍ ይወስኑ።",
      loadingSuggestions: "የሃሳብ አማራጮች ከዩቲዩብ እየተፈለጉ ነው...",
      specifyCustom: "+ የራስዎን አርእስት ይጻፉ",
      customPlaceholder1: "ለምሳሌ: የጥንታውያን ስልጣኔዎች ስውር ምስጢራት",
      customPlaceholder2: "ለምሳሌ: በፒራሚድ ውስጥ የተገኘው ስውር ካርታ",
      customPlaceholderDefault: "የራስዎን ምርጫ እዚህ ይጻፉ...",
      next: "ቀጥል",
      cancel: "ሰርዝ",
      back: "ወደኋላ",
      stepOf: "ደረጃ {step} ከ 5",
      finishGenerate: "ጨርስና ስክሪፕቱን አዘጋጅ",
      generatingTitle: "ዝርዝር ስክሪፕት እየተዘጋጀ ነው",
      generatingDesc: "ብልህ ኤአይ (AI) የድምፅ አቀራረብን፣ ምስሎችንና ስክሪፕቱን በዝርዝር እየጻፈ ነው...",
      scriptReady: "✓ የዩቲዩብ ስክሪፕት ተዘጋጅቷል!",
      scriptReadyDesc: "ሙሉ የምስል መግለጫዎች፣ የድምፅ ንባብ ጽሑፍ፣ ታጎችና ይዘቶችን ያካተተ።",
      sendToChat: "ወደ ውይይት ላክ",
      saveProject: "ፕሮጀክት አስቀምጥ",
      newScript: "አዲስ ስክሪፕት",
      activeContext: "ከውይይቱ የተገኘ አርእስት:",
      clearContext: "አርእስቱን አጽዳ",
      retry: "እንደገና ሞክር"
    }
  };

  const t = (key: string): string => {
    const lang = translations[activeLanguage] ? activeLanguage : 'en';
    return translations[lang][key] || translations['en'][key] || key;
  };

  // Selections state
  const [selections, setSelections] = useState({
    niche: '',
    concept: '',
    tone: '',
    outline: '',
    visualStyle: '',
  });

  // Dynamic suggestions from Gemini
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Final Generated Script
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [generatedTitle, setGeneratedTitle] = useState<string>('');

  // Default initial niches
  const defaultNiches = [
    "Unsolved Space Mysteries & Cosmic Horror",
    "Dark History, Secrets & Untold Truths",
    "High-Yield Wealth Hacks & Financial Psychology",
    "Futuristic Tech, AI & Cybernetic Speculations",
    "Mindset Secrets of the Top 1% Leaders"
  ];

  const defaultTones = [
    "Cinematic & Deep Narrator (Immersive voiceover, heavy pauses)",
    "Fast-Paced, Engaging & Energetic (High-retention voiceover)",
    "Mysterious & Suspenseful Whispers (Great for mystery/horror)",
    "Educational, Warm & Clear (Calm, highly informative, clear pacing)"
  ];

  const defaultVisualStyles = [
    "Ultra-realistic dark AI artwork with ambient space sweeps",
    "Fast cuts of royalty-free cinematic footage with glitch transitions",
    "Minimalist motion graphics, slow camera zooms, and deep neon hues",
    "Dramatic high-contrast shadow play with historical archive footage"
  ];

  // Dynamic suggestion generator
  const fetchDynamicSuggestions = async (currentStep: number) => {
    setLoading(true);
    setError(null);
    setSuggestions([]);

    let prompt = '';
    const langName = activeLanguage === 'ti' ? 'Tigrinya' : activeLanguage === 'am' ? 'Amharic' : 'English';
    const langDirective = activeLanguage !== 'en' 
      ? `IMPORTANT: Write the suggestions entirely in ${langName} using proper Ge'ez script. Do not write in Latin or phonetic characters for the main suggestions.` 
      : `IMPORTANT: Write the suggestions entirely in clear, high-retention English.`;

    if (currentStep === 1) {
      // Fetch Niches based on chat history / active context
      prompt = `Act as an expert YouTube growth strategist. Based on this video and discussion topic/context: "${initialContextText}", generate exactly 4 attention-grabbing, highly targeted channel niche categories or specialized video theme angles suitable for a faceless YouTube automation channel. 
      ${langDirective}
      Return only a JSON array of 4 strings, like this: ["Niche 1", "Niche 2", "Niche 3", "Niche 4"]. Do not include markdown formatting or backticks.`;
    } else if (currentStep === 2) {
      // Fetch Concepts based on Selected Niche
      prompt = `Act as an expert YouTube growth strategist. Based on the selected niche "${selections.niche}", generate exactly 4 attention-grabbing, highly viral video ideas/titles suitable for a faceless YouTube channel. The titles must be curiosity-inducing (e.g., "Why James Webb's New Discovery Terrified Scientists" or "The Dark Truth Behind..."). 
      ${langDirective}
      Return only a JSON array of 4 strings, like this: ["Title 1", "Title 2", "Title 3", "Title 4"]. Do not include markdown formatting or backticks.`;
    } else if (currentStep === 4) {
      // Fetch Outline based on Niche and Concept
      prompt = `Act as an expert YouTube video editor. Based on the video niche "${selections.niche}" and video topic/concept "${selections.concept}", generate exactly 4 interesting outlines or structures for a 5-minute video.
      ${langDirective}
      Return only a JSON array of 4 strings describing key parts or structure paths. Example format: ["Hook: The Discovery, Part 1: Weird Data, Part 2: The Coverup, Outro", "Alternative structure..."].
      Return exactly 4 structure ideas in a plain JSON array of strings: ["Option 1", "Option 2", "Option 3", "Option 4"]. No markdown.`;
    }

    try {
      const resData = await callGeminiAPI('gemini-3.5-flash', prompt);
      
      let text = resData.text || '[]';
      text = text.replace(/```json\s*|```/g, "").trim();
      const startIdx = text.indexOf('[');
      const endIdx = text.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1) {
        text = text.substring(startIdx, endIdx + 1);
      }
      
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSuggestions(parsed.slice(0, 4));
      } else {
        throw new Error();
      }
    } catch (e) {
      console.error(e);
      // Fallback suggestions
      if (currentStep === 1) {
        setSuggestions(defaultNiches);
      } else if (currentStep === 2) {
        setSuggestions([
          `The Dark Reality of ${selections.niche} They Don't Want You to Know`,
          `This 10-Minute Habit of ${selections.niche} Will Change Your Life`,
          `Scientists Just Discovered Something Terrifying About ${selections.niche}`,
          `How 1% of Creators Are Dominating the ${selections.niche} Market`
        ]);
      } else if (currentStep === 4) {
        setSuggestions([
          "Hook: The Sudden Realization → Part 1: The Core Event → Part 2: The Consequence → Outro: CTA",
          "Hook: A Shocking Fact → Part 1: Deep Historical Roots → Part 2: The Future Threat → Outro",
          "Hook: The Myth Debunked → Part 1: Real Evidence → Part 2: Actionable Lessons → Outro",
          "Hook: A Cryptic Riddle → Part 1: Narrative Storytelling → Part 2: Resolving the Mystery → Outro"
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Run on step transitions
  useEffect(() => {
    setShowCustomInput(false);
    setCustomInput('');
    
    if (step === 1) {
      if (initialContextText) {
        fetchDynamicSuggestions(1);
      } else {
        setSuggestions(defaultNiches);
      }
    } else if (step === 2) {
      fetchDynamicSuggestions(2);
    } else if (step === 3) {
      setSuggestions(defaultTones);
    } else if (step === 4) {
      fetchDynamicSuggestions(4);
    } else if (step === 5) {
      setSuggestions(defaultVisualStyles);
    }
  }, [step, initialContextText]);

  // Handle auto-scrolling whenever any relevant state changes
  useEffect(() => {
    if (onScrollToBottom) {
      // Small timeout to allow React to render the newly sized wizard
      const timer = setTimeout(() => {
        onScrollToBottom();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [step, loading, generating, error, showCustomInput, suggestions, generatedScript, onScrollToBottom]);

  // Handle choice selection
  const handleSelect = (choice: string) => {
    const stepNames = ['', 'niche', 'concept', 'tone', 'outline', 'visualStyle'];
    if (onChoiceSelected) {
      onChoiceSelected(step, stepNames[step] || 'custom', choice);
    }
    saveSelectionForStep(step, choice);
    moveToNextStep(choice);
  };

  const saveSelectionForStep = (currentStep: number, val: string) => {
    setSelections(prev => {
      const updated = { ...prev };
      if (currentStep === 1) updated.niche = val;
      else if (currentStep === 2) updated.concept = val;
      else if (currentStep === 3) updated.tone = val;
      else if (currentStep === 4) updated.outline = val;
      else if (currentStep === 5) updated.visualStyle = val;
      return updated;
    });
  };

  const moveToNextStep = (currentStepChoice?: string) => {
    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      // Step 5 chosen, let's compile
      const finalSelections = {
        ...selections,
        visualStyle: currentStepChoice || selections.visualStyle || defaultVisualStyles[0]
      };
      generateFinalScript(finalSelections);
    }
  };

  // Skip the remaining steps and instantly generate
  const handleInstantFinish = () => {
    // Treat any typed but unsubmitted custom input as the current step choice
    let currentVal = customInput.trim();
    
    const finalSelections = {
      niche: selections.niche || (step === 1 && currentVal ? currentVal : defaultNiches[0]),
      concept: selections.concept || (step === 2 && currentVal ? currentVal : (selections.niche ? `Deep Secrets of ${selections.niche}` : "Unlocking Ancient Enigmas")),
      tone: selections.tone || (step === 3 && currentVal ? currentVal : defaultTones[0]),
      outline: selections.outline || (step === 4 && currentVal ? currentVal : "Hook -> Unraveling the Legend -> Dynamic Climax -> Subscriber Retention CTA"),
      visualStyle: selections.visualStyle || (step === 5 && currentVal ? currentVal : defaultVisualStyles[0])
    };

    if (onChoiceSelected) {
      if (!selections.niche) onChoiceSelected(1, 'niche', finalSelections.niche);
      if (!selections.concept) onChoiceSelected(2, 'concept', finalSelections.concept);
      if (!selections.tone) onChoiceSelected(3, 'tone', finalSelections.tone);
      if (!selections.outline) onChoiceSelected(4, 'outline', finalSelections.outline);
      if (!selections.visualStyle) onChoiceSelected(5, 'visualStyle', finalSelections.visualStyle);
    }

    // Keep state updated for the viewer component
    setSelections(finalSelections);
    generateFinalScript(finalSelections);
  };

  // Generate detailed script using Gemini Models
  const generateFinalScript = async (overrideSelections?: typeof selections) => {
    setGenerating(true);
    setStep(6);
    setError(null);

    const activeSelections = overrideSelections || selections;

    let languageDirective = "IMPORTANT: Draft the entire script, titles, hooks, narrator voice lines, and visual cues in clear, engaging, high-retention English.";
    if (activeLanguage === 'ti') {
      languageDirective = "IMPORTANT: You MUST draft the entire SEO Title, Optimized Video Tags, Hook Script, and the audio/narrator lines in the Scene-by-Scene script 100% in natural Tigrinya using proper Ge'ez script. However, the B-roll visual descriptions and sound effect (SFX) cues should remain in clear English so the user can easily copy and paste them into AI image generators or stock footage search bars.";
    } else if (activeLanguage === 'am') {
      languageDirective = "IMPORTANT: You MUST draft the entire SEO Title, Optimized Video Tags, Hook Script, and the audio/narrator lines in the Scene-by-Scene script 100% in natural Amharic using proper Ge'ez script. However, the B-roll visual descriptions and sound effect (SFX) cues should remain in clear English so the user can easily copy and paste them into AI image generators or stock footage search bars.";
    }

    const prompt = `Act as an elite YouTube scripting genius specializing in faceless narration channels. Draft a highly engaging, retention-optimized, 5-minute video script based on these tailored selections:
    
    1. Channel Niche: ${activeSelections.niche || "Unexplained Phenomena"}
    2. Video Concept & Title Idea: ${activeSelections.concept || "Unveiling the Hidden Truth"}
    3. Voiceover Pacing & Tone: ${activeSelections.tone || "Deep Narrator style with immersive flow"}
    4. Video Structure / Outline: ${activeSelections.outline || "Cinematic 4-part structure with extreme cliffhangers"}
    5. Visual Aesthetic & B-Roll Style: ${activeSelections.visualStyle || "Stunning photorealistic AI images and cinematic footage"}
    
    You MUST output a beautifully formatted Markdown script containing:
    - **SEO Title** & **Optimized Viral Video Tags**
    - **Mood Description**: Brief guideline on background music tracks, SFX, and atmospheric pacing
    - **Highly Detailed Hook Script**: The first 15 seconds designed to keep users watching
    - **Scene-by-Scene Script**: Standard B-Roll descriptions on the left, audio/narrator lines on the right, with pacing cues (e.g. "[Dramatic Pause]", "[Sound of heart beating]")
    - **Strong Call to Action**: Subscriptions, comments, and recommendations
    
    ${languageDirective}
    Include highly engaging visual descriptions for B-roll which the creator can easily use for their AI image generators or stock footages.`;

    try {
      const resData = await callGeminiAPI('gemini-3.1-pro-preview', prompt, {
        aiModelMode: 'thinking'
      });
      
      const scriptText = resData.text || 'Failed to generate script.';
      setGeneratedScript(scriptText);
      setGeneratedTitle(activeSelections.concept || 'Faceless YouTube Script');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to craft the YouTube script. Please try regenerating.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    handleSelect(customInput.trim());
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript);
      alert('✓ Script copied to clipboard!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendToChat = () => {
    onAppendScriptToChat(generatedTitle || 'YouTube Video Script', generatedScript);
  };

  const handleSave = () => {
    onOpenSavePanel({
      title: generatedTitle,
      niche: selections.niche,
      concept: selections.concept,
      tone: selections.tone,
      outline: selections.outline,
      visualStyle: selections.visualStyle,
      scriptText: generatedScript,
      savedAt: new Date().toISOString()
    });
  };

  return (
    <div className="w-full transition-all duration-300 relative">
      {/* Contextual Thread Notification bar */}
      {initialContextText && (
        <div className={`mb-3 p-2.5 rounded-xl border flex items-center justify-between gap-2 text-[10px] font-semibold ${
          currentTheme.isDark 
            ? 'bg-red-500/5 border-red-500/10 text-red-300' 
            : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3 h-3 text-red-500 animate-pulse shrink-0" />
            <span className="opacity-75">{t('activeContext')}</span>
            <span className="font-extrabold truncate italic">"{initialContextText}"</span>
          </div>
          {onClearContext && (
            <button 
              onClick={onClearContext}
              className="text-[9px] font-black uppercase tracking-wider text-red-500/80 hover:text-red-500 underline cursor-pointer shrink-0 ml-1"
            >
              {t('clearContext')}
            </button>
          )}
        </div>
      )}

      {step <= 5 ? (
        <div className="space-y-4">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            {[1, 2, 3, 4, 5].map(idx => (
              <div 
                key={idx} 
                className="flex-1 flex flex-col gap-1 items-center"
              >
                <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                  idx < step 
                    ? 'bg-red-500' 
                    : idx === step 
                      ? 'bg-gradient-to-r from-red-500 to-purple-600 animate-pulse' 
                      : 'bg-white/10'
                }`} />
                <span className={`text-[8px] font-bold tracking-wider uppercase ${idx === step ? 'text-red-400' : 'text-white/30'}`}>
                  {idx === 1 ? 'Niche' : idx === 2 ? 'Concept' : idx === 3 ? 'Tone' : idx === 4 ? 'Outline' : 'Style'}
                </span>
              </div>
            ))}
          </div>

          {/* Question Text */}
          <div className="text-center py-0.5">
            <h4 className="text-sm font-extrabold tracking-wide text-white/90">
              {step === 1 && t('step1Title')}
              {step === 2 && t('step2Title')}
              {step === 3 && t('step3Title')}
              {step === 4 && t('step4Title')}
              {step === 5 && t('step5Title')}
            </h4>
            <p className="text-[10px] text-white/45 mt-0.5">
              {step === 1 && t('step1Desc')}
              {step === 2 && t('step2Desc')}
              {step === 3 && t('step3Desc')}
              {step === 4 && t('step4Desc')}
              {step === 5 && t('step5Desc')}
            </p>
          </div>

          {/* Suggestions List */}
          {loading ? (
            <div className="h-36 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
              <p className="text-[10px] text-white/40 uppercase tracking-widest animate-pulse">{t('loadingSuggestions')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(sug)}
                  className={`w-full p-3 rounded-xl text-left border text-xs font-semibold transition-all duration-200 flex items-center justify-between group hover:translate-x-0.5 cursor-pointer ${
                    currentTheme.isDark 
                      ? 'bg-neutral-800/45 border-white/5 text-white/90 hover:bg-neutral-800 hover:border-red-500/35 hover:text-white' 
                      : 'bg-slate-50 border-slate-200/80 text-slate-800 hover:bg-slate-100 hover:border-red-500/30'
                  }`}
                >
                  <span className="flex-1 pr-4 line-clamp-1">{sug}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-red-500 transition-colors shrink-0" />
                </button>
              ))}

              {/* Specification Input */}
              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full py-2.5 rounded-xl text-center border border-dashed text-[10px] font-black uppercase tracking-wider text-red-500 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
                >
                  {t('specifyCustom')}
                </button>
              ) : (
                <form onSubmit={handleCustomSubmit} className="space-y-1.5 pt-0.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder={
                        step === 1 ? t('customPlaceholder1') :
                        step === 2 ? t('customPlaceholder2') :
                        t('customPlaceholderDefault')
                      }
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/40 outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-red-600/10"
                    >
                      {t('next')}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="text-[9px] font-black text-white/30 hover:text-white/50 tracking-wider uppercase"
                  >
                    {t('cancel')}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Navigation Controls with Instant Skip Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5 border-t border-white/5 pt-3.5 mt-1">
            <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                disabled={step === 1 || loading}
                onClick={() => setStep(prev => prev - 1)}
                className="px-3 py-2 text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 rounded-xl border border-white/15 cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3 h-3" /> {t('back')}
              </button>
              
              <div className="flex sm:hidden items-center text-[9px] font-black text-white/30 tracking-widest uppercase">
                {t('stepOf').replace('{step}', String(step))}
              </div>
            </div>

            <div className="hidden sm:block text-[9px] font-black text-white/30 tracking-widest uppercase">
              {t('stepOf').replace('{step}', String(step))}
            </div>

            <button
              type="button"
              onClick={handleInstantFinish}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-red-500/10 to-purple-600/10 hover:from-red-500 hover:to-purple-600 text-red-400 hover:text-white border border-red-500/20 hover:border-transparent text-xs font-extrabold tracking-wide cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm"
              title="Skip remaining choices and generate the full script right now"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>{t('finishGenerate')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Step 6: Complete Script Generation and Actions */
        <div className="space-y-3.5">
          {generating ? (
            <div className="h-48 flex flex-col items-center justify-center gap-3.5 text-center">
              <div className="relative">
                <Loader2 className="w-9 h-9 text-red-500 animate-spin" />
                <Sparkles className="w-4 h-4 text-indigo-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white">{t('generatingTitle')}</p>
                <p className="text-[10px] text-white/40 max-w-xs mt-0.5 leading-relaxed">
                  {t('generatingDesc')}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="h-48 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                <X className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-red-400 max-w-xs">{error}</p>
              <button
                onClick={() => generateFinalScript()}
                className="px-4 py-1.5 rounded-xl bg-red-650 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-lg"
              >
                {t('retry')}
              </button>
            </div>
          ) : (
            /* Script Complete view */
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <div className="text-[10px] font-semibold">
                  <span className="font-extrabold block text-emerald-400">{t('scriptReady')}</span>
                  {t('scriptReadyDesc')}
                </div>
              </div>

              {/* Text Area Review Box */}
              <div className="relative">
                <div className="absolute right-2 top-2 z-10 flex gap-1">
                  <button
                    onClick={handleCopyScript}
                    title="Copy to clipboard"
                    className="p-1 rounded-lg bg-neutral-900 border border-white/10 text-white/60 hover:text-white hover:bg-black transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 h-44 overflow-y-auto custom-scrollbar font-mono text-[10px] text-white/75 whitespace-pre-wrap leading-relaxed select-text">
                  {generatedScript}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  onClick={handleSendToChat}
                  className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('sendToChat')}</span>
                </button>

                <button
                  onClick={handleSave}
                  className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('saveProject')}</span>
                </button>

                <button
                  onClick={() => {
                    setStep(1);
                    setGeneratedScript('');
                  }}
                  className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white/80 hover:text-white text-[10px] font-extrabold tracking-wider uppercase border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('newScript')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
