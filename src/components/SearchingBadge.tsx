import React from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';

export const SearchingBadge: React.FC<{ keyword: string }> = ({ keyword }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg flex items-center gap-3 mb-4 inline-flex"
    >
      <Search className="w-4 h-4 text-blue-400 animate-spin" />
      <span className="text-blue-200 text-sm">Searching the Live Web for: <span className="font-semibold">{keyword}</span></span>
    </motion.div>
  );
};
