import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface UpdateStatusModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (status: string, availabilityDates?: Date[]) => Promise<void>;
  item: any;
}

const STATUS_OPTIONS = [
  'Vehicle Available',
  'Vehicle Not Available',
  'Call Not Picked',
  'Did Not Call',
  'Vehicle Placed',
  'Inventory Cancelled'
];

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  open,
  onClose,
  onUpdate,
  item
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [availabilityDates, setAvailabilityDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!selectedStatus) return;
    
    setLoading(true);
    try {
      let datesToSend: Date[] | undefined;
      if (selectedStatus === 'Vehicle Available' && availabilityDates.length > 0) {
        datesToSend = availabilityDates;
      }
      
      await onUpdate(selectedStatus, datesToSend);
      
      // Clear all form values after successful update
      setSelectedStatus('');
      setAvailabilityDates([]);
      
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    setAvailabilityDates([]);
    onClose();
  };

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) return;
    setAvailabilityDates(dates);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold">FOApp</DialogTitle>
          <p className="text-sm text-muted-foreground">• Chennai, Tamil Nadu, India</p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Select Status Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Status</Label>
            <div className="grid grid-cols-1 gap-2">
              {STATUS_OPTIONS.map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  className={cn(
                    "justify-between h-auto py-3 px-4",
                    selectedStatus === status && "bg-orange-500 text-white border-orange-500"
                  )}
                  onClick={() => setSelectedStatus(status)}
                >
                  <span>{status}</span>
                  {selectedStatus === status && <Check className="w-4 h-4" />}
                </Button>
              ))}
            </div>
          </div>

          {/* Availability Date Section - Only show for Vehicle Available */}
          {selectedStatus === 'Vehicle Available' && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Availability Dates</Label>
              
              {/* Selected Dates Display */}
              {availabilityDates.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 max-h-32 overflow-y-auto">
                  {availabilityDates.map((date, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                      {format(date, "dd/MM/yyyy")}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setAvailabilityDates(prev => prev.filter(d => d !== date))}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {availabilityDates.length > 0 
                      ? `${availabilityDates.length} date(s) selected` 
                      : "Select availability dates"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="multiple"
                    selected={availabilityDates}
                    onSelect={handleDateSelect}
                    initialFocus
                    classNames={{
                      day_today: "bg-gray-100 text-gray-600 font-normal border border-gray-300"
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate} 
            disabled={!selectedStatus || loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 