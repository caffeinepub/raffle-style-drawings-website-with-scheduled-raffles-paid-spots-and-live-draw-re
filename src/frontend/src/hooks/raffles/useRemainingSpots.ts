import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';

export function useRemainingSpots(raffleId: number) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['raffle', raffleId, 'remainingSpots'],
    queryFn: async () => {
      if (!actor) return 0;
      const remaining = await actor.getRemainingSpots(BigInt(raffleId));
      return Number(remaining);
    },
    enabled: !!actor && !isFetching && raffleId > 0,
    refetchInterval: 10000,
  });
}
