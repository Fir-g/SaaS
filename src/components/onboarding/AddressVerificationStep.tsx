import React, { useState } from 'react';
import { FileText, Upload, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface AddressVerificationData {
  documentType: 'AADHAR' | 'PASSPORT' | 'DRIVING_LICENSE';
  documentNumber: string;
  frontImage: File | null;
  backImage: File | null;
  verified: boolean;
  approved: boolean;
  rejected: boolean;
  ocrOutput?: {
    extractedDocumentNumber?: string;
    extractedName?: string;
    extractedAddress?: string;
    extractedDateOfBirth?: string;
    confidence?: number;
  };
}

interface AddressVerificationStepProps {
  data: AddressVerificationData;
  onUpdate: (data: Partial<AddressVerificationData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const AddressVerificationStep: React.FC<AddressVerificationStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrev,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (file: File, type: 'front' | 'back') => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    if (type === 'front') {
      onUpdate({ frontImage: file });
    } else {
      onUpdate({ backImage: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.documentNumber && !data.frontImage) {
      toast({
        title: "Validation Error",
        description: "Please provide either document number or upload document images.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate Idfy document OCR API call
    setTimeout(() => {
      // Mock OCR result
      const mockOcrResult = {
        documentNumber: data.documentNumber,
        name: "JOHN DOE",
        address: "123 Main Street, City, State - 123456",
        dateOfBirth: "01/01/1990"
      };
      
      onUpdate({ verified: true });
      toast({
        title: "Address Document Verified",
        description: `${data.documentType} verified successfully. Address: ${mockOcrResult.address}`,
      });
      setLoading(false);
      onNext();
    }, 3000);
  };

  const approve = () => {
    onUpdate({ approved: true, rejected: false });
    toast({
      title: "Address Verification Approved",
      description: "Address verification has been approved by admin.",
    });
  };

  const reject = () => {
    onUpdate({ rejected: true, approved: false });
    toast({
      title: "Address Verification Rejected",
      description: "Address verification has been rejected. Please review and resubmit.",
      variant: "destructive",
    });
  };

  const getDocumentLabel = () => {
    switch (data.documentType) {
      case 'AADHAR': return 'Aadhar Card';
      case 'PASSPORT': return 'Passport';
      case 'DRIVING_LICENSE': return 'Driving License';
      default: return 'Document';
    }
  };

  const needsBackImage = data.documentType === 'AADHAR';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Address Verification</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload address proof document for verification using Idfy OCR
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
              {data.ocrOutput.extractedDocumentNumber && (
                <div><span className="font-medium">Document Number:</span> {data.ocrOutput.extractedDocumentNumber}</div>
              )}
              {data.ocrOutput.extractedName && (
                <div><span className="font-medium">Name:</span> {data.ocrOutput.extractedName}</div>
              )}
              {data.ocrOutput.extractedAddress && (
                <div><span className="font-medium">Address:</span> {data.ocrOutput.extractedAddress}</div>
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
          You can either enter document details manually OR upload document images (not both required)
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select
                value={data.documentType}
                onValueChange={(value) => onUpdate({ documentType: value as AddressVerificationData['documentType'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AADHAR">Aadhar Card</SelectItem>
                  <SelectItem value="PASSPORT">Passport</SelectItem>
                  <SelectItem value="DRIVING_LICENSE">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">Document Number *</Label>
              <Input
                id="documentNumber"
                value={data.documentNumber}
                onChange={(e) => onUpdate({ documentNumber: e.target.value })}
                placeholder={`Enter ${getDocumentLabel().toLowerCase()} number`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Front Image */}
            <div className="space-y-2">
              <Label>Front Side *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <div className="mt-2">
                    <label htmlFor="frontImage" className="cursor-pointer">
                      <span className="text-sm font-medium">
                        {data.frontImage ? data.frontImage.name : `Upload Front Side`}
                      </span>
                    </label>
                    <input
                      id="frontImage"
                      type="file"
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'front');
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => document.getElementById('frontImage')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>
            </div>

            {/* Back Image - only for Aadhar */}
            {needsBackImage && (
              <div className="space-y-2">
                <Label>Back Side *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <div className="mt-2">
                      <label htmlFor="backImage" className="cursor-pointer">
                        <span className="text-sm font-medium">
                          {data.backImage ? data.backImage.name : `Upload Back Side`}
                        </span>
                      </label>
                      <input
                        id="backImage"
                        type="file"
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'back');
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => document.getElementById('backImage')?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

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