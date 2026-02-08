import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Ticket, Calendar, Hash } from 'lucide-react';
import { useGetUserProfile } from '../../hooks/auth/useUserProfile';

interface RaffleAuditPanelProps {
  winner?: string;
  drawTimestamp: bigint;
  drawRecordId?: string;
  spotsSold: number;
  participants: number;
}

export default function RaffleAuditPanel({
  winner,
  drawTimestamp,
  drawRecordId,
  spotsSold,
  participants,
}: RaffleAuditPanelProps) {
  const { data: winnerProfile } = useGetUserProfile(winner);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Draw Results
        </CardTitle>
        <CardDescription>Completed raffle information and winner details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {winner && (
          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-lg border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="font-semibold text-lg">Winner</span>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {winnerProfile?.name || 'Anonymous Winner'}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Ticket className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Spots Sold</div>
              <div className="text-xl font-bold">{spotsSold}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Participants</div>
              <div className="text-xl font-bold">{participants}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Draw Date:</span>
            <span className="font-medium">{formatDate(drawTimestamp)}</span>
          </div>

          {drawRecordId && (
            <div className="flex items-center gap-2 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Draw ID:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {drawRecordId}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
