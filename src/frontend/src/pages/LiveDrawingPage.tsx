import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Video, Trophy, Users, Ticket } from 'lucide-react';
import { useGetLiveRaffle } from '../hooks/raffles/useLiveRaffle';
import CountdownTimer from '../components/raffles/CountdownTimer';
import { Loader2 } from 'lucide-react';
import { useGetUserProfile } from '../hooks/auth/useUserProfile';

export default function LiveDrawingPage() {
  const { raffleId } = useParams({ from: '/raffle/$raffleId/live' });
  const navigate = useNavigate();
  const { data: liveData, isLoading } = useGetLiveRaffle(Number(raffleId));
  const { data: winnerProfile } = useGetUserProfile(liveData?.raffle.winner);

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!liveData) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Raffle Not Found</h2>
          <Button onClick={() => navigate({ to: '/' })}>Return to Raffles</Button>
        </div>
      </div>
    );
  }

  const { raffle, timeToDraw, entries } = liveData;
  const isDrawn = raffle.status === 'drawn';
  const totalEntries = entries.reduce((sum, entry) => sum + Number(entry.quantity), 0);
  const uniqueParticipants = new Set(entries.map((e) => e.buyer)).size;

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate({ to: `/raffle/${raffleId}` })} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Raffle Details
      </Button>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{raffle.title}</CardTitle>
            <CardDescription className="text-base">Live Drawing Event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isDrawn && Number(timeToDraw) > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center">Time Until Draw</h3>
                <CountdownTimer targetTimestamp={raffle.drawTimestamp} />
              </div>
            )}

            {!isDrawn && Number(timeToDraw) <= 0 && (
              <div className="text-center py-8">
                <div className="text-2xl font-bold text-primary mb-2">Draw Time!</div>
                <p className="text-muted-foreground">The admin will trigger the draw shortly...</p>
              </div>
            )}

            {isDrawn && raffle.winner && (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
                  <Trophy className="h-8 w-8 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Winner Announced!</h3>
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {winnerProfile?.name || 'Anonymous Winner'}
                  </div>
                </div>
              </div>
            )}

            {raffle.videoUrl && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center">
                  <Video className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Live Video Stream</h3>
                </div>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
                  <div className="text-center p-6">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Video embed URL: {raffle.videoUrl}
                    </p>
                    <Button variant="outline" asChild>
                      <a href={raffle.videoUrl} target="_blank" rel="noopener noreferrer">
                        Open Video Stream
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Ticket className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Total Entries</div>
                  <div className="text-2xl font-bold">{totalEntries}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                  <div className="text-2xl font-bold">{uniqueParticipants}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
