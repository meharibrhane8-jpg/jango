import React, { useState } from 'react';
import { Loader2, ArrowRight, ArrowLeft, Clapperboard, Check } from 'lucide-react';
import { callGeminiAPI } from '../services/geminiService';

export const VideoDirectorWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    title: '', description: '', // Details
    language: 'English', dialect: 'United States', tone: [] as string[], useCase: [] as string[], audience: [] as string[], aspectRatio: 'Landscape', length: 8, // Styles
    episodes: [] as { title: string, draft: string }[], // Episodes
    scripts: [] as string[], // Scripts
    customizations: {}, // Customizations
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 'details', label: 'Details' },
    { id: 'styles', label: 'Styles' },
    { id: 'episodes', label: 'Episodes' },
    { id: 'scripts', label: 'Scripts' },
    { id: 'customizations', label: 'Customizations' },
    { id: 'summary', label: 'Summary' },
  ];

  const [error, setError] = useState<string | null>(null);

  const generateSuggestion = async (prompt: string, updateState: (res: string) => void) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await callGeminiAPI('gemini-3.1-pro-preview', prompt, {
        aiModelMode: 'thinking'
      });
      updateState(result.text);
    } catch (e) {
      console.error(e);
      setError('Failed to generate suggestion. Please try again in a moment (API may be rate-limited).');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Save functionality
      console.log('Project Saved:', data);
      alert('Project Saved!');
    }
  };

  const currentStep = steps[step];

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
      <div className="flex justify-between mb-8">
        {steps.map((s, index) => (
            <div key={s.id} className={`flex flex-col items-center gap-2 ${index <= step ? 'text-indigo-400' : 'text-gray-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${index <= step ? 'border-indigo-400 bg-indigo-900/20' : 'border-gray-700'}`}>
                    {index + 1}
                </div>
                <span className="text-xs font-semibold">{s.label}</span>
            </div>
        ))}
      </div>

      <div className="bg-gray-950 p-6 rounded-lg border border-gray-800 mb-6 min-h-[300px]">
        {error && (
            <div className="bg-red-900/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
                {error}
            </div>
        )}
        {step === 0 && (
            <div className='space-y-4'>
                <button onClick={() => generateSuggestion(`Suggest a catchy title and a brief, engaging description for a video series.`, res => {
                    const lines = res.split('\n');
                    setData({...data, title: lines[0].replace('Title: ', ''), description: lines.slice(1).join('\n')});
                })} className="text-indigo-400 text-sm">Suggest Title & Description</button>
                <input type="text" placeholder="Title" value={data.title} onChange={e => setData({...data, title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg" />
                <textarea placeholder="Description" value={data.description} onChange={e => setData({...data, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg h-32" />
            </div>
        )}
        {step === 1 && (
            <div className='space-y-4'>
                <button onClick={() => generateSuggestion(`Suggest appropriate language, tone, audience for a video series described as: ${data.description}.`, res => {
                    // This will be more complex, just a basic example for now
                    setData({...data, tone: res.split(', ') });
                })} className="text-indigo-400 text-sm">Suggest Styles</button>
                <div className='grid grid-cols-2 gap-4'>
                    <input type="text" placeholder="Language" value={data.language} onChange={e => setData({...data, language: e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg" />
                    <input type="text" placeholder="Dialect" value={data.dialect} onChange={e => setData({...data, dialect: e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg" />
                </div>
                <input type="text" placeholder="Tone (comma separated)" value={data.tone.join(', ')} onChange={e => setData({...data, tone: e.target.value.split(', ')})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg" />
                <input type="text" placeholder="Use Case (comma separated)" value={data.useCase.join(', ')} onChange={e => setData({...data, useCase: e.target.value.split(', ')})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg" />
                <input type="text" placeholder="Audience (comma separated)" value={data.audience.join(', ')} onChange={e => setData({...data, audience: e.target.value.split(', ')})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg" />
                <div className='flex gap-4 items-center'>
                    <select value={data.aspectRatio} onChange={e => setData({...data, aspectRatio: e.target.value})} className="w-1/2 bg-gray-900 border border-gray-700 p-3 rounded-lg">
                        <option>Landscape</option>
                        <option>Portrait</option>
                        <option>Square</option>
                    </select>
                    <input type="number" placeholder="Length (mins)" value={data.length} onChange={e => setData({...data, length: parseInt(e.target.value)})} className="w-1/2 bg-gray-900 border border-gray-700 p-3 rounded-lg" />
                </div>
            </div>
        )}
        {step === 2 && (
            <div className='space-y-4'>
                <button onClick={() => generateSuggestion(`Suggest 5 interesting episode titles for a series: ${data.title}.`, res => {
                    const titles = res.split('\n').filter(l => l.trim()).map(t => ({ title: t, draft: '' }));
                    setData({...data, episodes: titles});
                })} className="text-indigo-400 text-sm">Suggest Episodes</button>
                <input type="text" placeholder="Add Episode Title" onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        setData({...data, episodes: [...data.episodes, { title: e.currentTarget.value, draft: '' }]});
                        e.currentTarget.value = '';
                    }
                }} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg" />
                {data.episodes.map((ep, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
                        <span>{ep.title}</span>
                        <button onClick={() => setData({...data, episodes: data.episodes.filter((_, idx) => idx !== i)})} className='text-red-500'>Remove</button>
                    </div>
                ))}
            </div>
        )}
        {step === 3 && (
            <div className='space-y-4'>
                {data.episodes.map((ep, i) => (
                    <div key={i}>
                        <h4 className='font-semibold'>{ep.title}</h4>
                        <textarea value={ep.draft} onChange={e => {
                            const newEpisodes = [...data.episodes];
                            newEpisodes[i].draft = e.target.value;
                            setData({...data, episodes: newEpisodes});
                        }} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg h-24" />
                    </div>
                ))}
            </div>
        )}
        {step === 4 && (
            <div className='space-y-4'>
                <p className="text-gray-400">Customizations Settings</p>
                <div className='grid grid-cols-2 gap-4'>
                    <input type="text" placeholder="AI Avatar" onChange={e => {}} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg" />
                    <input type="text" placeholder="Voiceover" onChange={e => {}} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg" />
                </div>
            </div>
        )}
        {step === 5 && (
            <div className='space-y-4'>
                <h4 className='font-semibold'>Summary</h4>
                <p>Title: {data.title}</p>
                <p>Total Episodes: {data.episodes.length}</p>
            </div>
        )}


      </div>

      <div className="flex justify-between">
        <button 
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
            <ArrowLeft className="w-4 h-4 inline mr-2" /> Previous
        </button>
        <button 
            onClick={handleNext}
            className="px-6 py-2 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-500 transition flex items-center gap-2"
        >
            {step === steps.length - 1 ? 'Finish' : 'Next'}
            {step < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
