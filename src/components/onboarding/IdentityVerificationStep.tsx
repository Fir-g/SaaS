import React, { useState } from 'react';
import { Shield, Upload, Check, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface IdentityVerificationData {
  panNumber: string;
  panCard: File | null;
  verified: boolean;
  approved: boolean;
  rejected: boolean;
  ocrOutput?: {
    extractedPAN?: string;
    extractedName?: string;
    extractedFatherName?: string;
    extractedDateOfBirth?: string;
    confidence?: number;
  };
}

interface IdentityVerificationStepProps {
  data: IdentityVerificationData;
  onUpdate: (data: Partial<IdentityVerificationData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const IdentityVerificationStep: React.FC<IdentityVerificationStepProps> = ({
  data,
  onUpdate,
  onNext,
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
    
    onUpdate({ panCard: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.panNumber && !data.panCard) {
      toast({
        title: "Validation Error",
        description: "Please provide either PAN number or upload PAN card.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate Idfy PAN OCR API call
    setTimeout(() => {
      // Mock OCR result
      const mockOcrResult = {
        panNumber: "ABCDE1234F",
        name: "JOHN DOE",
        fatherName: "FATHER NAME",
        dateOfBirth: "01/01/1990"
      };
      
      onUpdate({ verified: true });
      toast({
        title: "PAN Card Verified",
        description: `PAN verified successfully. Details: ${mockOcrResult.name}, PAN: ${mockOcrResult.panNumber}`,
      });
      setLoading(false);
      onNext();
    }, 3000);
  };

  const approve = () => {
    onUpdate({ approved: true, rejected: false });
    toast({
      title: "Identity Verification Approved",
      description: "Identity verification has been approved by admin.",
    });
  };

  const reject = () => {
    onUpdate({ rejected: true, approved: false });
    toast({
      title: "Identity Verification Rejected",
      description: "Identity verification has been rejected. Please review and resubmit.",
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Identity Verification</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload PAN card for identity verification using Idfy OCR
              </p>
            </div>
          </div>
          {data.verified && (
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Verified</span>
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
        {data.ocrOutput && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">IDFY OCR Extracted Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {data.ocrOutput.extractedPAN && (
                <div><span className="font-medium">PAN:</span> {data.ocrOutput.extractedPAN}</div>
              )}
              {data.ocrOutput.extractedName && (
                <div><span className="font-medium">Name:</span> {data.ocrOutput.extractedName}</div>
              )}
              {data.ocrOutput.extractedFatherName && (
                <div><span className="font-medium">Father's Name:</span> {data.ocrOutput.extractedFatherName}</div>
              )}
              {data.ocrOutput.extractedDateOfBirth && (
                <div><span className="font-medium">Date of Birth:</span> {data.ocrOutput.extractedDateOfBirth}</div>
              )}
              {data.ocrOutput.confidence && (
                <div><span className="font-medium">Confidence:</span> {Math.round(data.ocrOutput.confidence * 100)}%</div>
              )}
            </div>
          </div>
        )}
        <p className="text-sm text-muted-foreground mb-4">
          You can either enter PAN manually OR upload PAN card image (not both required)
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="panNumber">PAN Number *</Label>
            <Input
              id="panNumber"
              value={data.panNumber}
              onChange={(e) => onUpdate({ panNumber: e.target.value.toUpperCase() })}
              placeholder="ABCDE1234F"
              pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
              maxLength={10}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>PAN Card Upload *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <label htmlFor="panCard" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {data.panCard ? data.panCard.name : 'Upload PAN Card'}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      PNG, JPG, PDF up to 5MB
                    </span>
                  </label>
                  <input
                    id="panCard"
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
                  onClick={() => document.getElementById('panCard')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
          </div>

          {data.panCard && (
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{data.panCard.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(data.panCard.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrev}>
              Previous
            </Button>
            <Button type="submit" disabled={loading || data.verified}>
              {loading ? 'Verifying with Idfy...' : data.verified ? 'Verified' : 'Verify & Continue'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};