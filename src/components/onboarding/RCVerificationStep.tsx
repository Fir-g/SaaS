import React, { useState } from 'react';
import { Car, Upload, Check, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface RCVerificationData {
  vehicleNumber: string;
  rcNumber: string;
  rcDocument: File | null;
  parivahanVerified: boolean;
  verified: boolean;
  approved: boolean;
  rejected: boolean;
  ocrOutput?: {
    extractedVehicleNumber?: string;
    extractedRCNumber?: string;
    extractedOwnerName?: string;
    confidence?: number;
  };
}

interface RCVerificationStepProps {
  data: RCVerificationData;
  onUpdate: (data: Partial<RCVerificationData>) => void;
  onPrev: () => void;
}

export const RCVerificationStep: React.FC<RCVerificationStepProps> = ({
  data,
  onUpdate,
  onPrev,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    onUpdate({ rcDocument: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.vehicleNumber || !data.rcNumber || !data.rcDocument) {
      toast({
        title: "Validation Error",
        description: "Please provide vehicle number, RC number and upload RC document.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate Parivahan API call
    setTimeout(() => {
      // Mock Parivahan verification result
      const mockResult = {
        vehicleNumber: data.vehicleNumber,
        rcNumber: data.rcNumber,
        ownerName: "JOHN DOE",
        vehicleClass: "LIGHT MOTOR VEHICLE",
        fuelType: "PETROL",
        manufacturingDate: "2020-01-01",
        registrationDate: "2020-02-01",
        status: "ACTIVE"
      };
      
      onUpdate({ 
        verified: true, 
        parivahanVerified: true 
      });
      
      toast({
        title: "RC Verification Completed",
        description: `Vehicle verified successfully via Parivahan. Owner: ${mockResult.ownerName}`,
      });
      setLoading(false);
    }, 3000);
  };

  const approve = () => {
    onUpdate({ approved: true, rejected: false });
    toast({
      title: "RC Verification Approved",
      description: "RC verification has been approved by admin.",
    });
  };

  const reject = () => {
    onUpdate({ rejected: true, approved: false });
    toast({
      title: "RC Verification Rejected",
      description: "RC verification has been rejected. Please review and resubmit.",
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Car className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>RC Verification</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload RC document for vehicle verification using Parivahan check
              </p>
            </div>
          </div>
          {data.verified && (
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Verified</span>
              {data.parivahanVerified && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  Parivahan ✓
                </span>
              )}
              {!data.approved && !data.rejected && (
                <div className="flex space-x-2">
                  <Button size="sm" onClick={approve} variant="default">
                    Approve
                  </Button>
                  <Button size="sm" onClick={reject} variant="destructive">
                    Reject
                  </Button>
                </div>
              )}
              {data.approved && (
                <span className="text-sm text-green-600 font-medium">Approved</span>
              )}
              {data.rejected && (
                <span className="text-sm text-red-600 font-medium">Rejected</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
              <Input
                id="vehicleNumber"
                value={data.vehicleNumber}
                onChange={(e) => onUpdate({ vehicleNumber: e.target.value.toUpperCase() })}
                placeholder="DL01AB1234"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rcNumber">RC Number *</Label>
              <Input
                id="rcNumber"
                value={data.rcNumber}
                onChange={(e) => onUpdate({ rcNumber: e.target.value })}
                placeholder="Enter RC number"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>RC Document Upload *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <label htmlFor="rcDocument" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {data.rcDocument ? data.rcDocument.name : 'Upload RC Document'}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      PNG, JPG, PDF up to 5MB
                    </span>
                  </label>
                  <input
                    id="rcDocument"
                    type="file"
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById('rcDocument')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
          </div>

          {data.rcDocument && (
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{data.rcDocument.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(data.rcDocument.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 mt-0.5">ℹ️</div>
              <div className="text-sm text-blue-700">
                <strong>Note:</strong> We will verify your vehicle details against the official 
                Parivahan database to ensure the RC document is authentic and the vehicle 
                is registered legally.
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrev}>
              Previous
            </Button>
            <Button type="submit" disabled={loading || data.verified}>
              {loading ? 'Verifying with Parivahan...' : data.verified ? 'Verified' : 'Complete Verification'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};