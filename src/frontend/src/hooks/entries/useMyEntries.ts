import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import type { Entry } from '../../backend';

export function useMyEntries() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['myEntries', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];

      const myPrincipal = identity.getPrincipal().toString();
      const raffles = await actor.getAllRaffles();

      const entriesPromises = raffles.map(async (raffle) => {
        const entries = await actor.getEntries(raffle.id);
        const myEntries = entries.filter((e) => e.buyer === myPrincipal);

        return myEntries.map((entry) => ({
          entryId: entry.id,
          raffleId: raffle.id,
          raffleTitle: raffle.title,
          quantity: entry.quantity,
          totalPaid: BigInt(Number(raffle.spotPriceCents) * Number(entry.quantity)),
          prizeAmount: raffle.prizeAmountCents,
          purchaseTime: entry.purchaseTime,
          drawTimestamp: raffle.drawTimestamp,
          status: raffle.status,
          winner: raffle.winner,
          buyer: entry.buyer,
        }));
      });

      const allEntries = await Promise.all(entriesPromises);
      return allEntries.flat().sort((a, b) => Number(b.purchaseTime) - Number(a.purchaseTime));
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
