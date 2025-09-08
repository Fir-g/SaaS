import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { AddSpreadsheetModal } from './AddSpreadsheetModal';

interface SpreadsheetViewerProps {
  spreadsheetId: string;
  onUpdateSpreadsheet?: () => void;
  token?: string | null;
}

export const SpreadsheetViewer: React.FC<SpreadsheetViewerProps> = ({
  spreadsheetId,
  onUpdateSpreadsheet,
  token
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Different URL formats to try
  const embedUrls = {
    standard: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`,
    embed: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing&widget=true&headers=false`,
    preview: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/preview`,
    htmlEmbed: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing&single=true&widget=true&headers=false&chrome=false`
  };

  const [currentUrl, setCurrentUrl] = useState(embedUrls.htmlEmbed);

  // Reset loading state when spreadsheetId changes
  useEffect(() => {
    if (spreadsheetId) {
      setIsLoading(true);
      setError(null);
      setIsInitialLoad(true);
      // Update URL with new spreadsheet ID
      setCurrentUrl(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing&single=true&widget=true&headers=false&chrome=false`);
    }
  }, [spreadsheetId]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
    setIsInitialLoad(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load spreadsheet. Please try refreshing or opening in a new tab.");
    setIsInitialLoad(false);
  };

  const refreshSpreadsheet = () => {
    setIsLoading(true);
    setError(null);
    // Force iframe reload by adding a cache-busting parameter
    const iframe = document.getElementById('spreadsheet-iframe') as HTMLIFrameElement;
    if (iframe) {
      const url = new URL(iframe.src);
      url.searchParams.set('t', Date.now().toString());
      iframe.src = url.toString();
    }
  };

  const openInNewTab = () => {
    window.open(embedUrls.standard, '_blank');
  };

  const tryDifferentFormat = () => {
    const urls = Object.values(embedUrls);
    const currentIndex = urls.indexOf(currentUrl);
    const nextIndex = (currentIndex + 1) % urls.length;
    setCurrentUrl(urls[nextIndex]);
    setIsLoading(true);
    setError(null);
  };

  const handleUpdateSuccess = (newSpreadsheetId: string) => {
    // Update the current URL with new spreadsheet ID
    const urls = {
      standard: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit?usp=sharing`,
      embed: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit?usp=sharing&widget=true&headers=false`,
      preview: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/preview`,
      htmlEmbed: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit?usp=sharing&single=true&widget=true&headers=false&chrome=false`
    };
    
    setCurrentUrl(urls.htmlEmbed);
    setIsLoading(true);
    setError(null);
    setIsInitialLoad(true);
    
    if (onUpdateSpreadsheet) {
      onUpdateSpreadsheet();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            Published Demands Spreadsheet
          </h1>
          <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Real-time view of published demand data
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSpreadsheet}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={tryDifferentFormat}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <span className="hidden sm:inline">Try Different Format</span>
            <span className="sm:hidden">Format</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Open in Google Sheets</span>
            <span className="sm:hidden">Open</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
              window.open(csvUrl, '_blank');
            }}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpdateModal(true)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Update Spreadsheet</span>
            <span className="sm:hidden">Update</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-gray-50">
        {/* Enhanced Loading overlay for initial load */}
        {isLoading && isInitialLoad && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <div className="text-center">
              <div className="mb-4">
                <Loader />
              </div>
              <p className="text-sm text-gray-600 mb-2">Loading spreadsheet...</p>
              <p className="text-xs text-gray-400">This may take a few moments</p>
            </div>
          </div>
        )}

        {/* Smaller loading indicator for refreshes */}
        {isLoading && !isInitialLoad && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 z-10">
            <Loader />
            <span className="text-sm text-gray-600">Refreshing...</span>
          </div>
        )}

        {/* Error message */}
        {error && !isLoading && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <div className="text-center max-w-md p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load spreadsheet</h3>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={tryDifferentFormat}
                >
                  Try Different Format
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInNewTab}
                >
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main iframe */}
        {spreadsheetId && (
          <iframe
            id="spreadsheet-iframe"
            src={currentUrl}
            title="Published Demands Spreadsheet"
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="fullscreen"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}

        {/* No spreadsheet ID state */}
        {!spreadsheetId && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <div className="text-center max-w-md p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No spreadsheet configured</h3>
              <p className="text-sm text-gray-600 mb-4">Please add a spreadsheet to get started.</p>
              <Button
                onClick={() => setShowUpdateModal(true)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Add Spreadsheet
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Update Spreadsheet Modal */}
      <AddSpreadsheetModal
        open={showUpdateModal}
        onOpenChange={setShowUpdateModal}
        onSuccess={handleUpdateSuccess}
        token={token}
        existingUrl={spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` : undefined}
        mode="update"
      />
    </div>
  );
};