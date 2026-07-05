import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, ChevronRight, Globe, Bell, BrainCircuit } from 'lucide-react';

interface OnboardingGuideProps {
  onComplete: () => void;
  isDark: boolean;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onComplete, isDark }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Neural AI',
      subtitle: 'Your intelligent, adaptive companion.',
      icon: <Sparkles className="w-12 h-12 text-indigo-500" />,
      content: 'Experience a smooth, natural interaction tailored to your unique style. I learn how you work to provide the best possible support.',
    },
    {
      title: 'Real-time AI & Languages',
      subtitle: 'Speak naturally, locally or globally.',
      icon: <Globe className="w-12 h-12 text-indigo-500" />,
      content: 'I natively support multiple languages, including English, Amharic, and Tigrinya. Try Voice mode to chat seamlessly in real-time.',
    },
    {
      title: 'Habits & Reminders',
      subtitle: 'Stay on track effortlessly.',
      icon: <Bell className="w-12 h-12 text-indigo-500" />,
      content: 'Set reminders and build better habits. I can gently nudge you towards your goals, but only if you ask me to.',
    },
    {
      title: 'Proactive Suggestions',
      subtitle: 'Adaptive insights that fit you.',
      icon: <BrainCircuit className="w-12 h-12 text-indigo-500" />,
      content: 'Enable proactive mode to get personalized insights, reflection prompts, and next steps based on your patterns.',
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.05, y: -10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden flex flex-col ${
          isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex-1 p-8 sm:p-12 flex flex-col items-center text-center">
          <div className={`p-6 rounded-3xl mb-8 ${isDark ? 'bg-white/5' : 'bg-indigo-50'}`}>
            {currentStep.icon}
          </div>
          
          <h2 className="text-3xl font-black mb-2 tracking-tight">{currentStep.title}</h2>
          <h3 className={`text-sm font-semibold uppercase tracking-widest mb-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
            {currentStep.subtitle}
          </h3>
          <p className="text-lg opacity-80 leading-relaxed max-w-sm">
            {currentStep.content}
          </p>
        </div>

        <div className={`p-6 border-t flex items-center justify-between ${isDark ? 'border-white/10 bg-black/20' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-indigo-500' : 'w-2 opacity-20 ' + (isDark ? 'bg-white' : 'bg-black')
                }`} 
              />
            ))}
          </div>
          <button 
            onClick={handleNext}
            className="px-6 py-3 rounded-full bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {step === steps.length - 1 ? 'Get Started' : 'Next'}
            {step === steps.length - 1 ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
