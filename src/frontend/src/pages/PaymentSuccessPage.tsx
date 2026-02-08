import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useGetStripeSessionStatus } from '../hooks/payments/useStripeConfig';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/payment-success' }) as { session_id?: string; raffle_id?: string };
  const sessionId = search.session_id;
  const raffleId = search.raffle_id;

  const { data: sessionStatus, isLoading } = useGetStripeSessionStatus(sessionId || '');

  useEffect(() => {
    if (!sessionId) {
      navigate({ to: '/' });
    }
  }, [sessionId, navigate]);

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>Your raffle spots have been purchased.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Thank you for your purchase! Your entries have been recorded and you're now in the draw.
            </p>
            <div className="flex flex-col gap-2">
              {raffleId && (
                <Button onClick={() => navigate({ to: `/raffle/${raffleId}` })}>View Raffle Details</Button>
              )}
              <Button variant="outline" onClick={() => navigate({ to: '/my-entries' })}>
                View My Entries
              </Button>
              <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
                Browse More Raffles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
