import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';

export function useGetCompletedRaffles() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['raffles', 'completed'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompletedRaffles();
    },
    enabled: !!actor && !isFetching,
  });
}
