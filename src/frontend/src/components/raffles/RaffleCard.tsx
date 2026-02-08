import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, Clock, DollarSign, Users } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { Raffle } from '../../backend';
import { useRemainingSpots } from '../../hooks/raffles/useRemainingSpots';

interface RaffleCardProps {
  raffle: Raffle;
}

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const navigate = useNavigate();
  const { data: remainingSpots } = useRemainingSpots(Number(raffle.id));

  const formatCurrency = (cents: bigint) => {
    return `$${(Number(cents) / 100).toFixed(2)}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = () => {
    switch (raffle.status) {
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'open':
        return <Badge className="bg-green-600 hover:bg-green-700">Open</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      case 'drawn':
        return <Badge className="bg-amber-600 hover:bg-amber-700">Completed</Badge>;
      default:
        return null;
    }
  };

  const remaining = remainingSpots ?? Number(raffle.totalSpots);
  const soldPercentage = ((Number(raffle.totalSpots) - remaining) / Number(raffle.totalSpots)) * 100;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: `/raffle/${raffle.id}` })}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl">{raffle.title}</CardTitle>
            <CardDescription className="mt-1">{raffle.description}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{formatCurrency(raffle.spotPriceCents)}</div>
              <div className="text-xs text-muted-foreground">per spot</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{formatCurrency(raffle.prizeAmountCents)}</div>
              <div className="text-xs text-muted-foreground">prize</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {remaining} / {raffle.totalSpots.toString()}
              </div>
              <div className="text-xs text-muted-foreground">spots left</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium text-xs">{formatDate(raffle.drawTimestamp)}</div>
              <div className="text-xs text-muted-foreground">draw time</div>
            </div>
          </div>
        </div>

        {raffle.status === 'open' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{soldPercentage.toFixed(0)}% sold</span>
              <span>{remaining} remaining</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
          </div>
        )}

        <Button className="w-full" variant={raffle.status === 'open' ? 'default' : 'outline'}>
          {raffle.status === 'open' ? 'Buy Spots' : 'View Details'}
        </Button>
      </CardContent>
    </Card>
  );
}
