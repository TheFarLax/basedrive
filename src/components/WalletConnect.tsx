import React from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, RefreshCw, ShieldCheck, Loader2 } from 'lucide-react';

interface WalletConnectProps {
  isVisible: boolean;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ isVisible }) => {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const chainId = useChainId();

  const isWrongNetwork = isConnected && chainId !== base.id;

  const handleConnect = async () => {
    try {
      await connectAsync({ connector: connectors[0] });
    } catch (err) {
      // Errors handled via UI
    }
  };

  const handleSwitch = async () => {
    try {
      await switchChainAsync({ chainId: base.id });
    } catch (err) {
      // Errors handled via UI
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.button
            key="connect"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={handleConnect}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full hover:bg-white/10 transition-all font-mono text-sm shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <Wallet size={16} className="text-neon-cyan" />
            Connect Wallet
          </motion.button>
        ) : isWrongNetwork ? (
          <motion.button
            key="switch"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={handleSwitch}
            disabled={isSwitching}
            className="flex items-center gap-2 px-4 py-2 bg-neon-pink/10 backdrop-blur-md border border-neon-pink/30 text-neon-pink rounded-full hover:bg-neon-pink/20 transition-all font-mono text-sm shadow-[0_0_15px_rgba(255,51,168,0.2)]"
          >
            {isSwitching ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} className="animate-spin-slow" />
            )}
            {isSwitching ? 'Switching...' : 'Switch to Base'}
          </motion.button>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-neon-cyan/20 text-white rounded-full font-mono text-sm shadow-[0_0_15px_rgba(0,240,255,0.1)]">
              <ShieldCheck size={16} className="text-neon-cyan" />
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <button
              onClick={() => disconnect()}
              className="p-2 bg-white/5 backdrop-blur-md border border-white/10 text-white/50 rounded-full hover:text-white hover:bg-white/10 transition-all"
              title="Disconnect"
            >
              <LogOut size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
