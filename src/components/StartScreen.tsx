import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useConnect, useSwitchChain, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { Wallet, RefreshCw, Play, ShieldAlert, Loader2 } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  onShowLeaderboard: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowLeaderboard }) => {
  const { isConnected, isConnecting } = useAccount();
  const { connectAsync, connectors, isPending: isConnectPending } = useConnect();
  const { switchChainAsync, isPending: isSwitchPending, error: switchError } = useSwitchChain();
  const chainId = useChainId();

  const isWrongNetwork = isConnected && chainId !== base.id;

  const handleAction = async () => {
    try {
      if (!isConnected) {
        await connectAsync({ connector: connectors[0] });
        return;
      }
      
      if (isWrongNetwork) {
        await switchChainAsync({ chainId: base.id });
        return;
      }
      
      if (chainId === base.id) {
        onStart();
      }
    } catch (err) {
      // Errors handled via UI
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center w-full max-w-md px-6"
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-neon-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] tracking-normal mb-2"
          animate={{ textShadow: ['0px 0px 5px #00F0FF', '0px 0px 15px #00F0FF', '0px 0px 5px #00F0FF'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          BaseDrive
        </motion.h1>
        
        <p className="text-white/70 text-lg font-sans font-light tracking-[0.2em] uppercase mb-12">
          Endless Highway Simulation
        </p>

        <div className="flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            {!isConnected ? (
              <motion.button
                key="connect"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleAction}
                disabled={isConnectPending || isConnecting}
                className="w-full py-5 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-xl rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:bg-white/15 hover:border-white/30 transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
              >
                {isConnectPending || isConnecting ? (
                  <Loader2 className="animate-spin text-neon-cyan" size={24} />
                ) : (
                  <Wallet className="text-neon-cyan group-hover:scale-110 transition-transform" size={24} />
                )}
                <span className="tracking-[0.1em]">CONNECT TO PLAY</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.button>
            ) : isWrongNetwork ? (
              <motion.button
                key="switch"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleAction}
                disabled={isSwitchPending}
                className="w-full py-5 bg-neon-pink/10 backdrop-blur-xl border border-neon-pink/30 text-neon-pink font-bold text-xl rounded-2xl shadow-[0_0_30px_rgba(255,51,168,0.2)] hover:bg-neon-pink/20 transition-all flex items-center justify-center gap-3 group"
              >
                {isSwitchPending ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span className="tracking-[0.1em]">SWITCHING TO BASE...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="animate-spin-slow" size={24} />
                    <span className="tracking-[0.1em]">SWITCH TO BASE</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                key="start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleAction}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-neon-cyan text-black font-bold text-xl rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.4)] hover:shadow-[0_0_60px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-3 group"
              >
                <Play className="fill-black group-hover:scale-110 transition-transform" size={24} />
                <span className="tracking-[0.1em] uppercase">Start Engine</span>
              </motion.button>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center gap-4 w-full">
            <motion.button
              onClick={onShowLeaderboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white/5 border border-white/10 text-white/50 font-mono text-[10px] rounded-full hover:text-white hover:border-white/20 transition-all uppercase tracking-[0.3em]"
            >
              GLOBAL RANKING
            </motion.button>

            {switchError && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-neon-pink text-[10px] font-mono uppercase tracking-widest"
              >
                <ShieldAlert size={12} />
                <span>Base Network Required to Play</span>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="mt-16 text-white/30 text-[10px] font-mono uppercase tracking-[0.3em] flex flex-col items-center gap-2">
          <p className="hidden md:block">Navigation: A / D or Arrow Keys</p>
          <p className="block md:hidden">Navigation: Swipe Left / Right</p>
        </div>
      </motion.div>
    </div>
  );
};

