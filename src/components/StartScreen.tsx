import React from 'react';
import { motion } from 'framer-motion';

interface StartScreenProps {
  onStart: () => void;
  onShowLeaderboard: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowLeaderboard }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center"
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-neon-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] tracking-normal"
          animate={{ textShadow: ['0px 0px 5px #00F0FF', '0px 0px 15px #00F0FF', '0px 0px 5px #00F0FF'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          BaseDrive
        </motion.h1>
        
        <p className="mt-4 text-white/70 text-lg md:text-xl font-sans font-light tracking-wide">
          Endless Highway Simulation
        </p>

        <div className="mt-12 flex flex-col items-center gap-4">
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-white/5 backdrop-blur-md border border-white/20 text-white font-semibold text-lg rounded-full shadow-[0_0_15px_rgba(0,82,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-shadow min-w-[200px]"
          >
            START ENGINE
          </motion.button>

          <motion.button
            onClick={onShowLeaderboard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-white/5 border border-white/10 text-white/60 font-mono text-xs rounded-full hover:text-white hover:border-white/20 transition-all uppercase tracking-widest"
          >
            GLOBAL RANKING
          </motion.button>
        </div>
        
        <div className="mt-12 text-white/40 text-sm font-mono flex flex-col items-center gap-2">
          <p className="hidden md:block">Use A / D or Arrow Keys to move</p>
          <p className="block md:hidden">Swipe Left / Right to move</p>
        </div>
      </motion.div>
    </div>
  );
};
