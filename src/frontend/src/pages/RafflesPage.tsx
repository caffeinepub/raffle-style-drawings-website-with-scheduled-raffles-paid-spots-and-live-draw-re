import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RaffleCard from '../components/raffles/RaffleCard';
import { useGetAllRaffles } from '../hooks/raffles/useRaffles';
import { Loader2 } from 'lucide-react';
import ProfileSetupDialog from '../components/auth/ProfileSetupDialog';
import { useGetCallerUserProfile } from '../hooks/auth/useUserProfile';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function RafflesPage() {
  const { data: raffles, isLoading } = useGetAllRaffles();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const upcomingRaffles = raffles?.filter((r) => r.status === 'upcoming') || [];
  const activeRaffles = raffles?.filter((r) => r.status === 'open') || [];
  const completedRaffles = raffles?.filter((r) => r.status === 'drawn') || [];

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <ProfileSetupDialog open={showProfileSetup} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <img
          src="/assets/generated/raffle-hero.dim_1600x600.png"
          alt="Raffle Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Win Big with Our Raffles
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join our exciting raffle drawings! Buy spots for as low as $10 and win prizes up to $500. Live drawings
              every week.
            </p>
          </div>
        </div>
      </section>

      {/* Raffles Section */}
      <section className="container py-12">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="active">
              Active ({activeRaffles.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingRaffles.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedRaffles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeRaffles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No active raffles at the moment. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRaffles.map((raffle) => (
                  <RaffleCard key={raffle.id.toString()} raffle={raffle} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingRaffles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No upcoming raffles scheduled.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingRaffles.map((raffle) => (
                  <RaffleCard key={raffle.id.toString()} raffle={raffle} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedRaffles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No completed raffles yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedRaffles.map((raffle) => (
                  <RaffleCard key={raffle.id.toString()} raffle={raffle} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}
