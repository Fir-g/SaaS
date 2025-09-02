import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import PageWrapper from "@/components/ui/page-wrapper";
import { Button } from "@/components/ui/button";
import { getGmailAuthUrl, getGmailStatus, disconnectGmail, GmailConnectionStatus } from "@/services/gmailService";

const GmailIntegrationPage: React.FC = () => {
  const { getToken } = useAuth();
  const getClerkBearer = useCallback(async () => {
    return getToken({ skipCache: true });
  }, [getToken]);

  const [connectionStatus, setConnectionStatus] = useState<GmailConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check Gmail connection status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getClerkBearer();
        const status = await getGmailStatus(token);
        setConnectionStatus(status);
      } catch (e: any) {
        // If status check fails, assume not connected
        setConnectionStatus({ connected: false });
        console.error("Status check error:", e);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [getClerkBearer]);

  return (
    <div className="flex flex-col w-full min-h-screen py-4 px-4 md:px-12 pt-20">
      <PageWrapper
        header="Gmail Integration"
        description="Connect your Gmail account to receive and process email demands automatically"
      >
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <LoadingState />
          ) : connectionStatus?.connected ? (
            <ConnectedState 
              connectionStatus={connectionStatus}
              onDisconnect={async () => {
                try {
                  const token = await getClerkBearer();
                  await disconnectGmail(token);
                  setConnectionStatus({ connected: false });
                } catch (e: any) {
                  setError(e?.message || "Failed to disconnect Gmail");
                }
              }}
              error={error}
            />
          ) : (
            <ConnectGmail 
              getClerkBearer={getClerkBearer}
              onError={setError}
              error={error}
            />
          )}
        </div>
      </PageWrapper>
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
    <p className="text-gray-600">Checking Gmail connection...</p>
  </div>
);

const ConnectedState: React.FC<{
  connectionStatus: GmailConnectionStatus;
  onDisconnect: () => Promise<void>;
  error: string | null;
}> = ({ connectionStatus, onDisconnect, error }) => {
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await onDisconnect();
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-8 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <img src="/gmail.svg" alt="Gmail" className="w-10 h-10" />
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Gmail Connected</h3>
        <p className="text-green-700 text-sm text-center max-w-md">
          Your Gmail account is successfully connected and ready to process email demands.
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Connection Details</h4>
        <div className="space-y-3 text-sm">
          {connectionStatus.email && (
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{connectionStatus.email}</span>
            </div>
          )}
          {connectionStatus.connected_at && (
            <div className="flex justify-between">
              <span className="text-gray-500">Connected:</span>
              <span className="font-medium">
                {new Date(connectionStatus.connected_at).toLocaleDateString()}
              </span>
            </div>
          )}
          {connectionStatus.last_sync && (
            <div className="flex justify-between">
              <span className="text-gray-500">Last Sync:</span>
              <span className="font-medium">
                {new Date(connectionStatus.last_sync).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          {disconnecting ? "Disconnecting..." : "Disconnect Gmail"}
        </Button>
      </div>
    </div>
  );
};

const ConnectGmail: React.FC<{
  getClerkBearer: () => Promise<string | null>;
  onError: (error: string | null) => void;
  error: string | null;
}> = ({ getClerkBearer, onError, error }) => {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      onError(null);
      const token = await getClerkBearer();
      const { auth_url } = await getGmailAuthUrl(token);
      window.location.href = auth_url;
    } catch (e: any) {
      onError(e?.message || "Failed to start Gmail authentication");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
        <img src="/gmail.svg" alt="Gmail" className="w-16 h-16 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Gmail</h3>
        <p className="text-gray-600 text-sm text-center max-w-md mb-6">
          Connect your Gmail account to automatically process email demands. 
          You will be redirected to Google for secure authentication.
        </p>
        <Button 
          onClick={handleConnect} 
          disabled={connecting} 
          className="px-8 py-2"
        >
          {connecting ? "Connecting..." : "Connect Gmail"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-1">Connection Failed</h4>
          <p className="text-red-700 text-sm">{error}</p>
          <button 
            onClick={() => onError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
        <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
          <li>You'll be redirected to Google's secure login page</li>
          <li>Sign in with your Gmail account</li>
          <li>Grant permission to access your emails</li>
          <li>You'll be redirected back to complete the setup</li>
        </ul>
      </div>
    </div>
  );
};

export default GmailIntegrationPage;