import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Video, Ticket, DollarSign, Calendar, Users } from 'lucide-react';
import { useGetRaffle } from '../hooks/raffles/useRaffles';
import { useRemainingSpots } from '../hooks/raffles/useRemainingSpots';
import { useGetCompletedRaffles } from '../hooks/raffles/useCompletedRaffles';
import PurchaseSpotsPanel from '../components/raffles/PurchaseSpotsPanel';
import RaffleAuditPanel from '../components/raffles/RaffleAuditPanel';
import { Loader2 } from 'lucide-react';

export default function RaffleDetailPage() {
  const { raffleId } = useParams({ from: '/raffle/$raffleId' });
  const navigate = useNavigate();
  const { data: raffle, isLoading } = useGetRaffle(Number(raffleId));
  const { data: remainingSpots } = useRemainingSpots(Number(raffleId));
  const { data: completedRaffles } = useGetCompletedRaffles();

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Raffle Not Found</h2>
          <Button onClick={() => navigate({ to: '/' })}>Return to Raffles</Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (cents: bigint) => {
    return `$${(Number(cents) / 100).toFixed(2)}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('en-US', {
      month: 'long',
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

  const completedInfo = completedRaffles?.find((r) => r.id === raffle.id);

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Raffles
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{raffle.title}</CardTitle>
                  <CardDescription className="text-base">{raffle.description}</CardDescription>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Spot Price</div>
                    <div className="text-lg font-bold">{formatCurrency(raffle.spotPriceCents)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Ticket className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Prize</div>
                    <div className="text-lg font-bold">{formatCurrency(raffle.prizeAmountCents)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Spots</div>
                    <div className="text-lg font-bold">
                      {remainingSpots ?? 0} / {raffle.totalSpots.toString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Draw Date</div>
                    <div className="text-sm font-bold">{formatDate(raffle.drawTimestamp)}</div>
                  </div>
                </div>
              </div>

              {raffle.videoUrl && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Live Video Available</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Watch the live drawing when it happens!
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate({ to: `/raffle/${raffleId}/live` })}
                    className="gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Go to Live Drawing
                  </Button>
                </div>
              )}

              {!raffle.videoUrl && raffle.status === 'open' && (
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: `/raffle/${raffleId}/live` })}
                  className="w-full gap-2"
                >
                  <Video className="h-4 w-4" />
                  View Live Drawing Page
                </Button>
              )}
            </CardContent>
          </Card>

          {raffle.status === 'drawn' && completedInfo && (
            <RaffleAuditPanel
              winner={raffle.winner}
              drawTimestamp={raffle.drawTimestamp}
              drawRecordId={raffle.drawRecordId}
              spotsSold={Number(completedInfo.spotsSold)}
              participants={Number(completedInfo.participants)}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <PurchaseSpotsPanel raffle={raffle} remainingSpots={remainingSpots ?? Number(raffle.totalSpots)} />
        </div>
      </div>
    </div>
  );
}
