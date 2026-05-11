import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { LeaderboardEntry } from '../hooks/useLeaderboard';
import { useAccount } from 'wagmi';
import { X, Trophy, Medal, Users, Loader2 } from 'lucide-react';

interface LeaderboardProps {
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
  const { data: leaderboard, isLoading, isError } = useLeaderboard();
  const { address } = useAccount();

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative glass-card w-full max-w-lg h-[80vh] flex flex-col rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,82,255,0.2)]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-cyan/10 rounded-xl border border-neon-cyan/20">
              <Trophy className="text-neon-cyan w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white text-2xl font-display font-light tracking-widest">HALL OF FAME</h2>
              <p className="text-white/30 text-[10px] font-mono uppercase tracking-[0.3em]">Global Ranking</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <AnimatePresence mode="wait">
            {isLoading && !leaderboard ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-4"
              >
                <Loader2 size={32} className="text-neon-cyan animate-spin" />
                <p className="text-white/40 font-mono text-sm tracking-widest animate-pulse">SYNCHRONIZING...</p>
              </motion.div>
            ) : isError ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-4 text-center p-8"
              >
                <p className="text-neon-pink font-mono text-sm uppercase tracking-widest">Connection Failed</p>
                <p className="text-white/40 text-xs">Unable to fetch onchain data. Check your connection.</p>
              </motion.div>
            ) : leaderboard?.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-6 text-center p-8"
              >
                <Users size={48} className="text-white/10" />
                <div>
                  <p className="text-white font-mono text-sm uppercase tracking-widest mb-2">No Records Yet</p>
                  <p className="text-white/40 text-xs leading-relaxed max-w-[200px] mx-auto">
                    The leaderboard is empty. Be the first to submit your score onchain!
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-2"
              >
                {leaderboard?.map((entry: LeaderboardEntry, index: number) => {
                  const isCurrentUser = address?.toLowerCase() === entry.player.toLowerCase();
                  const isTop3 = index < 3;
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={entry.player}
                      className={`
                        group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300
                        ${isCurrentUser ? 'bg-neon-cyan/10 border-neon-cyan/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className={`
                          w-10 h-10 flex items-center justify-center font-bold font-mono text-lg rounded-lg border
                          ${index === 0 ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500' : 
                            index === 1 ? 'bg-slate-400/20 border-slate-400/30 text-slate-400' :
                            index === 2 ? 'bg-amber-600/20 border-amber-600/30 text-amber-600' :
                            'bg-white/5 border-white/5 text-white/40'}
                        `}>
                          {isTop3 ? <Medal size={18} /> : index + 1}
                        </div>
                        
                        {/* Player */}
                        <div>
                          <p className={`text-sm font-mono tracking-tight ${isCurrentUser ? 'text-neon-cyan' : 'text-white/80'}`}>
                            {formatAddress(entry.player)}
                            {isCurrentUser && <span className="ml-2 text-[8px] uppercase tracking-widest opacity-50">(YOU)</span>}
                          </p>
                          <p className="text-[10px] text-white/20 uppercase tracking-widest mt-0.5">Verified Protocol</p>
                        </div>
                      </div>
                      
                      {/* Score */}
                      <div className="text-right">
                        <p className={`text-xl font-bold tracking-tighter tabular-nums ${isTop3 ? 'text-white' : 'text-white/60'}`}>
                          {entry.score.toLocaleString()}
                        </p>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest font-mono">PTS</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/5 border-t border-white/5 text-center backdrop-blur-xl">
          <p className="text-white/20 text-[10px] font-mono uppercase tracking-[0.2em]">
            Immutable Archive • Base Mainnet
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
