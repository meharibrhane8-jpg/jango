import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Plus, Trash2, X, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { getAccessToken, googleSignIn } from '../services/firebaseAuthService';

interface TasksModuleProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const TasksModule: React.FC<TasksModuleProps> = ({ isOpen, onClose, isDark }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Please sign in to access Google Tasks.");

      const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch task lists');
      const data = await response.json();
      const defaultList = data.items?.[0];

      if (defaultList) {
        const tasksResponse = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${defaultList.id}/tasks?showCompleted=false`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.items || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const listResponse = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listData = await listResponse.json();
      const defaultList = listData.items?.[0];

      if (defaultList) {
        await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${defaultList.id}/tasks`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title })
        });
        setTitle('');
        await fetchTasks();
      }
    } catch (err: any) {
      setError("Failed to add task: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this task? This action cannot be undone.");
    if (!confirmed) return;

    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const listResponse = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listData = await listResponse.json();
      const defaultList = listData.items?.[0];

      if (defaultList) {
        await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${defaultList.id}/tasks/${taskId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchTasks();
      }
    } catch (err: any) {
      setError("Failed to delete task: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (task: any) => {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const listResponse = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listData = await listResponse.json();
      const defaultList = listData.items?.[0];

      if (defaultList) {
        await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${defaultList.id}/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...task, status: 'completed' })
        });
        await fetchTasks();
      }
    } catch (err: any) {
      setError("Failed to complete task: " + err.message);
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
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Google Tasks</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchTasks} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Refresh Tasks">
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
                        fetchTasks();
                      }
                    } catch (err: any) {
                      setError(err?.message || "Failed to authorize");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="py-1.5 px-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs transition-colors self-start shadow-sm"
                >
                  Authorize Google Workspace
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleAddTask} className="space-y-4 mb-8 shrink-0">
            <input 
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                isDark ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
              }`}
              required
            />
            <button 
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Add Task
            </button>
          </form>

          <div className="space-y-3 flex-1 min-h-[150px]">
            <h3 className={`text-sm font-bold uppercase tracking-wider opacity-50 ${isDark ? 'text-white' : 'text-slate-800'}`}>My Tasks</h3>
            {tasks.length === 0 ? (
              <div className="text-center py-8 opacity-50">
                <p className="text-sm">No tasks found.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div 
                  key={task.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                    isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button 
                      onClick={() => handleComplete(task)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isDark ? 'border-white/20 hover:border-blue-400' : 'border-slate-300 hover:border-blue-500'
                      }`}
                    />
                    <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{task.title}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
