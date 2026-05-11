import { motion } from 'framer-motion';
import { Wallet, Zap, Trophy } from 'lucide-react';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import type { GameState } from '../../hooks/useGameLogic';

interface HeaderProps {
  gameState: GameState;
  onConnectWallet: () => void;
}

export function Header({ gameState, onConnectWallet }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-center bg-gradient-to-b from-base-dark/90 to-transparent backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-full bg-base-blue shadow-[0_0_15px_rgba(0,82,255,0.6)] flex items-center justify-center">
          <Zap className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-display font-bold tracking-tight hidden sm:block">
          <span className="text-white">Base</span>
          <span className="text-gradient">Spin</span>
        </h1>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 sm:gap-4"
      >
        <GlassCard className="hidden sm:flex items-center gap-4 px-4 py-2 rounded-full border-base-blue/30">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-neon-gold" />
            <span className="text-sm font-semibold">Lvl {gameState.level}</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neon-cyan">{gameState.xp} XP</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neon-purple">{gameState.streak}🔥 Streak</span>
          </div>
        </GlassCard>

        {/* Mobile quick stats */}
        <div className="sm:hidden flex items-center gap-3 mr-2">
          <span className="text-sm font-semibold">Lvl {gameState.level}</span>
          <span className="text-sm font-semibold text-neon-cyan">{gameState.xp} XP</span>
        </div>

        <Button size="sm" onClick={onConnectWallet} className="rounded-full shadow-[0_0_10px_rgba(0,82,255,0.3)]">
          <Wallet className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Connect</span>
        </Button>
      </motion.div>
    </header>
  );
}
