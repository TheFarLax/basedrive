import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { CheckCircle2, Trophy, Loader2, AlertCircle, Share2 } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onShowLeaderboard: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart, onShowLeaderboard }) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      setIsSubmitted(true);
    }
  }, [isSuccess]);

  const handleSubmission = () => {
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitScore',
      args: [BigInt(score)],
    });
  };

  const isNewHighScore = score >= highScore && score > 0;
  const canSubmit = isConnected && isNewHighScore && !isSubmitted;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto z-40 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="glass-card p-8 rounded-[2rem] flex flex-col items-center border border-white/10 shadow-[0_0_50px_rgba(0,82,255,0.2)] max-w-sm w-full"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10"
        >
          <Trophy className="text-neon-cyan w-8 h-8" />
        </motion.div>

        <h2 className="text-white text-3xl font-display font-light tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          RUN COMPLETE
        </h2>
        
        <p className="text-white/40 text-xs font-mono uppercase tracking-[0.3em] mb-8">
          Simulation Terminated
        </p>
        
        <div className="flex flex-col items-center gap-1 mb-8 w-full bg-white/5 rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
          {isNewHighScore && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            />
          )}
          
          <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1">Final Score</p>
          <p className="text-6xl font-bold text-white mb-2 tabular-nums tracking-tighter">
            {score.toLocaleString()}
          </p>
          
          <div className="h-px w-full bg-white/10 my-3" />
          
          <div className="flex justify-between w-full px-2">
            <div className="text-left">
              <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest">Personal Best</p>
              <p className="text-lg font-semibold text-neon-cyan">{highScore.toLocaleString()}</p>
            </div>
            {isNewHighScore && (
              <div className="text-right">
                <p className="text-neon-cyan text-[10px] font-mono uppercase tracking-widest animate-pulse">New Record</p>
                <p className="text-lg font-semibold text-white">★</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <AnimatePresence mode="wait">
            {canSubmit ? (
              <motion.button
                key="submit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                disabled={isPending || isConfirming}
                onClick={handleSubmission}
                className="w-full py-4 bg-white/10 border border-white/20 text-white font-semibold text-sm rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:bg-white/15 transition-all flex items-center justify-center gap-2 group overflow-hidden relative"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-neon-cyan" />
                    <span>{isConfirming ? 'Verifying...' : 'Approving...'}</span>
                  </>
                ) : (
                  <>
                    <Share2 size={16} className="group-hover:scale-110 transition-transform" />
                    <span>SUBMIT ONCHAIN SCORE</span>
                  </>
                )}
              </motion.button>
            ) : isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full py-4 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
              >
                <CheckCircle2 size={16} />
                <span className="tracking-widest uppercase">Score Verified Onchain</span>
              </motion.div>
            ) : error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-neon-pink text-[10px] font-mono text-center mb-2 flex items-center justify-center gap-1"
              >
                <AlertCircle size={10} />
                {error.message.includes('User rejected') ? 'Transaction Cancelled' : 'Submission Failed'}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={onRestart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-neon-cyan text-black font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_rgba(0,240,255,0.5)] transition-all tracking-widest uppercase"
          >
            Drive Again
          </motion.button>

          <motion.button
            onClick={onShowLeaderboard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-white/5 border border-white/10 text-white/50 font-mono text-[10px] rounded-xl hover:text-white hover:border-white/20 transition-all uppercase tracking-[0.2em]"
          >
            GLOBAL RANKING
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
