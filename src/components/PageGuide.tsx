import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PageGuideProps {
  title: string;
  description: string;
}

export default function PageGuide({ title, description }: PageGuideProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 lg:p-5 rounded-2xl flex items-start gap-4 lg:gap-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Info className="w-32 h-32 text-emerald-900" />
        </div>
        <div className="p-2 lg:p-3 bg-white text-emerald-600 rounded-xl lg:rounded-2xl shrink-0 shadow-sm relative z-10 border border-emerald-50">
          <Info className="w-5 h-5 lg:w-6 lg:h-6" />
        </div>
        <div className="flex-1 pr-8 relative z-10">
          <h4 className="font-bold text-emerald-900 text-sm lg:text-base">{title}</h4>
          <p className="text-sm text-emerald-700/80 mt-1 lg:mt-1.5 leading-relaxed">{description}</p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-1.5 text-emerald-400 hover:text-emerald-700 hover:bg-emerald-100/50 rounded-lg transition-colors z-20"
          title="Đóng hướng dẫn"
        >
          <X className="w-4 h-4 lg:w-5 lg:h-5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
