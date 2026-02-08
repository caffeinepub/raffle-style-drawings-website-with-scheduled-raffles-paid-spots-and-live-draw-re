import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Raffle } from '../../backend';

interface RaffleFormProps {
  raffle?: Raffle;
  onSubmit: (config: {
    title: string;
    description: string;
    spotPriceCents: bigint;
    totalSpots: bigint;
    prizeAmountCents: bigint;
    drawTimestamp: bigint;
    videoUrl?: string;
  }) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
}

export default function RaffleForm({ raffle, onSubmit, submitLabel, isSubmitting }: RaffleFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [spotPrice, setSpotPrice] = useState('10');
  const [totalSpots, setTotalSpots] = useState('50');
  const [prizeAmount, setPrizeAmount] = useState('100');
  const [drawDate, setDrawDate] = useState('');
  const [drawTime, setDrawTime] = useState('20:00');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (raffle) {
      setTitle(raffle.title);
      setDescription(raffle.description);
      setSpotPrice((Number(raffle.spotPriceCents) / 100).toString());
      setTotalSpots(raffle.totalSpots.toString());
      setPrizeAmount((Number(raffle.prizeAmountCents) / 100).toString());

      const date = new Date(Number(raffle.drawTimestamp) / 1_000_000);
      setDrawDate(date.toISOString().split('T')[0]);
      setDrawTime(date.toTimeString().slice(0, 5));
      setVideoUrl(raffle.videoUrl || '');
    }
  }, [raffle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateTime = new Date(`${drawDate}T${drawTime}`);
    const drawTimestamp = BigInt(dateTime.getTime() * 1_000_000);

    await onSubmit({
      title,
      description,
      spotPriceCents: BigInt(Math.round(parseFloat(spotPrice) * 100)),
      totalSpots: BigInt(totalSpots),
      prizeAmountCents: BigInt(Math.round(parseFloat(prizeAmount) * 100)),
      drawTimestamp,
      videoUrl: videoUrl.trim() || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{raffle ? 'Edit Raffle' : 'Create New Raffle'}</CardTitle>
        <CardDescription>
          {raffle ? 'Update raffle details' : 'Set up a new raffle drawing'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekend Big Draw"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter raffle details..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spotPrice">Spot Price ($)</Label>
              <Input
                id="spotPrice"
                type="number"
                step="0.01"
                min="0.01"
                value={spotPrice}
                onChange={(e) => setSpotPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSpots">Total Spots</Label>
              <Input
                id="totalSpots"
                type="number"
                min="1"
                value={totalSpots}
                onChange={(e) => setTotalSpots(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizeAmount">Prize Amount ($)</Label>
              <Input
                id="prizeAmount"
                type="number"
                step="0.01"
                min="0.01"
                value={prizeAmount}
                onChange={(e) => setPrizeAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="drawDate">Draw Date</Label>
              <Input id="drawDate" type="date" value={drawDate} onChange={(e) => setDrawDate(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="drawTime">Draw Time</Label>
              <Input id="drawTime" type="time" value={drawTime} onChange={(e) => setDrawTime(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Live Video URL (optional)</Label>
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/live/..."
            />
            <p className="text-xs text-muted-foreground">YouTube Live, Facebook Live, or other embed URL</p>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
