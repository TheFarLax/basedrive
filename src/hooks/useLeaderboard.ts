import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { decodeEventLog } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';

export interface LeaderboardEntry {
  player: string;
  score: number;
}

// Block where the contract was deployed on Base mainnet
const DEPLOYMENT_BLOCK = 45859666n;

export const useLeaderboard = () => {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!publicClient) {
        console.warn('Leaderboard: publicClient not available');
        return [];
      }

      try {
        console.log('Leaderboard: Fetching events from block', DEPLOYMENT_BLOCK);
        
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          eventName: 'ScoreSubmitted',
          fromBlock: DEPLOYMENT_BLOCK,
        });

        console.log(`Leaderboard: Found ${logs.length} raw events`);

        const scoresMap = new Map<string, number>();

        logs.forEach((log: any, index: number) => {
          let args = log.args;

          // Robust fallback: manually decode if the automatic decoding failed
          if (!args && log.data) {
            try {
              const decoded = decodeEventLog({
                abi: CONTRACT_ABI,
                data: log.data,
                topics: log.topics,
              });
              if (decoded.eventName === 'ScoreSubmitted') {
                args = decoded.args;
                console.log(`Leaderboard: Manually decoded log ${index}`);
              }
            } catch (decodeError) {
              console.error(`Leaderboard: Manual decode failed for log ${index}`, decodeError);
            }
          }

          if (args && args.player && args.score !== undefined) {
            const player = args.player as string;
            const score = Number(args.score);
            
            if (index === 0) {
              console.log('Leaderboard: Successfully parsed entry:', { player, score });
            }

            const currentMax = scoresMap.get(player) || 0;
            if (score > currentMax) {
              scoresMap.set(player, score);
            }
          } else {
            console.warn(`Leaderboard: Log ${index} could not be parsed:`, log);
          }
        });

        const result = Array.from(scoresMap.entries())
          .map(([player, score]) => ({ player, score }))
          .sort((a, b) => b.score - a.score);

        console.log('Leaderboard: Final processed count:', result.length);

        if (result.length > 0) {
          localStorage.setItem('basedrive_leaderboard_cache', JSON.stringify(result));
        }

        return result;
      } catch (e) {
        console.error('Leaderboard: Global fetch error:', e);
        const cached = localStorage.getItem('basedrive_leaderboard_cache');
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (parseErr) {
            return [];
          }
        }
        return [];
      }
    },
    initialData: () => {
      try {
        const cached = localStorage.getItem('basedrive_leaderboard_cache');
        return cached ? JSON.parse(cached) : undefined;
      } catch (e) {
        return undefined;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
};
