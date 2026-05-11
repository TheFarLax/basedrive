import { motion, AnimatePresence } from 'framer-motion';
import type { RarityConfig } from '../../utils/rarity';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { useAudio } from '../../hooks/useAudio';

interface RarityPopupProps {
  reward: RarityConfig | null;
  onClose: () => void;
}

export function RarityPopup({ reward, onClose }: RarityPopupProps) {
  const { playReveal } = useAudio();

  useEffect(() => {
    if (reward) {
      playReveal(reward.name);
      
      if (reward.name === 'Legendary' || reward.name === 'Mythic') {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: [reward.color, '#ffffff']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: [reward.color, '#ffffff']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      } else if (reward.name === 'Epic') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: [reward.color, '#ffffff']
        });
      }
    }
  }, [reward, playReveal]);

  return (
    <AnimatePresence>
      {reward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, rotateX: 45 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          >
            <GlassCard 
              className="w-full max-w-sm p-8 flex flex-col items-center text-center border-t-2"
              style={{ borderTopColor: reward.color }}
              glowColor={reward.glow}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl"
                style={{ 
                  background: `radial-gradient(circle, ${reward.color} 0%, transparent 80%)`,
                  boxShadow: `0 0 40px ${reward.glow}`
                }}
              >
                <div className="w-16 h-16 rounded-full bg-base-dark border-4 flex items-center justify-center" style={{ borderColor: reward.color }}>
                  <span className="text-2xl font-bold" style={{ color: reward.color }}>
                    {reward.name[0]}
                  </span>
                </div>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-display font-bold mb-2 uppercase tracking-widest"
                style={{ color: reward.color, textShadow: `0 0 20px ${reward.glow}` }}
              >
                {reward.name}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-300 mb-8"
              >
                You earned <span className="font-bold text-white">+{reward.xpReward} XP</span>
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full"
              >
                <Button 
                  onClick={onClose} 
                  className="w-full py-3"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    boxShadow: `0 0 15px ${reward.glow}` 
                  }}
                >
                  Collect Reward
                </Button>
              </motion.div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
