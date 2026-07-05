import { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, ArrowUpRight } from 'lucide-react';
import { ChatMessage } from '../services/geminiService';

const extractLinksFromText = (text: string) => {
  if (!text || typeof text !== 'string') return [];
  // Regex to match URLs starting with http or https
  const urlRegex = /(https?:\/\/[^\s\)]+)/gi;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches)).map(url => {
    // Strip trailing brackets, parentheses, punctuation from URLs if any
    let cleanUrl = url.replace(/[.,;:!)\]"'?]+$/, '');
    
    // Parse hostname
    let hostname = 'Web Link';
    try {
      const parsed = new URL(cleanUrl);
      hostname = parsed.hostname.replace('www.', '');
    } catch (e) {}

    return { uri: cleanUrl, title: hostname };
  });
};

const getMergedLinks = (msg: ChatMessage) => {
  const extracted = extractLinksFromText(msg.parts);
  const grounding = msg.groundingSources || [];
  
  const merged = [...grounding];
  extracted.forEach(ext => {
    if (!merged.some(m => m.uri === ext.uri)) {
      merged.push(ext);
    }
  });
  return merged;
};

interface MessageLinksAndSourcesProps {
  msg: ChatMessage;
  isDark: boolean;
}

export const MessageLinksAndSources: React.FC<MessageLinksAndSourcesProps> = ({ msg, isDark }) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const links = getMergedLinks(msg);
  if (links.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-2">
      <span className={`text-[10px] font-black uppercase tracking-wider ${
        isDark ? 'text-zinc-500' : 'text-slate-400'
      }`}>
        Cited Sources
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {links.map((link, idx) => {
          let hostname = '';
          try {
            hostname = new URL(link.uri).hostname.replace('www.', '');
          } catch (_) {
            hostname = 'Web Address';
          }
          const hasError = imageErrors[link.uri];
          const displayTitle = link.title || hostname;
          
          return (
            <motion.a
              key={idx}
              href={link.uri}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer shadow-sm ${
                isDark 
                  ? 'bg-zinc-800/80 border-white/10 hover:border-indigo-500/50 hover:bg-zinc-800 text-zinc-200' 
                  : 'bg-white border-slate-200 hover:border-indigo-500/30 hover:bg-indigo-50/50 text-slate-700'
              }`}
              title={link.uri}
            >
              <div className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 overflow-hidden bg-white/10">
                {!hasError ? (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                    alt=""
                    onError={() => {
                      setImageErrors(prev => ({ ...prev, [link.uri]: true }));
                    }}
                    className="w-3.5 h-3.5 rounded-sm object-contain"
                  />
                ) : (
                  <Globe className="w-3 h-3" />
                )}
              </div>
              <span className="truncate max-w-[150px] font-medium leading-none">
                {displayTitle}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};

