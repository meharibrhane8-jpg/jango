import { callGeminiAPI } from './geminiService';

export const geminiTranscribe = async (base64Audio: string, mimeType: string, lang: string = 'ti'): Promise<string> => {
  const prompt = `Transcribe the following audio accurately. The language is ${lang === 'en' ? 'English' : (lang === 'am' ? 'Amharic' : 'Tigrinya')}. Only return the transcribed text, nothing else.`;
  
  const result = await callGeminiAPI("gemini-3.5-flash", [
    { role: 'user', parts: [
      { text: prompt },
      { inlineData: { mimeType: mimeType, data: base64Audio } }
    ] }
  ]);
  
  return result.text?.trim() || "";
};
