import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { RaffleAdminConfig, RaffleStatus } from '../../backend';

export function useCreateRaffle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: RaffleAdminConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRaffle(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffles'] });
    },
  });
}

export function useUpdateRaffle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, config }: { id: number; config: RaffleAdminConfig }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateRaffle(BigInt(id), config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffles'] });
    },
  });
}

export function useChangeRaffleStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: RaffleStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.changeStatus(BigInt(id), status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffles'] });
    },
  });
}

export function useTriggerDraw() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.triggerDraw(BigInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffles'] });
    },
  });
}
