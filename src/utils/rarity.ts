export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface RarityConfig {
  name: Rarity;
  probability: number; // 0 to 1
  color: string;
  glow: string;
  xpReward: number;
}

export const RARITIES: Record<Rarity, RarityConfig> = {
  Common: {
    name: 'Common',
    probability: 0.5,
    color: '#3B82F6', // Blue-500
    glow: 'rgba(59, 130, 246, 0.5)',
    xpReward: 10,
  },
  Rare: {
    name: 'Rare',
    probability: 0.3,
    color: '#8B5CF6', // Violet-500
    glow: 'rgba(139, 92, 246, 0.6)',
    xpReward: 30,
  },
  Epic: {
    name: 'Epic',
    probability: 0.15,
    color: '#EC4899', // Pink-500
    glow: 'rgba(236, 72, 153, 0.7)',
    xpReward: 100,
  },
  Legendary: {
    name: 'Legendary',
    probability: 0.04,
    color: '#F59E0B', // Amber-500
    glow: 'rgba(245, 158, 11, 0.8)',
    xpReward: 500,
  },
  Mythic: {
    name: 'Mythic',
    probability: 0.01,
    color: '#10B981', // Emerald-500
    glow: 'rgba(16, 185, 129, 1)',
    xpReward: 2000,
  },
};

export function rollRarity(): RarityConfig {
  const rand = Math.random();
  let cumulative = 0;
  
  // Need an ordered array to properly check cumulative probabilities
  const orderedRarities = [
    RARITIES.Common,
    RARITIES.Rare,
    RARITIES.Epic,
    RARITIES.Legendary,
    RARITIES.Mythic
  ];

  for (const rarity of orderedRarities) {
    cumulative += rarity.probability;
    if (rand <= cumulative) {
      return rarity;
    }
  }
  return RARITIES.Common; // Fallback
}
