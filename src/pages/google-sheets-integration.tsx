import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import PageWrapper from "@/components/ui/page-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  FileSpreadsheet,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AddSpreadsheetModal } from "@/components/google-sheets/AddSpreadsheetModal";
import { SpreadsheetViewer } from "@/components/google-sheets/SpreadsheetViewer";
import {
  getSpreadsheet,
  SpreadsheetResponse,
} from "@/services/googleSheetsService";
import { useToast } from "@/hooks/use-toast";

const GoogleSheetsIntegrationPage: React.FC = () => {
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spreadsheetData, setSpreadsheetData] =
    useState<SpreadsheetResponse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const getClerkBearer = useCallback(async () => {
    return getToken({ skipCache: true });
  }, [getToken]);

  // Fetch token once on mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const t = await getClerkBearer();
        setToken(t);
      } catch (e) {
        console.error("Error fetching token:", e);
      }
    };
    fetchToken();
  }, [getClerkBearer]);

  // Check for existing spreadsheet
  useEffect(() => {
    if (token) {
      checkExistingSpreadsheet(token);
    }
  }, [token]);

  const checkExistingSpreadsheet = async (authToken: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSpreadsheet("FT", authToken);
      setSpreadsheetData(response);
    } catch (e: any) {
      console.error("Error checking spreadsheet:", e);
      setError(e?.message || "Failed to check spreadsheet connection");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectClick = () => setShowAddModal(true);

  const handleConnectionSuccess = () => {
    if (token) {
      checkExistingSpreadsheet(token);
    }
  };

  const handleUpdateSpreadsheet = () => {
    if (token) {
      checkExistingSpreadsheet(token);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col w-full h-screen py-4 px-4 sm:px-12 pt-20">
        <PageWrapper
          header="Google Sheets Integration"
          description="Connect your Google Sheets to receive and process data demands"
        >
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              Checking Google Sheets connection...
            </p>
          </div>
        </PageWrapper>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col w-full h-screen py-4 px-4 sm:px-12 pt-20">
        <PageWrapper
          header="Google Sheets Integration"
          description="Connect your Google Sheets to receive and process data demands"
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Connection Error
              </h3>
              <p className="text-sm text-red-600 text-center mb-4 max-w-md">
                {error}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => token && checkExistingSpreadsheet(token)}
                >
                  Try Again
                </Button>
                <Button onClick={handleConnectClick}>Connect Spreadsheet</Button>
              </div>
            </CardContent>
          </Card>
        </PageWrapper>
      </div>
    );
  }

  // Connected state - show spreadsheet viewer
  if (spreadsheetData?.spreadsheet_id && token) {
    return (
      <div className="w-full h-screen">
        <SpreadsheetViewer
          spreadsheetId={spreadsheetData.spreadsheet_id}
          onUpdateSpreadsheet={handleUpdateSpreadsheet}
          token={token}
        />
      </div>
    );
  }

  // Not connected state - show connection interface
  return (
    <div className="flex flex-col w-full h-screen py-4 px-4 sm:px-12 pt-20">
      <PageWrapper
        header="Google Sheets Integration"
        description="Connect your Google Sheets to receive and process data demands"
      >
        <div className="space-y-6">
          {/* Connection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
                Connect Google Sheets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Spreadsheet Connected
                </h3>
                <p className="text-sm text-gray-600 text-center max-w-md mb-6">
                  Connect your Google Sheets to view and manage your published
                  demands data in real-time.
                </p>
                <Button onClick={handleConnectClick} className="px-8">
                  Connect Google Sheets
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Benefits of Google Sheets Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Real-time Data
                    </h4>
                    <p className="text-sm text-gray-600">
                      View your published demands data in real-time with
                      automatic updates
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Easy Export</h4>
                    <p className="text-sm text-gray-600">
                      Export data to CSV or work directly in Google Sheets
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Automatic Sync
                    </h4>
                    <p className="text-sm text-gray-600">
                      Data syncs automatically without manual intervention
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Collaboration
                    </h4>
                    <p className="text-sm text-gray-600">
                      Share and collaborate on demand data with your team
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>

      {/* Add Spreadsheet Modal */}
      {token && (
        <AddSpreadsheetModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onSuccess={handleConnectionSuccess}
          token={token}
          mode="add"
        />
      )}
    </div>
  );
};

export default GoogleSheetsIntegrationPage;
