import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import type { Raffle } from '../../backend';
import { useCreateCheckoutSession } from '../../hooks/payments/useCreateCheckoutSession';
import { toast } from 'sonner';
import RequireAuth from '../auth/RequireAuth';

interface PurchaseSpotsPanelProps {
  raffle: Raffle;
  remainingSpots: number;
}

export default function PurchaseSpotsPanel({ raffle, remainingSpots }: PurchaseSpotsPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const createCheckout = useCreateCheckoutSession();

  const formatCurrency = (cents: bigint) => {
    return `$${(Number(cents) / 100).toFixed(2)}`;
  };

  const totalPrice = Number(raffle.spotPriceCents) * quantity;
  const isSoldOut = remainingSpots === 0;
  const maxQuantity = Math.min(remainingSpots, 10);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = async () => {
    if (quantity > remainingSpots) {
      toast.error('Not enough spots remaining');
      return;
    }

    try {
      const items = [
        {
          productName: `${raffle.title} - Raffle Spots`,
          productDescription: `${quantity} spot${quantity > 1 ? 's' : ''} for ${raffle.title}`,
          priceInCents: raffle.spotPriceCents,
          quantity: BigInt(quantity),
          currency: 'usd',
        },
      ];

      await createCheckout.mutateAsync({
        items,
        raffleId: Number(raffle.id),
        quantity,
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to start checkout');
    }
  };

  if (raffle.status !== 'open') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Spots</CardTitle>
          <CardDescription>This raffle is not currently accepting entries.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isSoldOut) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sold Out</CardTitle>
          <CardDescription>All spots for this raffle have been sold.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Spots</CardTitle>
        <CardDescription>
          {formatCurrency(raffle.spotPriceCents)} per spot • {remainingSpots} spots remaining
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RequireAuth>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="quantity">Number of Spots</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= maxQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Maximum {maxQuantity} spots per purchase</p>
            </div>

            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Spot Price:</span>
                <span className="font-medium">{formatCurrency(raffle.spotPriceCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quantity:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-base font-bold">
                <span>Total:</span>
                <span>${(totalPrice / 100).toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handlePurchase}
              disabled={createCheckout.isPending || quantity > remainingSpots}
            >
              <ShoppingCart className="h-4 w-4" />
              {createCheckout.isPending ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
          </div>
        </RequireAuth>
      </CardContent>
    </Card>
  );
}
