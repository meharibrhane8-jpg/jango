import React, { useState, useEffect } from 'react';
import { 
  Folder, FolderOpen, Save, Trash2, Calendar, 
  ExternalLink, Copy, BookOpen, X, Check,
  Maximize2, Minimize2, MonitorPlay, Mic2, Layers, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface YTProject {
  id: string;
  title: string;
  niche: string;
  concept: string;
  tone: string;
  outline: string;
  visualStyle: string;
  scriptText: string;
  savedAt: string;
}

interface YTProjectPanelProps {
  currentTheme: { isDark: boolean };
  onClose: () => void;
  onLoadScript: (script: string) => void;
  onAppendScriptToChat: (title: string, scriptText: string) => void;
  activeScriptData: Omit<YTProject, 'id' | 'title'> | null;
  onClearActiveScript: () => void;
}

export const YTProjectPanel: React.FC<YTProjectPanelProps> = ({
  currentTheme,
  onClose,
  onLoadScript,
  onAppendScriptToChat,
  activeScriptData,
  onClearActiveScript
}) => {
  const [projects, setProjects] = useState<YTProject[]>([]);
  const [projectName, setProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  const [searchQuery, setSearchQuery] = useState('');

  // Load projects from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('faceless_yt_projects');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProjects(parsed);
        if (parsed.length > 0) {
          setSelectedProjectId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse saved projects:", e);
      }
    }
  }, []);

  // Set default project name if active script data is present
  useEffect(() => {
    if (activeScriptData) {
      setProjectName(activeScriptData.concept || 'My New Script');
    }
  }, [activeScriptData]);

  const saveProjectsToStorage = (updated: YTProject[]) => {
    setProjects(updated);
    localStorage.setItem('faceless_yt_projects', JSON.stringify(updated));
  };

  const handleSaveNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScriptData || !projectName.trim()) return;

    const newProject: YTProject = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: projectName.trim(),
      savedAt: new Date().toISOString(),
      ...activeScriptData
    };

    const updated = [newProject, ...projects];
    saveProjectsToStorage(updated);
    setSelectedProjectId(newProject.id);
    onClearActiveScript();
    setProjectName('');
  };

  const handleDeleteProject = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the project "${name}"?`)) {
      const updated = projects.filter(p => p.id !== id);
      saveProjectsToStorage(updated);
      if (selectedProjectId === id) {
        setSelectedProjectId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportText = (project: YTProject) => {
    const element = document.createElement("a");
    const file = new Blob([project.scriptText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${project.title.replace(/\s+/g, '_')}_script.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.niche.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <motion.div 
      layout
      className={`fixed z-[60] transition-all duration-500 ease-in-out ${
        isExpanded 
          ? 'inset-0 bg-black/95 backdrop-blur-xl' 
          : 'relative w-full border-t border-b overflow-hidden'
      } ${
        currentTheme.isDark ? 'text-white' : 'text-slate-900'
      }`}
      style={{
        backgroundColor: isExpanded ? undefined : (currentTheme.isDark ? '#0a0a0a' : '#f8fafc'),
        borderColor: currentTheme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      }}
    >
      <div className={`mx-auto flex flex-col h-full ${isExpanded ? 'max-w-7xl p-6 sm:p-10' : 'max-w-6xl p-6'}`}>
        
        {/* Production Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-red-600/10 text-red-500 shadow-inner">
              <MonitorPlay className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                Faceless YouTube Production Suite
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] uppercase font-black tracking-widest border border-red-500/20">
                  Director Mode
                </span>
              </h3>
              <p className="text-sm text-white/40">Blueprint repository for automated video creation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
              title={isExpanded ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold text-white/80 transition-all border border-white/10"
            >
              Close Panel
            </button>
          </div>
        </div>

        <div className={`flex flex-col gap-8 flex-1 min-h-0 ${isExpanded ? 'overflow-hidden' : ''}`}>
          
          {/* Active Save Notification */}
          <AnimatePresence>
            {activeScriptData && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-red-500/10 via-purple-500/5 to-transparent border border-red-500/20 rounded-3xl p-8"
              >
                <h4 className="text-base font-bold text-red-400 mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 fill-red-400" /> New Production Blueprint Detected
                </h4>
                <p className="text-white/60 mb-6 text-sm">
                  You generated a script for <span className="text-white font-semibold">"{activeScriptData.concept}"</span>. 
                  Provide a title to archive it in your production suite.
                </p>
                <form onSubmit={handleSaveNewProject} className="flex gap-4">
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Production Title..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/20"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-xl shadow-red-900/40 transition-all flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" /> Archive Project
                  </button>
                  <button
                    type="button"
                    onClick={onClearActiveScript}
                    className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 font-semibold transition-all"
                  >
                    Discard
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Project Explorer Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 min-h-0">
            
            {/* Project List Sidebar */}
            <div className="md:col-span-4 flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-white/30">Saved Productions ({filteredProjects.length})</h4>
              </div>
              
              <div className="relative px-2">
                <input 
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/20"
                />
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {filteredProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
                    <Folder className="w-12 h-12 text-white/10 mb-4" />
                    <p className="text-white/40 font-medium">{searchQuery ? "No matches found" : "No projects archived"}</p>
                  </div>
                ) : (
                  filteredProjects.map(p => (
                    <motion.div
                      layout
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all group relative overflow-hidden ${
                        selectedProjectId === p.id 
                          ? 'bg-white/10 border-white/20 shadow-xl' 
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                      }`}
                    >
                      {selectedProjectId === p.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
                      )}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-base font-bold truncate pr-4 ${selectedProjectId === p.id ? 'text-white' : 'text-white/70'}`}>
                          {p.title}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id, p.title); }}
                          className="text-white/10 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/30 font-medium">
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md">
                          <Layers className="w-3 h-3" /> {p.niche.split(' ')[0]}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" /> {new Date(p.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Production Details View */}
            <div className="md:col-span-8 flex flex-col min-h-0">
              {selectedProject ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col h-full bg-black/40 border border-white/10 rounded-3xl overflow-hidden"
                >
                  <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">{selectedProject.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-white/40">
                        <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> {selectedProject.niche}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="flex items-center gap-1.5"><Mic2 className="w-4 h-4" /> {selectedProject.tone}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleExportText(selectedProject)}
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-sm font-bold transition-all"
                        title="Download as .txt"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyText(selectedProject.scriptText, selectedProject.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                          copiedId === selectedProject.id 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                        }`}
                      >
                        {copiedId === selectedProject.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedId === selectedProject.id ? 'Copied' : 'Copy Script'}
                      </button>
                      <button
                        onClick={() => onAppendScriptToChat(selectedProject.title, selectedProject.scriptText)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" /> Send to Editor
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-px bg-white/5 border-b border-white/5">
                    <div className="p-6 bg-transparent">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Aural Tone</p>
                      <p className="text-sm font-semibold text-white/90">{selectedProject.tone}</p>
                    </div>
                    <div className="p-6 bg-transparent border-l border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Cinematic Direction</p>
                      <p className="text-sm font-semibold text-white/90">{selectedProject.visualStyle}</p>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 flex flex-col p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Production Blueprint</p>
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                          <button 
                            onClick={() => setViewMode('preview')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'preview' ? 'bg-red-600 text-white shadow-md' : 'text-white/40 hover:text-white/60'}`}
                          >
                            PREVIEW
                          </button>
                          <button 
                            onClick={() => setViewMode('raw')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'raw' ? 'bg-red-600 text-white shadow-md' : 'text-white/40 hover:text-white/60'}`}
                          >
                            RAW
                          </button>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-white/20">UTF-8 • BUILD_STABLE</span>
                    </div>
                    
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-8 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed text-white/80 selection:bg-red-500/30">
                      {viewMode === 'raw' ? (
                        <pre className="whitespace-pre-wrap">{selectedProject.scriptText}</pre>
                      ) : (
                        <div className="space-y-6 font-sans">
                          {selectedProject.scriptText.split('\n').map((line, idx) => {
                            if (line.startsWith('[') && line.includes(']')) {
                              const [label, ...rest] = line.split(']');
                              return (
                                <div key={idx} className="bg-white/5 border-l-2 border-red-500 p-4 rounded-r-xl my-4">
                                  <span className="text-red-400 font-black text-[10px] uppercase tracking-widest block mb-1">
                                    {label.replace('[', '')}
                                  </span>
                                  <span className="text-white/90 text-sm leading-relaxed">
                                    {rest.join(']').replace(':', '').trim()}
                                  </span>
                                </div>
                              );
                            }
                            if (!line.trim()) return <div key={idx} className="h-4" />;
                            return <p key={idx} className="text-white/70">{line}</p>;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <BookOpen className="w-10 h-10 text-white/10" />
                  </div>
                  <h3 className="text-xl font-bold text-white/40 mb-2">Production Archive</h3>
                  <p className="text-sm text-white/20 max-w-xs">Select a project blueprint from the queue to start production</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
