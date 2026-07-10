import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronDown, Download, FileText, MessageSquare, X, Trash2, Table as TableIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DataTableModule = ({
  currentTheme,
  onClose,
  translationHistory,
  chatSessions,
}: any) => {
  const [activeTab, setActiveTab] = useState<'translations' | 'chats'>('translations');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const processedTranslations = useMemo(() => {
    let result = [...translationHistory];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.sourceText.toLowerCase().includes(q) || 
        item.translatedText.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'timestamp') {
        aVal = a.timestamp;
        bVal = b.timestamp;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [translationHistory, searchQuery, sortField, sortDirection]);

  const processedChats = useMemo(() => {
    let result = [...chatSessions];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let aVal = a[sortField] || a.id;
      let bVal = b[sortField] || b.id;
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [chatSessions, searchQuery, sortField, sortDirection]);

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeTab === 'translations') {
      csvContent += "Date,Source Language,Target Language,Source Text,Translated Text\n";
      processedTranslations.forEach(item => {
        const date = new Date(item.timestamp).toISOString().split('T')[0];
        const row = [date, item.sourceLang, item.targetLang, `"${item.sourceText.replace(/"/g, '""')}"`, `"${item.translatedText.replace(/"/g, '""')}"`].join(",");
        csvContent += row + "\n";
      });
    } else {
      csvContent += "ID,Title,Message Count\n";
      processedChats.forEach(item => {
        const row = [item.id, `"${item.title.replace(/"/g, '""')}"`, item.messages?.length || 0].join(",");
        csvContent += row + "\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isDark = currentTheme.isDark;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed inset-4 sm:inset-10 z-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-slate-950 text-white border border-white/10' : 'bg-white text-slate-900 border border-slate-200'}`}
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <TableIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Data Table Viewer</h2>
            <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Manage and export your application data</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900/50">
        <div className="p-6 shrink-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className={`flex items-center p-1 rounded-xl ${isDark ? 'bg-slate-900' : 'bg-slate-200/50'}`}>
            <button 
              onClick={() => setActiveTab('translations')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'translations' ? (isDark ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white/80'}`}
            >
              <FileText className="w-4 h-4" />
              Translations
            </button>
            <button 
              onClick={() => setActiveTab('chats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'chats' ? (isDark ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white/80'}`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat Sessions
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 sm:w-64 transition-colors ${isDark ? 'bg-slate-900 border-white/10 focus-within:border-indigo-500/50' : 'bg-white border-slate-200 focus-within:border-indigo-500/50'}`}>
              <Search className="w-4 h-4 opacity-50" />
              <input 
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>
            <button 
              onClick={downloadCSV}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'} shrink-0`}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-6">
          <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
            <table className="w-full text-left border-collapse text-sm">
              <thead className={`border-b ${isDark ? 'border-white/10 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'}`}>
                {activeTab === 'translations' ? (
                  <tr>
                    <th className="p-4 font-semibold w-32 cursor-pointer hover:opacity-80" onClick={() => handleSort('timestamp')}>
                      <div className="flex items-center gap-2">Date {sortField === 'timestamp' && <ArrowUpDown className="w-3 h-3" />}</div>
                    </th>
                    <th className="p-4 font-semibold w-24">Src</th>
                    <th className="p-4 font-semibold w-24">Tgt</th>
                    <th className="p-4 font-semibold cursor-pointer hover:opacity-80" onClick={() => handleSort('sourceText')}>
                      <div className="flex items-center gap-2">Source Text {sortField === 'sourceText' && <ArrowUpDown className="w-3 h-3" />}</div>
                    </th>
                    <th className="p-4 font-semibold cursor-pointer hover:opacity-80" onClick={() => handleSort('translatedText')}>
                      <div className="flex items-center gap-2">Translated Text {sortField === 'translatedText' && <ArrowUpDown className="w-3 h-3" />}</div>
                    </th>
                  </tr>
                ) : (
                  <tr>
                    <th className="p-4 font-semibold w-32 cursor-pointer hover:opacity-80" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-2">ID {sortField === 'id' && <ArrowUpDown className="w-3 h-3" />}</div>
                    </th>
                    <th className="p-4 font-semibold cursor-pointer hover:opacity-80" onClick={() => handleSort('title')}>
                      <div className="flex items-center gap-2">Title {sortField === 'title' && <ArrowUpDown className="w-3 h-3" />}</div>
                    </th>
                    <th className="p-4 font-semibold w-32">Messages</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {activeTab === 'translations' ? (
                  processedTranslations.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center opacity-50">No translations found</td></tr>
                  ) : (
                    processedTranslations.map(item => (
                      <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                        <td className="p-4 opacity-70">{new Date(item.timestamp).toLocaleDateString()}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>{item.sourceLang}</span></td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>{item.targetLang}</span></td>
                        <td className="p-4 font-ethiopic line-clamp-2 mt-2">{item.sourceText}</td>
                        <td className="p-4 font-ethiopic line-clamp-2 mt-2">{item.translatedText}</td>
                      </tr>
                    ))
                  )
                ) : (
                  processedChats.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center opacity-50">No chat sessions found</td></tr>
                  ) : (
                    processedChats.map(item => (
                      <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                        <td className="p-4 opacity-70 font-mono text-xs">{item.id.slice(0, 8)}</td>
                        <td className="p-4 font-ethiopic font-medium">{item.title}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>{item.messages?.length || 0} messages</span></td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
