import React from 'react';
import { motion } from 'motion/react';
import { Radio, Languages, Mic, Sparkles, Image, Palette, X, ArrowLeftRight, Loader2 } from 'lucide-react';

export const PersistentTools = ({ 
    isLiveMode, toggleLiveMode, activeMenus, toggleMenu, showGenerator, setShowGenerator, currentTheme,
    translationInput, setTranslationInput, WORLD_LANGUAGES, sourceLang, setSourceLang, targetLang, setTargetLang,
    translationOutput, isProcessing, handleTranslate, setSelectedTone, selectedTone, handleApplyTone, isToneAdjusting, chatInput,
    handleGenerateImage, imagePrompt, setImagePrompt, isGeneratingImage, generatedImage, setGeneratedImage, imageAspectRatio, setImageAspectRatio 
}: any) => {
    return (
        <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
            {/* Live Talk Widget */}
            <div className={`p-4 rounded-2xl border ${currentTheme.isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <Radio className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold">Live Talk</h3>
                </div>
                <button onClick={toggleLiveMode} className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${isLiveMode ? 'bg-indigo-600 text-white' : (currentTheme.isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-200 hover:bg-slate-300')}`}>
                    {isLiveMode ? 'End Live Talk' : 'Start Live Talk'}
                </button>
            </div>

            {/* Translator Widget */}
            <div className={`p-5 rounded-3xl border ${currentTheme.isDark ? 'border-white/10 bg-[#1a1a1a]/50' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="p-2 rounded-xl bg-indigo-500/10">
                        <Languages className="w-4 h-4 text-indigo-500" />
                    </div>
                    <h3 className="text-sm font-black tracking-tight">Translator</h3>
                </div>
                <textarea 
                    value={translationInput}
                    onChange={(e) => setTranslationInput(e.target.value)}
                    placeholder="Enter text..."
                    className={`w-full h-24 p-4 rounded-2xl border text-xs resize-none outline-none ${currentTheme.isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}
                />
                <button onClick={handleTranslate} className="w-full mt-3 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors">Translate</button>
                
                {translationOutput && (
                    <div className={`mt-4 p-4 rounded-2xl border ${currentTheme.isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <p className={`text-xs font-ethiopic leading-relaxed ${currentTheme.isDark ? 'text-indigo-100' : 'text-indigo-900'}`}>{translationOutput}</p>
                        <div className="flex gap-2 mt-3">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(translationOutput);
                                }}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${currentTheme.isDark ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
             {/* Contextual Intelligence Widget */}
            <div className={`p-5 rounded-3xl border ${currentTheme.isDark ? 'border-white/10 bg-[#1a1a1a]/50' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="p-2 rounded-xl bg-indigo-500/10">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                    </div>
                    <h3 className="text-sm font-black tracking-tight">Contextual Intelligence</h3>
                </div>
                 <div className="flex flex-wrap gap-2">
                    {['Professional', 'Casual', 'Formal'].map(tone => (
                        <button key={tone} onClick={() => setSelectedTone(tone)} className={`px-4 py-2 rounded-xl border text-[11px] font-bold transition-all ${selectedTone === tone ? 'bg-indigo-600/10 border-indigo-500 text-indigo-500' : (currentTheme.isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300')}`}>
                            {tone}
                        </button>
                    ))}
                 </div>
            </div>
        </div>
    );
};
