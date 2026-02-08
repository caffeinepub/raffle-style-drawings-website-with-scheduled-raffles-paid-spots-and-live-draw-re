import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetTimestamp: bigint;
}

export default function CountdownTimer({ targetTimestamp }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now() * 1_000_000;
      const target = Number(targetTimestamp);
      const difference = target - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const seconds = Math.floor((difference / 1_000_000_000) % 60);
      const minutes = Math.floor((difference / (1_000_000_000 * 60)) % 60);
      const hours = Math.floor((difference / (1_000_000_000 * 60 * 60)) % 24);
      const days = Math.floor(difference / (1_000_000_000 * 60 * 60 * 24));

      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp]);

  if (!timeLeft) {
    return null;
  }

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
      <Clock className="h-6 w-6 text-primary" />
      <div className="flex gap-4">
        {timeLeft.days > 0 && (
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{timeLeft.days}</div>
            <div className="text-xs text-muted-foreground uppercase">Days</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground uppercase">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground uppercase">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground uppercase">Seconds</div>
        </div>
      </div>
      {isExpired && <div className="ml-4 text-sm font-medium text-primary">Draw Time!</div>}
    </div>
  );
}
