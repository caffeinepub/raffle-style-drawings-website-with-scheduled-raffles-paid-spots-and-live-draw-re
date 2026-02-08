import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useMyEntries } from '../hooks/entries/useMyEntries';
import { Loader2, Ticket, Trophy } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import { useGetUserProfile } from '../hooks/auth/useUserProfile';

export default function MyEntriesPage() {
  const navigate = useNavigate();
  const { data: entries, isLoading } = useMyEntries();

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

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Entries</h1>
          <p className="text-muted-foreground">View all your raffle entries and results</p>
        </div>

        <RequireAuth>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : entries && entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry) => (
                <EntryCard key={`${entry.raffleId}-${entry.entryId}`} entry={entry} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Entries Yet</h3>
                <p className="text-muted-foreground mb-6">You haven't purchased any raffle spots yet.</p>
                <Button onClick={() => navigate({ to: '/' })}>Browse Raffles</Button>
              </CardContent>
            </Card>
          )}
        </RequireAuth>
      </div>
    </div>
  );
}

function EntryCard({ entry }: { entry: any }) {
  const navigate = useNavigate();
  const { data: winnerProfile } = useGetUserProfile(entry.winner);

  const formatCurrency = (cents: bigint) => {
    return `$${(Number(cents) / 100).toFixed(2)}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = () => {
    switch (entry.status) {
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'open':
        return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>;
      case 'drawn':
        return <Badge className="bg-amber-600 hover:bg-amber-700">Completed</Badge>;
      default:
        return <Badge variant="outline">{entry.status}</Badge>;
    }
  };

  const isWinner = entry.status === 'drawn' && entry.winner === entry.buyer;

  return (
    <Card className={isWinner ? 'border-amber-500/50 bg-amber-500/5' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              {entry.raffleTitle}
              {isWinner && <Trophy className="h-5 w-5 text-amber-500" />}
            </CardTitle>
            <CardDescription>Purchased on {formatDate(entry.purchaseTime)}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Spots Purchased</div>
            <div className="text-lg font-bold">{entry.quantity.toString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Paid</div>
            <div className="text-lg font-bold">{formatCurrency(entry.totalPaid)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Prize Amount</div>
            <div className="text-lg font-bold">{formatCurrency(entry.prizeAmount)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Draw Date</div>
            <div className="text-sm font-medium">{formatDate(entry.drawTimestamp)}</div>
          </div>
        </div>

        {isWinner && (
          <div className="p-4 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-lg border border-amber-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="font-bold text-amber-600 dark:text-amber-400">You Won!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Congratulations! You are the winner of this raffle.
            </p>
          </div>
        )}

        {entry.status === 'drawn' && !isWinner && entry.winner && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Winner</div>
            <div className="font-medium">{winnerProfile?.name || 'Anonymous Winner'}</div>
          </div>
        )}

        <Button variant="outline" onClick={() => navigate({ to: `/raffle/${entry.raffleId}` })} className="w-full">
          View Raffle Details
        </Button>
      </CardContent>
    </Card>
  );
}
