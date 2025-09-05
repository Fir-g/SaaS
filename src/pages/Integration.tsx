import React, { useState } from "react";
import IntegrationCard from "@/components/ui/integration-card";
import { sourcingIntegrations, publishingIntegrations } from "@/constants/integrations";
import IntegrationsLayout from "@/components/integrations/integrations-layout";
import { useNavigate } from "react-router-dom";
import { getGmailAuthUrl } from "@/services/gmailService";

const IntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"demand" | "supply">("demand");
  const navigate = useNavigate();
  
  const handleConnect = async (integrationId: string, integrationUrl: string) => {
    if (integrationId === "gmail") {
      try {
        const { auth_url } = await getGmailAuthUrl();
        window.location.href = auth_url;
        return;
      } catch (e) {
        console.error("Failed to start Gmail auth", e);
      }
    }
    navigate(integrationUrl);
  };

  return (
    <IntegrationsLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Integrations</h1>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("demand")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
              activeTab === "demand"
                ? "bg-white text-gray-900 border-gray-300 shadow-sm"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            Demand integration
          </button>
          <button
            onClick={() => setActiveTab("supply")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
              activeTab === "supply"
                ? "bg-white text-gray-900 border-gray-300 shadow-sm"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            Supply integration
          </button>
        </div>
      </div>

      {/* Section Renderer */}
      {activeTab === "demand" ? (
        <>
          {/* Sourcing Integration Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-medium text-gray-900">
                Sourcing integration
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                Done
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Select tool which you want to start the integration with
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sourcingIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  icon={integration.icon}
                  name={integration.name}
                  description={integration.description}
                  connectionStatus={integration.connectionStatus}
                  onConnect={() => handleConnect(integration.id, integration.url)}
                />
              ))}
            </div>
          </div>

          {/* Publishing Integration Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-medium text-gray-900">Publishing integration</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                Done
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Select tool which you want to start the integration with
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishingIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  icon={integration.icon}
                  name={integration.name}
                  description={integration.description}
                  connectionStatus={integration.connectionStatus}
                  onConnect={() => handleConnect(integration.id, integration.url)}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-gray-500 text-sm">Supply integration UI coming soon…</div>
      )}
    </IntegrationsLayout>
  );
};

export default IntegrationsPage;