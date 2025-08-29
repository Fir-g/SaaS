import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { companyService } from '@/services/companyService';
import { BulkUploadResult } from '@/types/company';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/clerk-react';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

export function BulkUploadDialog({ open, onOpenChange, onUploadComplete }: BulkUploadDialogProps) {
  const [activeTab, setActiveTab] = useState('import');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [rowLimit, setRowLimit] = useState<number>(500);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (validTypes.includes(fileExtension)) {
        setFile(selectedFile);
        setUploadResult(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV or Excel file (.csv, .xlsx, .xls)",
          variant: "destructive"
        });
      }
    }
  };

  const handleUpload = async (type: 'import' | 'scorecard') => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const clerkToken = await getToken();
      let result: BulkUploadResult;

      // If CSV and rowLimit > 0, create a limited CSV file with only first N rows
      let fileToSend: File = file;
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      const effectiveLimit = Number.isFinite(rowLimit) && rowLimit > 0 ? rowLimit : 0;

      if (isCsv && effectiveLimit > 0) {
        try {
          const text = await file.text();
          // Normalize line breaks and split
          const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
          if (lines.length > 1) {
            const header = lines[0];
            const dataLines = lines.slice(1).filter(l => l.trim().length > 0);
            const limited = [header, ...dataLines.slice(0, effectiveLimit)].join('\n');
            const blob = new Blob([limited], { type: 'text/csv' });
            const name = file.name.replace(/\.csv$/i, '') + `_first_${effectiveLimit}.csv`;
            fileToSend = new File([blob], name, { type: 'text/csv' });
          }
        } catch (e) {
          console.warn('Failed to limit CSV rows, falling back to full file', e);
        }
      }
      
      if (type === 'import') {
        result = await companyService.bulkImportCompanies(fileToSend, undefined, clerkToken);
      } else {
        result = await companyService.bulkUpdateScoreCards(fileToSend, undefined, clerkToken);
      }

      setUploadResult(result);
      
      if (result.failedRecords === 0) {
        toast({
          title: "Upload successful",
          description: result.message,
        });
        onUploadComplete();
      } else {
        toast({
          title: "Upload completed with errors",
          description: `${result.successfulRecords} successful, ${result.failedRecords} failed`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = (type: 'import' | 'scorecard') => {
    let csvContent = '';
    
    if (type === 'import') {
      csvContent = `fteid,name,phone_number,address,mailing_address,contact_user_fteid,admin_desk_fteid,is_active,is_deleted,advance_percentage_supplier,premium_from,supplier_poc,pincode,bank_details_fteid,crm_type,tds_accepted,fleet_owner_engagement_terms_accepted,kyc_documents,supplier_score_card,supplier_score,transporter_score_card,transporter_score,created_at,updated_at,updated_by_fteid
COM-001,Sample Company,+91-9876543210,"123 Main St, City","456 Mail St, City",USR-001,DSK-001,true,false,85,Premium Supplier,John Doe,123456,BANK-001,"{SUPPLIER,TRANSPORTER}",true,true,"[{""kyc_id"":""KYC-001""}]",GOLD,85.5,SILVER,78.2,2023-01-01T00:00:00,2023-01-01T00:00:00,USR-001`;
    } else {
      csvContent = `fteid,supplier_score_card,supplier_score,transporter_score_card,transporter_score,updated_by_fteid
COM-001,GOLD,85.5,SILVER,78.2,USR-001
COM-002,PLATINUM,95.0,GOLD,88.5,USR-001`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type === 'import' ? 'companies_template' : 'scorecard_template'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetDialog = () => {
    setFile(null);
    setUploadResult(null);
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetDialog();
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import Companies</TabsTrigger>
            <TabsTrigger value="scorecard">Update Scorecards</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Import Companies</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('import')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Upload a CSV or Excel file to import companies. If a company with the same FTEID exists, it will be updated.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="row-limit">Rows to import (CSV only)</Label>
                  <Input
                    id="row-limit"
                    type="number"
                    min={0}
                    step={100}
                    value={Number.isFinite(rowLimit) ? rowLimit : 0}
                    onChange={(e) => setRowLimit(parseInt(e.target.value || '0', 10))}
                  />
                  <p className="text-xs text-muted-foreground">0 means import all rows. Applies only to CSV files.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-file">Select File</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>

              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}

              <Button
                onClick={() => handleUpload('import')}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Companies
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="scorecard" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Update Scorecards</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('scorecard')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Upload a CSV or Excel file to update supplier and transporter scorecards for existing companies.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="row-limit-score">Rows to update (CSV only)</Label>
                  <Input
                    id="row-limit-score"
                    type="number"
                    min={0}
                    step={100}
                    value={Number.isFinite(rowLimit) ? rowLimit : 0}
                    onChange={(e) => setRowLimit(parseInt(e.target.value || '0', 10))}
                  />
                  <p className="text-xs text-muted-foreground">0 means update all rows. Applies only to CSV files.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scorecard-file">Select File</Label>
                <Input
                  id="scorecard-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>

              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}

              <Button
                onClick={() => handleUpload('scorecard')}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Update Scorecards
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {uploading && (
          <div className="space-y-2">
            <Progress value={50} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">Processing file...</p>
          </div>
        )}

        {uploadResult && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              {uploadResult.failedRecords === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <h4 className="font-medium">Upload Results</h4>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{uploadResult.totalRecords}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{uploadResult.successfulRecords}</div>
                <div className="text-muted-foreground">Success</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{uploadResult.failedRecords}</div>
                <div className="text-muted-foreground">Failed</div>
              </div>
            </div>

            {uploadResult.warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Warnings:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {uploadResult.warnings.slice(0, 5).map((warning, index) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                    {uploadResult.warnings.length > 5 && (
                      <li className="text-sm text-muted-foreground">
                        ...and {uploadResult.warnings.length - 5} more warnings
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {uploadResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Errors:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {uploadResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <li className="text-sm text-muted-foreground">
                        ...and {uploadResult.errors.length - 5} more errors
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
