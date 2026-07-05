import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, X, AlertCircle, Loader2, RefreshCw, Clock } from 'lucide-react';
import { getAccessToken, googleSignIn } from '../services/firebaseAuthService';
import { format } from 'date-fns';

interface CalendarModuleProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({ isOpen, onClose, isDark }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Please sign in to access Google Calendar.");

      // Fetch upcoming 10 events
      const timeMin = new Date().toISOString();
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&singleEvents=true&orderBy=startTime`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch calendar events');
      const data = await response.json();
      setEvents(data.items || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch events");
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
        <div className="p-6 flex flex-col min-h-0 flex-1">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Google Calendar</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchEvents} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Refresh Events">
                <RefreshCw className={`w-5 h-5 opacity-50 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 opacity-50" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex flex-col gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{error}</span>
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
                        fetchEvents();
                      }
                    } catch (err: any) {
                      setError(err?.message || "Failed to authorize");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="py-1.5 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors self-start shadow-sm"
                >
                  Authorize Google Workspace
                </button>
              )}
            </div>
          )}

          <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-1">
            <h3 className={`text-sm font-bold uppercase tracking-wider opacity-50 ${isDark ? 'text-white' : 'text-slate-800'}`}>Upcoming Events</h3>
            {loading && events.length === 0 ? (
               <div className="flex justify-center py-8">
                 <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
               </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                <p className="text-sm">No upcoming events found.</p>
              </div>
            ) : (
              events.map((event) => {
                const startTime = new Date(event.start.dateTime || event.start.date);
                const isAllDay = !event.start.dateTime;
                return (
                  <div 
                    key={event.id}
                    className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                      isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{event.summary || "(No title)"}</p>
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isAllDay ? format(startTime, 'MMM d, yyyy (All day)') : format(startTime, 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
