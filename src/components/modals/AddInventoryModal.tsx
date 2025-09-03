import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddInventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fleetOwner: '',
    vehicleNo: '',
    vehicleType: '',
    origin: '',
    destination: '',
    capacity: '',
    rate: '',
    availableDate: '',
    contactNumber: '',
    remarks: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call
    try {
      // Mock submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Inventory Added Successfully",
        description: `Vehicle ${formData.vehicleNo} has been added to inventory.`,
      });
      
      // Reset form
      setFormData({
        fleetOwner: '',
        vehicleNo: '',
        vehicleType: '',
        origin: '',
        destination: '',
        capacity: '',
        rate: '',
        availableDate: '',
        contactNumber: '',
        remarks: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add inventory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Manual Inventory</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fleetOwner">Fleet Owner *</Label>
              <Input
                id="fleetOwner"
                value={formData.fleetOwner}
                onChange={(e) => handleInputChange('fleetOwner', e.target.value)}
                placeholder="Enter fleet owner name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicleNo">Vehicle Number *</Label>
              <Input
                id="vehicleNo"
                value={formData.vehicleNo}
                onChange={(e) => handleInputChange('vehicleNo', e.target.value)}
                placeholder="e.g., MH12AB1234"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type *</Label>
              <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange('vehicleType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck-32ft">Truck 32FT</SelectItem>
                  <SelectItem value="truck-20ft">Truck 20FT</SelectItem>
                  <SelectItem value="truck-14ft">Truck 14FT</SelectItem>
                  <SelectItem value="truck-19ft">Truck 19FT</SelectItem>
                  <SelectItem value="trailer">Trailer</SelectItem>
                  <SelectItem value="container">Container</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (in tons)</Label>
              <Input
                id="capacity"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="e.g., 15"
                type="number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin *</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                placeholder="Enter origin city"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="Enter destination city"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate">Rate (per km)</Label>
              <Input
                id="rate"
                value={formData.rate}
                onChange={(e) => handleInputChange('rate', e.target.value)}
                placeholder="e.g., 25"
                type="number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="availableDate">Available Date</Label>
              <Input
                id="availableDate"
                value={formData.availableDate}
                onChange={(e) => handleInputChange('availableDate', e.target.value)}
                type="date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              placeholder="Enter contact number"
              type="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Input
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Any additional notes"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Inventory
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};