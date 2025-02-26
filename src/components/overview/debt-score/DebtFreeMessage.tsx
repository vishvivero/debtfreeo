
import React from 'react';
import { motion } from "framer-motion";

export const DebtFreeMessage = () => {
  return (
    <div className="text-center space-y-6 py-8">
      <motion.div 
        initial={{ scale: 0 }} 
        animate={{ scale: 1 }} 
        className="inline-block p-4 bg-emerald-50 rounded-full"
      >
        <div className="w-12 h-12 text-emerald-600">🎉</div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-4"
      >
        <h2 className="text-3xl font-bold text-emerald-600">
          Congratulations! You're Debt-Free!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          You've achieved financial freedom! Keep up the great work and consider your next financial goals.
        </p>
      </motion.div>
    </div>
  );
};
