import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/payment-failure' }) as { raffle_id?: string };
  const raffleId = search.raffle_id;

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
            <CardDescription>Your payment was not completed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              No charges were made. You can try again or browse other raffles.
            </p>
            <div className="flex flex-col gap-2">
              {raffleId && (
                <Button onClick={() => navigate({ to: `/raffle/${raffleId}` })}>Try Again</Button>
              )}
              <Button variant="outline" onClick={() => navigate({ to: '/' })}>
                Browse Raffles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
