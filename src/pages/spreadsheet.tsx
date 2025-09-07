import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SpreadsheetViewer } from '@/components/google-sheets/SpreadsheetViewer';
import { useAuth } from '@clerk/clerk-react';

const SpreadsheetPage = () => {
  const { getToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  const getClerkBearer = useCallback(async () => {
    return getToken({ skipCache: true });
  }, [getToken]);

  // Get spreadsheet ID from URL params or fallback to environment variable
  const spreadsheetId =
    searchParams.get('id') || import.meta.env.VITE_SPREADSHEET_ID;

  useEffect(() => {
    const fetchToken = async () => {
      const t = await getClerkBearer();
      setToken(t);
    };
    fetchToken();
  }, [getClerkBearer]);

  if (!spreadsheetId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Spreadsheet ID
          </h3>
          <p className="text-sm text-gray-600">
            Please provide a spreadsheet ID or configure the integration
            properly.
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <SpreadsheetViewer spreadsheetId={spreadsheetId} token={token} />
  );
};

export default SpreadsheetPage;
