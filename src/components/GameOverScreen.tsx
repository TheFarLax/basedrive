import React from 'react';
import { motion } from 'framer-motion';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="glass-card p-10 rounded-3xl flex flex-col items-center border border-white/10 shadow-[0_0_40px_rgba(0,82,255,0.15)] max-w-sm w-full mx-4"
      >
        <h2 className="text-white text-3xl font-display font-light tracking-widest mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          RUN COMPLETE
        </h2>
        
        <div className="flex flex-col items-center gap-1 mb-6 w-full bg-white/5 rounded-xl p-4">
          <p className="text-white/50 text-xs font-mono uppercase tracking-widest">Final Score</p>
          <p className="text-5xl font-bold text-white mb-2">{score.toLocaleString()}</p>
          
          <div className="h-px w-full bg-white/10 my-2" />
          
          <p className="text-neon-cyan/50 text-xs font-mono uppercase tracking-widest">Best Record</p>
          <p className="text-xl font-semibold text-neon-cyan">{highScore.toLocaleString()}</p>
        </div>

        <motion.button
          onClick={onRestart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 mt-2 bg-white/10 border border-white/20 text-white font-semibold text-lg rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-shadow"
        >
          DRIVE AGAIN
        </motion.button>
      </motion.div>
    </div>
  );
};
