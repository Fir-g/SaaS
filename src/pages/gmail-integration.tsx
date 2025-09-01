import React, { useState } from "react";
import PageWrapper from "@/components/ui/page-wrapper";
import { Button } from "@/components/ui/button";
import { getGmailAuthUrl } from "@/services/gmailService";

const GmailIntegrationPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-screen py-4 px-12 pt-20">
      <PageWrapper
        header="Gmail Integration"
        description="Connect your Gmail account to receive and process email demands"
      >
        <ConnectGmail />
      </PageWrapper>
    </div>
  );
};

export default GmailIntegrationPage;

const ConnectGmail: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      const { auth_url } = await getGmailAuthUrl();
      window.location.href = auth_url;
    } catch (e: any) {
      setError(e?.message || "Failed to start Gmail login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <img src="/gmail.svg" alt="Gmail" className="w-12 h-12" />
      <p className="text-gray-600 text-sm">
        Connect your Gmail account. You will be redirected to Google.
      </p>
      <Button onClick={handleConnect} disabled={loading} className="px-6">
        {loading ? "Redirecting…" : "Connect Gmail"}
      </Button>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
};
