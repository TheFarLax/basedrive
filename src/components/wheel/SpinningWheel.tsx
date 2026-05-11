import { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { RarityConfig } from '../../utils/rarity';
import { useAudio } from '../../hooks/useAudio';
import { Button } from '../ui/Button';

interface SpinningWheelProps {
  onSpin: () => RarityConfig | null;
  onSpinEnd: (reward: RarityConfig) => void;
  canSpin: boolean;
  timeUntilNextSpin: number;
}

const SEGMENTS = 12;
const DEGREES_PER_SEGMENT = 360 / SEGMENTS;

export function SpinningWheel({ onSpin, onSpinEnd, canSpin, timeUntilNextSpin }: SpinningWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();
  const rotationRef = useRef(0);
  const { playClick, playTick } = useAudio();

  const handleSpin = async () => {
    if (isSpinning || !canSpin) {
      if (!canSpin) playClick(); // Just a generic click if disabled
      return;
    }
    
    playClick();
    setIsSpinning(true);
    
    const reward = onSpin();
    if (!reward) {
      setIsSpinning(false);
      return;
    }
    
    // Simulate finding the target segment (for visuals only, real result is the `reward`)
    // We'll spin it around 5-8 times and land on a random angle that "looks" good
    const spins = 5 + Math.random() * 3;
    const extraDegrees = Math.random() * 360;
    const targetRotation = rotationRef.current + (spins * 360) + extraDegrees;
    
    // Animate ticks based on motion value update (approximate)
    let lastTickAngle = rotationRef.current;
    
    await controls.start({
      rotate: targetRotation,
      transition: {
        duration: 5,
        ease: [0.2, 0.8, 0.3, 1], // Custom cubic bezier for realistic momentum easing
        onUpdate: (latest: any) => {
          // Play tick sound every ~30 degrees
          if (latest - lastTickAngle > 30) {
            playTick();
            lastTickAngle = latest;
          }
        }
      }
    });

    rotationRef.current = targetRotation % 360;
    setIsSpinning(false);
    onSpinEnd(reward);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center pt-20 pb-10">
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem]">
        {/* Glow behind the wheel */}
        <div className="absolute inset-[-20%] bg-base-blue/20 rounded-full blur-[100px] animate-pulse" />
        
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-12">
          <svg viewBox="0 0 24 24" fill="#00F0FF" className="drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
            <path d="M12 24l-8-12h16z" />
          </svg>
        </div>

        {/* The Wheel */}
        <motion.div 
          className="relative w-full h-full rounded-full border-8 border-base-dark shadow-[0_0_50px_rgba(0,82,255,0.3)] overflow-hidden bg-gray-900"
          animate={controls}
          initial={{ rotate: 0 }}
          style={{
            boxShadow: isSpinning ? '0 0 80px rgba(0, 240, 255, 0.4)' : '0 0 50px rgba(0,82,255,0.3)',
            transition: 'box-shadow 0.3s ease'
          }}
        >
          {/* Create segments visually */}
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const rotation = i * DEGREES_PER_SEGMENT;
            // Interleave colors for visual effect
            const color = i % 2 === 0 ? '#111827' : '#1F2937';
            const borderColor = i % 4 === 0 ? '#0052FF' : 'rgba(255,255,255,0.05)';
            
            return (
              <div 
                key={i}
                className="absolute w-full h-full"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)', // Approximate a slice
                  background: color,
                  borderRight: `2px solid ${borderColor}`,
                  transformOrigin: '50% 50%'
                }}
              >
                {/* Visual accents on the wheel */}
                <div className="absolute top-[10%] right-[10%] w-2 h-2 rounded-full bg-white/20" />
              </div>
            );
          })}

          {/* Inner ring */}
          <div className="absolute inset-[15%] rounded-full border-4 border-base-blue/30 bg-base-dark/80 backdrop-blur-md shadow-inner flex items-center justify-center">
            {/* Center Hub */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-base-blue to-neon-purple shadow-[0_0_20px_rgba(0,82,255,0.8)] flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 text-center z-10">
        <Button 
          size="lg" 
          onClick={handleSpin}
          disabled={isSpinning || (!canSpin && import.meta.env.MODE !== 'development')}
          className="w-64 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-base-blue to-neon-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10 font-display font-bold">
            {isSpinning ? 'SPINNING...' : canSpin ? 'SPIN NOW' : `NEXT SPIN: ${formatTime(timeUntilNextSpin)}`}
          </span>
        </Button>
      </div>
    </div>
  );
}
