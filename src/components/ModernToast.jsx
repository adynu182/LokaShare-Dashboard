import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

export default function ModernToast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cn("modern-toast glass", type)}
        >
          {type === 'success' && <CheckCircle size={18} className="text-emerald-500" />}
          {type === 'error' && <AlertCircle size={18} className="text-rose-500" />}
          {type === 'info' && <Info size={18} className="text-primary" />}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
