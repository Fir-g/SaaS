import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateSpreadsheet, extractSpreadsheetId, isValidGoogleSheetsUrl } from '@/services/googleSheetsService';

interface AddSpreadsheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (spreadsheetId: string) => void;
  token?: string | null;
  existingUrl?: string;
  mode?: 'add' | 'update';
}

export const AddSpreadsheetModal: React.FC<AddSpreadsheetModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  token,
  existingUrl = '',
  mode = 'add'
}) => {
  const [url, setUrl] = useState(existingUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setUrl(existingUrl);
      setError(null);
    }
  }, [open, existingUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('Please enter a Google Sheets URL');
      return;
    }

    if (!isValidGoogleSheetsUrl(url.trim())) {
      setError('Please enter a valid Google Sheets URL');
      return;
    }

    const spreadsheetId = extractSpreadsheetId(url.trim());
    if (!spreadsheetId) {
      setError('Could not extract spreadsheet ID from URL');
      return;
    }

    setLoading(true);
    try {
      const response = await updateSpreadsheet(
        {
          tenant: 'FT',
          spreadsheet_id: url.trim()
        },
        token
      );

      toast({
        title: mode === 'add' ? 'Spreadsheet Connected' : 'Spreadsheet Updated',
        description: `Successfully ${mode === 'add' ? 'connected to' : 'updated'} Google Sheets`,
      });

      onSuccess(response.spreadsheet_id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating spreadsheet:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to spreadsheet');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setUrl(existingUrl);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            {mode === 'add' ? 'Connect Google Sheets' : 'Update Spreadsheet'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Enter your Google Sheets URL to connect and view your data'
              : 'Update the Google Sheets URL for your integration'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spreadsheet-url">Google Sheets URL</Label>
            <Input
              id="spreadsheet-url"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              disabled={loading}
              className="w-full"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">How to get your Google Sheets URL:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Open your Google Sheets document</li>
                  <li>Click the "Share" button in the top right</li>
                  <li>Set sharing to "Anyone with the link can view"</li>
                  <li>Copy the link and paste it above</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !url.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'add' ? 'Connecting...' : 'Updating...'}
                </>
              ) : (
                mode === 'add' ? 'Connect' : 'Update'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};