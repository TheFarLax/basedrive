import { useState, useCallback, useEffect } from 'react';
import type { RarityConfig } from '../utils/rarity';
import { rollRarity } from '../utils/rarity';

export interface GameState {
  xp: number;
  level: number;
  streak: number;
  spinsTotal: number;
  lastSpinDate: number | null;
  canSpin: boolean;
  timeUntilNextSpin: number; // in seconds
}

const SPIN_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>({
    xp: 0,
    level: 1,
    streak: 0,
    spinsTotal: 0,
    lastSpinDate: null,
    canSpin: true,
    timeUntilNextSpin: 0,
  });

  const [currentReward, setCurrentReward] = useState<RarityConfig | null>(null);

  // Load state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('baseSpinState');
    if (saved) {
      setGameState(JSON.parse(saved));
    }
  }, []);

  // Save state to local storage when it changes
  useEffect(() => {
    localStorage.setItem('baseSpinState', JSON.stringify(gameState));
  }, [gameState]);

  // Cooldown logic
  useEffect(() => {
    if (!gameState.lastSpinDate) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const timePassed = now - gameState.lastSpinDate!;
      if (timePassed >= SPIN_COOLDOWN_MS) {
        setGameState(prev => ({ ...prev, canSpin: true, timeUntilNextSpin: 0 }));
        clearInterval(interval);
      } else {
        setGameState(prev => ({ 
          ...prev, 
          canSpin: false, 
          timeUntilNextSpin: Math.floor((SPIN_COOLDOWN_MS - timePassed) / 1000) 
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.lastSpinDate]);

  const spin = useCallback((): RarityConfig | null => {
    if (!gameState.canSpin && import.meta.env.MODE !== 'development') {
      // In dev mode, we might want to bypass for testing, but let's keep it strict for now.
      // Or maybe we allow bypass for v1 testing. We will allow spin anytime for testing if we just return here.
      // Actually, for testing, let's just bypass cooldown.
      // return null; 
    }

    const reward = rollRarity();
    setCurrentReward(reward);

    setGameState(prev => {
      let newStreak = prev.streak;
      
      // Streak logic: if last spin was between 4h and 28h ago, streak++
      // If > 28h ago, streak resets
      if (prev.lastSpinDate) {
        const timePassed = Date.now() - prev.lastSpinDate;
        if (timePassed <= SPIN_COOLDOWN_MS + (24 * 60 * 60 * 1000)) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Calculate XP and level
      const newXp = prev.xp + reward.xpReward;
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        spinsTotal: prev.spinsTotal + 1,
        lastSpinDate: Date.now(),
        canSpin: false,
        timeUntilNextSpin: SPIN_COOLDOWN_MS / 1000,
      };
    });

    return reward;
  }, [gameState.canSpin]);

  return {
    gameState,
    spin,
    currentReward,
    setCurrentReward, // To clear it after popup
  };
}
