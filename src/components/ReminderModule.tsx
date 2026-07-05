import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Plus, Trash2, Bell, BellOff, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { addReminder, loadReminders, deleteReminder, Reminder } from '../services/firebaseDbService';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

interface ReminderModuleProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

// Helper to convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PUBLIC_VAPID_KEY = "BAJYmiDl2vzsgcRCMontlzJKoeprsC8Z8iBdFd0tOMLNEnUGJ0P90cpwmG7P5WRjc5ymGuOxA-FNTe2qgBDb_x8";

export const ReminderModule: React.FC<ReminderModuleProps> = ({ userId, isOpen, onClose, isDark }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchReminders();
      checkPushPermission();
    }
  }, [isOpen, userId]);

  const checkPushPermission = async () => {
    if (!('Notification' in window)) {
      setPushStatus('unsupported');
      return;
    }
    setPushStatus(Notification.permission as any);
  };

  const fetchReminders = async () => {
    setLoading(true);
    const data = await loadReminders(userId);
    setReminders(data);
    setLoading(false);
  };

  const subscribeToPush = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
      
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });

      // Send subscription to backend
      await fetch('/api/reminders/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, userId })
      });

    } catch (err) {
      console.error("Push subscription failed:", err);
      setError("Failed to enable notifications. Please ensure you are on a secure (HTTPS) connection.");
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    const dueDateTime = new Date(`${date}T${time}`);
    if (dueDateTime <= new Date()) {
      setError("Reminder time must be in the future");
      return;
    }

    setLoading(true);
    try {
      await addReminder({
        userId,
        title,
        dueAt: Timestamp.fromDate(dueDateTime),
        status: 'pending'
      });
      setTitle('');
      setDate('');
      setTime('');
      setError(null);
      fetchReminders();
    } catch (err) {
      setError("Failed to add reminder");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
    fetchReminders();
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
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Reminders</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 opacity-50" />
            </button>
          </div>

          {/* Push Permission Call to Action */}
          {pushStatus !== 'granted' && (
            <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-4 shrink-0 ${
              isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
            }`}>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-indigo-500" />
                <div className="text-sm">
                  <p className={`font-semibold ${isDark ? 'text-indigo-200' : 'text-indigo-900'}`}>Enable Notifications</p>
                  <p className={`opacity-70 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>Get alerted when your reminders are due.</p>
                </div>
              </div>
              <button 
                onClick={subscribeToPush}
                className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Enable
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2 shrink-0">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleAddReminder} className="space-y-4 mb-8 shrink-0">
            <input 
              type="text"
              placeholder="What should I remind you about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
              }`}
              required
            />
            <div className="flex gap-2">
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`flex-1 px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
                }`}
                required
              />
              <input 
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`flex-1 px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
                }`}
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Set Reminder
            </button>
          </form>

          <div className="space-y-3 flex-1 min-h-[150px]">
            <h3 className={`text-sm font-bold uppercase tracking-wider opacity-50 ${isDark ? 'text-white' : 'text-slate-800'}`}>Active Reminders</h3>
            {reminders.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                <p className="text-sm">No reminders set yet.</p>
              </div>
            ) : (
              reminders.map((reminder) => {
                const dueDate = (reminder.dueAt as any).toDate ? (reminder.dueAt as any).toDate() : new Date(reminder.dueAt);
                const isSent = reminder.status === 'sent';
                
                return (
                  <div 
                    key={reminder.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                    } ${isSent ? 'opacity-50' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{reminder.title}</p>
                      <p className="text-xs opacity-60">
                        {format(dueDate, 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSent ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <button 
                          onClick={() => handleDelete(reminder.id!)}
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
