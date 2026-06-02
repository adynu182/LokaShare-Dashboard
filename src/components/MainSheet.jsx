import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function MainSheet({ isOpen, setIsOpen, title, children }) {
  return (
    <motion.div
      className="main-sheet glass"
      initial={false}
      animate={{ 
        height: isOpen ? '70vh' : '80px',
        y: 0
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="sheet-handle-wrapper" onClick={() => setIsOpen(!isOpen)}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2 className="sheet-title">{title}</h2>
          {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
      </div>
      
      <div className="sheet-content">
        {children}
      </div>
    </motion.div>
  );
}
