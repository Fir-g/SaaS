import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

interface CallConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fleetOwnerName: string;
  foNumber: string;
}

export const CallConfirmationModal: React.FC<CallConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  fleetOwnerName,
  foNumber
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Confirm Call
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              Are you sure you want to call
            </p>
            <p className="text-xl font-bold text-primary mb-1">
              {fleetOwnerName}
            </p>
            <p className="text-sm text-muted-foreground">
              {foNumber}
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Yes, Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 