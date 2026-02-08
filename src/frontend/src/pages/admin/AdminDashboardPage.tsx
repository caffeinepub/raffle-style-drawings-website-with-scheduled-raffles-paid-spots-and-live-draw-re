import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Ticket, Settings } from 'lucide-react';
import AdminGuard from '../../components/admin/AdminGuard';
import StripePaymentSetup from '../../components/admin/StripePaymentSetup';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <AdminGuard>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage raffles and configure payment settings</p>
          </div>

          <div className="grid gap-6">
            <StripePaymentSetup />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Raffle Management
                </CardTitle>
                <CardDescription>Create, edit, and manage raffle drawings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate({ to: '/admin/raffles' })}>Manage Raffles</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
