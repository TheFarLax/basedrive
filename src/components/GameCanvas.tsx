import React, { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameEngine } from '../hooks/useGameEngine';
import { GameUI } from './GameUI';
import { GameOverScreen } from './GameOverScreen';
import { StartScreen } from './StartScreen';
import { WalletConnect } from './WalletConnect';
import { Leaderboard } from './Leaderboard';

import { useAccount, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';

export const GameCanvas: React.FC = () => {
  const { canvasRef, gameState, score, highScore, startGame, setLane, resetGame } = useGameEngine();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  // Strict enforcement: Reset to menu if disconnected or wrong network during play
  useEffect(() => {
    if (gameState === 'playing' && (!isConnected || chainId !== base.id)) {
      resetGame();
    }
  }, [isConnected, chainId, gameState, resetGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setLane('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setLane('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, setLane]);

  // Touch/Swipe controls
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gameState !== 'playing') return;

    const touchEndX = e.touches[0].clientX;
    const diffX = touchStartRef.current.x - touchEndX;

    // Minimum swipe distance
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        setLane('left');
      } else {
        setLane('right');
      }
      // Reset to prevent multiple triggers from one continuous swipe
      touchStartRef.current = { x: touchEndX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  return (
    <div 
      className="relative w-full h-screen bg-base-dark overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <WalletConnect isVisible={(gameState === 'menu' || gameState === 'gameover') && !showLeaderboard} />
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />

      <AnimatePresence>
        {showLeaderboard && (
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        )}
      </AnimatePresence>

      {gameState === 'menu' && !showLeaderboard && (
        <StartScreen 
          onStart={startGame} 
          onShowLeaderboard={() => setShowLeaderboard(true)} 
        />
      )}

      {gameState === 'playing' && (
        <GameUI score={score} highScore={highScore} />
      )}

      {gameState === 'gameover' && !showLeaderboard && (
        <GameOverScreen 
          score={score} 
          highScore={highScore} 
          onRestart={startGame} 
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
      )}
    </div>
  );
};
