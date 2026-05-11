import React from 'react';

interface GameUIProps {
  score: number;
  highScore: number;
}

export const GameUI: React.FC<GameUIProps> = ({ score, highScore }) => {
  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none">
      <div className="flex flex-col gap-1">
        <h2 className="text-white/50 text-sm font-mono uppercase tracking-widest">Score</h2>
        <p className="text-4xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          {score.toLocaleString()}
        </p>
      </div>

      <div className="flex flex-col gap-1 items-end">
        <h2 className="text-neon-cyan/50 text-sm font-mono uppercase tracking-widest">Best</h2>
        <p className="text-2xl font-display font-semibold text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
          {highScore.toLocaleString()}
        </p>
      </div>
    </div>
  );
};
