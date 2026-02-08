import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import type { ShoppingItem } from '../../backend';

interface CheckoutSession {
  id: string;
  url: string;
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      items,
      raffleId,
      quantity,
    }: {
      items: ShoppingItem[];
      raffleId: number;
      quantity: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Please sign in to purchase');

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success?raffle_id=${raffleId}`;
      const cancelUrl = `${baseUrl}/payment-failure?raffle_id=${raffleId}`;

      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      const buyerPid = identity.getPrincipal().toString();
      await actor.purchaseEntries(buyerPid, BigInt(raffleId), BigInt(quantity), BigInt(quantity));

      queryClient.invalidateQueries({ queryKey: ['raffle', raffleId] });
      queryClient.invalidateQueries({ queryKey: ['raffles'] });
      queryClient.invalidateQueries({ queryKey: ['myEntries'] });

      window.location.href = session.url;
      return session;
    },
  });
}
