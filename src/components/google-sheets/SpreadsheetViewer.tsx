import React, { useState } from 'react';
import { RefreshCw, ExternalLink, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  // Different URL formats to try
  const embedUrls = {
    standard: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`,
    embed: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing&widget=true&headers=false`,
    preview: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/preview`,
    htmlEmbed: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing&single=true&widget=true&headers=false&chrome=false`
  };

  const [currentUrl, setCurrentUrl] = useState(embedUrls.htmlEmbed);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load spreadsheet. Please try refreshing or opening in a new tab.");
  };

  const refreshSpreadsheet = () => {
    setIsLoading(true);
    setError(null);
    // Force iframe reload by changing src
    const iframe = document.getElementById('spreadsheet-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
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
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading spreadsheet...</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
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
      </div>

      {/* Update Spreadsheet Modal */}
      <AddSpreadsheetModal
        open={showUpdateModal}
        onOpenChange={setShowUpdateModal}
        onSuccess={handleUpdateSuccess}
        token={token}
        existingUrl={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
        mode="update"
      />
    </div>
  );
};