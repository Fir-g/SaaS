import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Download } from 'lucide-react';
const SpreadsheetPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sheetData, setSheetData] = useState(null);
  const [error, setError] = useState(null);

  // Your Google Sheets ID
  const SHEET_ID = import.meta.env.VITE_SPREADSHEET_ID ;
  
  // Different URL formats to try
  const embedUrls = {
    standard: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing`,
    embed: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing&widget=true&headers=false`,
    preview: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/preview`,
    htmlEmbed: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing&single=true&widget=true&headers=false&chrome=false`
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
    const iframe = document.getElementById('spreadsheet-iframe');
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

  return (
    <div className="flex flex-col h-screen ">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-l font-semibold text-gray-900">Published Demands Spreadsheet</h1>
          {/* <p className="text-sm text-gray-500 mt-1">Real-time view of published demand data</p> */}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={refreshSpreadsheet}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors border"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h- ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={tryDifferentFormat}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors border"
          >
            Try Different Format
          </button>
          
          <button
            onClick={openInNewTab}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors border"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Google Sheets
          </button>

          <button
              onClick={() => {
                const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
                window.open(csvUrl, '_blank');
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors border"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </button>
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
              <div className="flex gap-2 justify-center">
                <button
                  onClick={tryDifferentFormat}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Different Format
                </button>
                <button
                  onClick={openInNewTab}
                  className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Open in New Tab
                </button>
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
    </div>
  );
};

export default SpreadsheetPage;