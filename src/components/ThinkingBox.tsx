import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export const ThinkingBox: React.FC<{ startTime: number }> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl flex items-center gap-3 shadow-lg shadow-purple-900/10 mb-4"
    >
      <div className="w-4 h-4 rounded-full bg-purple-500 animate-pulse" />
      <span className="text-purple-200 font-medium">Thinking...</span>
      <span className="text-purple-400 font-mono text-sm">{elapsed}s</span>
    </motion.div>
  );
};
