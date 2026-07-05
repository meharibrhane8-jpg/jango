import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, X, AlertCircle, Loader2, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { getAccessToken, googleSignIn } from '../services/firebaseAuthService';

interface KeepModuleProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const KeepModule: React.FC<KeepModuleProps> = ({ isOpen, onClose, isDark }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen]);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Please sign in to access Google Keep.");

      const response = await fetch('https://keep.googleapis.com/v1/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch notes. Note: Google Keep API requires an enterprise Workspace account or specific GCP configuration.');
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");

      await fetch('https://keep.googleapis.com/v1/notes', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title: title.trim(),
          body: {
            text: { text: content.trim() }
          }
        })
      });
      setTitle('');
      setContent('');
      await fetchNotes();
    } catch (err: any) {
      setError("Failed to add note: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteName: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this note?");
    if (!confirmed) return;

    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");

      await fetch(`https://keep.googleapis.com/v1/${noteName}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchNotes();
    } catch (err: any) {
      setError("Failed to delete note: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={`w-full max-w-md max-h-[90vh] rounded-3xl shadow-2xl flex flex-col border overflow-hidden ${
          isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className="p-6 flex flex-col min-h-0 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Google Keep</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchNotes} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Refresh Notes">
                <RefreshCw className={`w-5 h-5 opacity-50 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 opacity-50" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex flex-col gap-3 shrink-0">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
              {error.includes("sign in") && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const res = await googleSignIn();
                      if (res) {
                        setError(null);
                        fetchNotes();
                      }
                    } catch (err: any) {
                      setError(err?.message || "Failed to authorize");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="py-1.5 px-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xs transition-colors self-start shadow-sm"
                >
                  Authorize Google Workspace
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleAddNote} className="space-y-3 mb-6 shrink-0">
            <input 
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-sm font-semibold ${
                isDark ? 'bg-white/5 border-white/10 text-white focus:border-yellow-500' : 'bg-slate-50 border-slate-200 focus:border-yellow-500'
              }`}
            />
            <textarea 
              placeholder="Take a note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm min-h-[80px] resize-none ${
                isDark ? 'bg-white/5 border-white/10 text-white focus:border-yellow-500' : 'bg-slate-50 border-slate-200 focus:border-yellow-500'
              }`}
            />
            <button 
              type="submit"
              disabled={loading || (!title.trim() && !content.trim())}
              className="w-full py-2.5 bg-yellow-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Add Note
            </button>
          </form>

          <div className="space-y-3 flex-1 min-h-[150px]">
            <h3 className={`text-sm font-bold uppercase tracking-wider opacity-50 ${isDark ? 'text-white' : 'text-slate-800'}`}>My Notes</h3>
            {notes.length === 0 ? (
              <div className="text-center py-6 opacity-50">
                <p className="text-sm">No notes found.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div 
                  key={note.name}
                  className={`p-4 rounded-2xl border flex flex-col gap-2 relative group ${
                    isDark ? 'bg-white/[0.03] border-white/10 hover:bg-white/5' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <button 
                    onClick={() => handleDelete(note.name)}
                    className="absolute top-2 right-2 p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {note.title && <p className={`font-semibold pr-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>{note.title}</p>}
                  {note.body?.text?.text && <p className={`text-sm opacity-80 whitespace-pre-wrap pr-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>{note.body.text.text}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
