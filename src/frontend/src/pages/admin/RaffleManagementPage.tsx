import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import AdminGuard from '../../components/admin/AdminGuard';
import RaffleForm from '../../components/admin/RaffleForm';
import { useGetAllRaffles } from '../../hooks/raffles/useRaffles';
import {
  useCreateRaffle,
  useUpdateRaffle,
  useChangeRaffleStatus,
  useTriggerDraw,
} from '../../hooks/admin/useAdminRaffles';
import { toast } from 'sonner';
import type { Raffle, RaffleStatus } from '../../backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function RaffleManagementPage() {
  const navigate = useNavigate();
  const { data: raffles, isLoading } = useGetAllRaffles();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);

  const createRaffle = useCreateRaffle();
  const updateRaffle = useUpdateRaffle();
  const changeStatus = useChangeRaffleStatus();
  const triggerDraw = useTriggerDraw();

  const handleCreate = async (config: any) => {
    try {
      await createRaffle.mutateAsync(config);
      toast.success('Raffle created successfully!');
      setShowCreateForm(false);
    } catch (error) {
      toast.error('Failed to create raffle');
      console.error(error);
    }
  };

  const handleUpdate = async (config: any) => {
    if (!editingRaffle) return;
    try {
      await updateRaffle.mutateAsync({ id: Number(editingRaffle.id), config });
      toast.success('Raffle updated successfully!');
      setEditingRaffle(null);
    } catch (error) {
      toast.error('Failed to update raffle');
      console.error(error);
    }
  };

  const handleStatusChange = async (raffleId: bigint, newStatus: RaffleStatus) => {
    try {
      await changeStatus.mutateAsync({ id: Number(raffleId), status: newStatus });
      toast.success('Status updated successfully!');
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const handleTriggerDraw = async (raffleId: bigint) => {
    try {
      await triggerDraw.mutateAsync(Number(raffleId));
      toast.success('Draw completed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to trigger draw');
      console.error(error);
    }
  };

  return (
    <AdminGuard>
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button variant="ghost" onClick={() => navigate({ to: '/admin' })} className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold">Raffle Management</h1>
              <p className="text-muted-foreground">Create and manage raffle drawings</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Raffle
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : raffles && raffles.length > 0 ? (
            <div className="space-y-4">
              {raffles.map((raffle) => (
                <RaffleManagementCard
                  key={raffle.id.toString()}
                  raffle={raffle}
                  onEdit={() => setEditingRaffle(raffle)}
                  onStatusChange={handleStatusChange}
                  onTriggerDraw={handleTriggerDraw}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-semibold mb-2">No Raffles Yet</h3>
                <p className="text-muted-foreground mb-6">Create your first raffle to get started.</p>
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Raffle
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Raffle</DialogTitle>
            <DialogDescription>Set up a new raffle drawing</DialogDescription>
          </DialogHeader>
          <RaffleForm
            onSubmit={handleCreate}
            submitLabel="Create Raffle"
            isSubmitting={createRaffle.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingRaffle} onOpenChange={() => setEditingRaffle(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Raffle</DialogTitle>
            <DialogDescription>Update raffle details</DialogDescription>
          </DialogHeader>
          {editingRaffle && (
            <RaffleForm
              raffle={editingRaffle}
              onSubmit={handleUpdate}
              submitLabel="Update Raffle"
              isSubmitting={updateRaffle.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
}

function RaffleManagementCard({
  raffle,
  onEdit,
  onStatusChange,
  onTriggerDraw,
}: {
  raffle: Raffle;
  onEdit: () => void;
  onStatusChange: (id: bigint, status: RaffleStatus) => void;
  onTriggerDraw: (id: bigint) => void;
}) {
  const getStatusBadge = () => {
    switch (raffle.status) {
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'open':
        return <Badge className="bg-green-600 hover:bg-green-700">Open</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      case 'drawn':
        return <Badge className="bg-amber-600 hover:bg-amber-700">Completed</Badge>;
      default:
        return null;
    }
  };

  const canEdit = raffle.status !== 'drawn';
  const canDraw = raffle.status === 'open';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle>{raffle.title}</CardTitle>
            <CardDescription>{raffle.description}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Spot Price</div>
            <div className="font-medium">${(Number(raffle.spotPriceCents) / 100).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Spots</div>
            <div className="font-medium">{raffle.totalSpots.toString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Prize</div>
            <div className="font-medium">${(Number(raffle.prizeAmountCents) / 100).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Draw Date</div>
            <div className="font-medium text-xs">
              {new Date(Number(raffle.drawTimestamp) / 1_000_000).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
              <Select
                value={raffle.status}
                onValueChange={(value) => onStatusChange(raffle.id, value as RaffleStatus)}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          {canDraw && (
            <Button variant="default" size="sm" onClick={() => onTriggerDraw(raffle.id)}>
              Trigger Draw
            </Button>
          )}
          {raffle.status === 'drawn' && raffle.winner && (
            <Badge variant="outline" className="h-9 px-3">
              Winner: {raffle.winner.slice(0, 8)}...
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
