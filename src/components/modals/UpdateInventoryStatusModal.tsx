import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

interface InventoryItem {
  id: string;
  tripId: string;
  fleetOwner: string;
  vehicleType: string;
  destination: string;
  status: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onUpdate: (id: string, status: string, date?: string) => void;
}

const statusOptions = [
  'Vehicle Available',
  'Vehicle Not Available',
  'Call Not Picked',
  'Did Not Call',
  'Vehicle Placed',
  'Inventory Cancelled',
];

export const UpdateInventoryStatusModal: React.FC<Props> = ({ open, onClose, item, onUpdate }) => {
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    setStatus(item?.status || '');
    setDate('');
  }, [item]);

  const handleUpdate = () => {
    if (item && status) {
      onUpdate(item.tripId, status, date);
      onClose();
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold">{item.fleetOwner}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {item.vehicleType} • {item.destination}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Status</Label>
            <div className="space-y-3">
              {statusOptions.map(opt => (
                <Button
                  key={opt}
                  variant={status === opt ? "default" : "outline"}
                  className={`w-full justify-between h-auto p-4 ${
                    status === opt 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setStatus(opt)}
                >
                  <span>{opt}</span>
                  {status === opt && <Check className="h-4 w-4" />}
                </Button>
              ))}
            </div>
          </div>

          {status === 'Vehicle Available' && (
            <div className="space-y-2">
              <Label htmlFor="availability-date">Availability Date</Label>
              <Input
                id="availability-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!status || (status === 'Vehicle Available' && !date)}
          >
            Update Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};