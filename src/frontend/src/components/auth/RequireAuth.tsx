import { ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { identity, login, loginStatus } = useInternetIdentity();

  if (!identity) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Please sign in to continue</p>
        <Button onClick={login} disabled={loginStatus === 'logging-in'} className="gap-2">
          <LogIn className="h-4 w-4" />
          {loginStatus === 'logging-in' ? 'Logging in...' : 'Sign In'}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
