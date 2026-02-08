import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Raffle } from '../../backend';

export function useGetAllRaffles() {
  const { actor, isFetching } = useActor();

  return useQuery<Raffle[]>({
    queryKey: ['raffles', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRaffles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActiveRaffles() {
  const { actor, isFetching } = useActor();

  return useQuery<Raffle[]>({
    queryKey: ['raffles', 'active'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveRaffles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRaffle(raffleId: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Raffle | undefined>({
    queryKey: ['raffle', raffleId],
    queryFn: async () => {
      if (!actor) return undefined;
      const raffles = await actor.getAllRaffles();
      return raffles.find((r) => Number(r.id) === raffleId);
    },
    enabled: !!actor && !isFetching && raffleId > 0,
  });
}
