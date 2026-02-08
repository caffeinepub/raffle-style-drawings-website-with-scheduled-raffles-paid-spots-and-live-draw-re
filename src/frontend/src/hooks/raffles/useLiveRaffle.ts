import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Raffle, Entry } from '../../backend';

export function useGetLiveRaffle(raffleId: number) {
  const { actor, isFetching } = useActor();

  return useQuery<{
    raffle: Raffle;
    timeToDraw: bigint;
    entries: Entry[];
  }>({
    queryKey: ['raffle', raffleId, 'live'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLiveRaffle(BigInt(raffleId));
    },
    enabled: !!actor && !isFetching && raffleId > 0,
    refetchInterval: 5000,
  });
}
