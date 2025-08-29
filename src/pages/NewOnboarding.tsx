import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Upload, Building, Shield, CreditCard, FileText, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CompanyDetailsStep } from '@/components/onboarding/CompanyDetailsStep';
import { IdentityVerificationStep } from '@/components/onboarding/IdentityVerificationStep';
import { AddressVerificationStep } from '@/components/onboarding/AddressVerificationStep';
import { BankVerificationStep } from '@/components/onboarding/BankVerificationStep';
import { RCVerificationStep } from '@/components/onboarding/RCVerificationStep';

export interface OnboardingData {
  companyDetails: {
    name: string;
    address: string;
    pincode: string;
    companyType: 'INDIVIDUAL' | 'PROPRIETORSHIP' | 'PRIVATE_LIMITED';
    tags: ('DEMAND' | 'SUPPLY' | 'DEMAND_SUPPLY')[];
    verified: boolean;
    approved: boolean;
    rejected: boolean;
  };
  identityVerification: {
    panNumber: string;
    panCard: File | null;
    verified: boolean;
    approved: boolean;
    rejected: boolean;
  };
  addressVerification: {
    documentType: 'AADHAR' | 'PASSPORT' | 'DRIVING_LICENSE';
    documentNumber: string;
    frontImage: File | null;
    backImage: File | null;
    verified: boolean;
    approved: boolean;
    rejected: boolean;
  };
  bankVerification: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    chequeImage: File | null;
    pennyDropVerified: boolean;
    verified: boolean;
    approved: boolean;
    rejected: boolean;
  };
  rcVerification: {
    vehicleNumber: string;
    rcNumber: string;
    rcDocument: File | null;
    parivahanVerified: boolean;
    verified: boolean;
    approved: boolean;
    rejected: boolean;
  };
}

const steps = [
  { id: 1, title: 'Company Details', icon: Building },
  { id: 2, title: 'Identity Verification', icon: Shield },
  { id: 3, title: 'Address Verification', icon: FileText },
  { id: 4, title: 'Bank Verification', icon: CreditCard },
  { id: 5, title: 'RC Verification', icon: Car },
];

const NewOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companyDetails: {
      name: '',
      address: '',
      pincode: '',
      companyType: 'INDIVIDUAL',
      tags: [],
      verified: false,
      approved: false,
      rejected: false,
    },
    identityVerification: {
      panNumber: '',
      panCard: null,
      verified: false,
      approved: false,
      rejected: false,
    },
    addressVerification: {
      documentType: 'AADHAR',
      documentNumber: '',
      frontImage: null,
      backImage: null,
      verified: false,
      approved: false,
      rejected: false,
    },
    bankVerification: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      chequeImage: null,
      pennyDropVerified: false,
      verified: false,
      approved: false,
      rejected: false,
    },
    rcVerification: {
      vehicleNumber: '',
      rcNumber: '',
      rcDocument: null,
      parivahanVerified: false,
      verified: false,
      approved: false,
      rejected: false,
    },
  });

  const updateOnboardingData = (step: keyof OnboardingData, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  };

  const getStepStatus = (stepId: number) => {
    const stepKey = Object.keys(onboardingData)[stepId - 1] as keyof OnboardingData;
    const stepData = onboardingData[stepKey];
    
    if (stepData.approved) return 'approved';
    if (stepData.verified) return 'verified';
    if (currentStep > stepId) return 'completed';
    if (currentStep === stepId) return 'current';
    return 'pending';
  };

  const getStepIcon = (step: typeof steps[0], status: string) => {
    const Icon = step.icon;
    
    if (status === 'approved') {
      return <Check className="w-5 h-5 text-green-600" />;
    }
    
    return <Icon className={`w-5 h-5 ${
      status === 'current' ? 'text-primary' : 
      status === 'completed' || status === 'verified' ? 'text-green-600' : 
      'text-muted-foreground'
    }`} />;
  };

  const getProgressValue = () => {
    const completedSteps = Object.values(onboardingData).filter(step => step.verified || step.approved).length;
    return (completedSteps / 5) * 100;
  };

  const isAllStepsVerified = () => {
    return Object.values(onboardingData).every(step => step.verified || step.approved);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanyDetailsStep
            data={onboardingData.companyDetails}
            onUpdate={(data) => updateOnboardingData('companyDetails', data)}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <IdentityVerificationStep
            data={onboardingData.identityVerification}
            onUpdate={(data) => updateOnboardingData('identityVerification', data)}
            onNext={() => setCurrentStep(3)}
            onPrev={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <AddressVerificationStep
            data={onboardingData.addressVerification}
            onUpdate={(data) => updateOnboardingData('addressVerification', data)}
            onNext={() => setCurrentStep(4)}
            onPrev={() => setCurrentStep(2)}
          />
        );
      case 4:
        return (
          <BankVerificationStep
            data={onboardingData.bankVerification}
            onUpdate={(data) => updateOnboardingData('bankVerification', data)}
            onNext={() => setCurrentStep(5)}
            onPrev={() => setCurrentStep(3)}
          />
        );
      case 5:
        return (
          <RCVerificationStep
            data={onboardingData.rcVerification}
            onUpdate={(data) => updateOnboardingData('rcVerification', data)}
            onPrev={() => setCurrentStep(4)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customer-supply')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Customer & Supply</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">New Customer Onboarding</h1>
                <p className="text-muted-foreground">Complete KYC verification process</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-lg font-semibold">{Math.round(getProgressValue())}%</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={getProgressValue()} className="w-full" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KYC Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {steps.map((step) => {
                  const status = getStepStatus(step.id);
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        status === 'current'
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        status === 'approved' ? 'bg-green-100 text-green-600' :
                        status === 'verified' || status === 'completed' ? 'bg-green-100 text-green-600' :
                        status === 'current' ? 'bg-primary/10 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {getStepIcon(step, status)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{step.title}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={
                              status === 'approved' ? 'default' :
                              status === 'verified' ? 'secondary' :
                              status === 'completed' ? 'outline' :
                              'outline'
                            }
                            className="text-xs"
                          >
                            {status === 'approved' ? 'Approved' :
                             status === 'verified' ? 'Verified' :
                             status === 'completed' ? 'Completed' :
                             status === 'current' ? 'Current' :
                             'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {isAllStepsVerified() && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-700">All steps completed!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Ready for final approval
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOnboarding;