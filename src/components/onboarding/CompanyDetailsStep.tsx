import React, { useState } from 'react';
import { Building, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface CompanyDetailsData {
  name: string;
  address: string;
  pincode: string;
  companyType: 'INDIVIDUAL' | 'PROPRIETORSHIP' | 'PRIVATE_LIMITED';
  tags: ('DEMAND' | 'SUPPLY' | 'DEMAND_SUPPLY')[];
  verified: boolean;
  approved: boolean;
  rejected: boolean;
  ocrOutput?: {
    extractedName?: string;
    extractedAddress?: string;
    extractedPincode?: string;
    confidence?: number;
  };
}

interface CompanyDetailsStepProps {
  data: CompanyDetailsData;
  onUpdate: (data: Partial<CompanyDetailsData>) => void;
  onNext: () => void;
}

export const CompanyDetailsStep: React.FC<CompanyDetailsStepProps> = ({
  data,
  onUpdate,
  onNext,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.name || !data.address || !data.pincode || data.tags.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields and select at least one tag.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call for verification
    setTimeout(() => {
      onUpdate({ verified: true });
      toast({
        title: "Company Details Verified",
        description: "Company details have been successfully verified.",
      });
      setLoading(false);
      onNext();
    }, 2000);
  };

  const handleTagChange = (tag: 'DEMAND' | 'SUPPLY' | 'DEMAND_SUPPLY', checked: boolean) => {
    let newTags = [...data.tags];
    
    if (checked) {
      newTags.push(tag);
    } else {
      newTags = newTags.filter(t => t !== tag);
    }
    
    onUpdate({ tags: newTags });
  };

  const approve = () => {
    onUpdate({ approved: true, rejected: false });
    toast({
      title: "Company Details Approved",
      description: "Company details have been approved by admin.",
    });
  };

  const reject = () => {
    onUpdate({ rejected: true, approved: false });
    toast({
      title: "Company Details Rejected",
      description: "Company details have been rejected. Please review and resubmit.",
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Company Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Provide basic company information and business type
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
            <h4 className="font-medium text-blue-900 mb-2">OCR Extracted Data from Mobile App</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {data.ocrOutput.extractedName && (
                <div><span className="font-medium">Name:</span> {data.ocrOutput.extractedName}</div>
              )}
              {data.ocrOutput.extractedAddress && (
                <div><span className="font-medium">Address:</span> {data.ocrOutput.extractedAddress}</div>
              )}
              {data.ocrOutput.extractedPincode && (
                <div><span className="font-medium">Pincode:</span> {data.ocrOutput.extractedPincode}</div>
              )}
              {data.ocrOutput.confidence && (
                <div><span className="font-medium">Confidence:</span> {Math.round(data.ocrOutput.confidence * 100)}%</div>
              )}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={data.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={data.pincode}
                onChange={(e) => onUpdate({ pincode: e.target.value })}
                placeholder="Enter pincode"
                pattern="[0-9]{6}"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={data.address}
              onChange={(e) => onUpdate({ address: e.target.value })}
              placeholder="Enter complete address"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Company Type *</Label>
            <RadioGroup
              value={data.companyType}
              onValueChange={(value) => onUpdate({ companyType: value as CompanyDetailsData['companyType'] })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="INDIVIDUAL" id="individual" />
                <Label htmlFor="individual">Individual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PROPRIETORSHIP" id="proprietorship" />
                <Label htmlFor="proprietorship">Proprietorship</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PRIVATE_LIMITED" id="private_limited" />
                <Label htmlFor="private_limited">Private Limited</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Business Type Tags *</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="demand"
                  checked={data.tags.includes('DEMAND')}
                  onCheckedChange={(checked) => handleTagChange('DEMAND', checked as boolean)}
                />
                <Label htmlFor="demand">Demand (Customer - needs transportation services)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="supply"
                  checked={data.tags.includes('SUPPLY')}
                  onCheckedChange={(checked) => handleTagChange('SUPPLY', checked as boolean)}
                />
                <Label htmlFor="supply">Supply (Supplier - provides transportation services)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="demand_supply"
                  checked={data.tags.includes('DEMAND_SUPPLY')}
                  onCheckedChange={(checked) => handleTagChange('DEMAND_SUPPLY', checked as boolean)}
                />
                <Label htmlFor="demand_supply">Both Demand & Supply</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={loading || data.verified}>
              {loading ? 'Verifying...' : data.verified ? 'Verified' : 'Verify & Continue'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};