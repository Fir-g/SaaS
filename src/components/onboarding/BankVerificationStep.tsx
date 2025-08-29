import React, { useState } from 'react';
import { CreditCard, Upload, Check, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface BankVerificationData {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  chequeImage: File | null;
  pennyDropVerified: boolean;
  verified: boolean;
  approved: boolean;
  rejected: boolean;
  ocrOutput?: {
    extractedAccountNumber?: string;
    extractedIFSC?: string;
    extractedBankName?: string;
    confidence?: number;
  };
}

interface BankVerificationStepProps {
  data: BankVerificationData;
  onUpdate: (data: Partial<BankVerificationData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const BankVerificationStep: React.FC<BankVerificationStepProps> = ({
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
    
    onUpdate({ chequeImage: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.accountNumber || !data.ifscCode || !data.bankName || !data.chequeImage) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields and upload cancelled cheque.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate Idfy cheque OCR and penny drop API call
    setTimeout(() => {
      // Mock OCR and penny drop result
      const mockResult = {
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        bankName: "HDFC BANK",
        accountHolderName: "JOHN DOE",
        pennyDropStatus: "SUCCESS",
        amount: "1.00"
      };
      
      onUpdate({ 
        verified: true, 
        pennyDropVerified: true,
        bankName: mockResult.bankName 
      });
      
      toast({
        title: "Bank Account Verified",
        description: `Account verified successfully. Penny drop of ₹${mockResult.amount} completed.`,
      });
      setLoading(false);
      onNext();
    }, 4000);
  };

  const approve = () => {
    onUpdate({ approved: true, rejected: false });
    toast({
      title: "Bank Verification Approved",
      description: "Bank verification has been approved by admin.",
    });
  };

  const reject = () => {
    onUpdate({ rejected: true, approved: false });
    toast({
      title: "Bank Verification Rejected",
      description: "Bank verification has been rejected. Please review and resubmit.",
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Bank Account Verification</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload cancelled cheque for bank verification using Idfy OCR & Penny Drop
              </p>
            </div>
          </div>
          {data.verified && (
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Verified</span>
              {data.pennyDropVerified && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  Penny Drop ✓
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
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={data.accountNumber}
                onChange={(e) => onUpdate({ accountNumber: e.target.value })}
                placeholder="Enter account number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code *</Label>
              <Input
                id="ifscCode"
                value={data.ifscCode}
                onChange={(e) => onUpdate({ ifscCode: e.target.value.toUpperCase() })}
                placeholder="HDFC0000123"
                pattern="[A-Z]{4}0[A-Z0-9]{6}"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input
              id="bankName"
              value={data.bankName}
              onChange={(e) => onUpdate({ bankName: e.target.value })}
              placeholder="Enter bank name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Cancelled Cheque Upload *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <label htmlFor="chequeImage" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {data.chequeImage ? data.chequeImage.name : 'Upload Cancelled Cheque'}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      PNG, JPG, PDF up to 5MB
                    </span>
                  </label>
                  <input
                    id="chequeImage"
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
                  onClick={() => document.getElementById('chequeImage')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
          </div>

          {data.chequeImage && (
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{data.chequeImage.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(data.chequeImage.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 mt-0.5">ℹ️</div>
              <div className="text-sm text-blue-700">
                <strong>Note:</strong> We will perform OCR on your cheque to extract bank details and 
                conduct a penny drop verification (₹1 will be deposited and immediately refunded) 
                to confirm your account details.
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrev}>
              Previous
            </Button>
            <Button type="submit" disabled={loading || data.verified}>
              {loading ? 'Verifying with Idfy & Penny Drop...' : data.verified ? 'Verified' : 'Verify & Continue'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};