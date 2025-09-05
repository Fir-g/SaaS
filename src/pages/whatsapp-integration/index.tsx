import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import IntegrationsLayout from "@/components/integrations/integrations-layout";
import { Button } from "@/components/ui/button";
import { getTenantInstances } from "@/services/storageService";
import WhitelistModal from "@/components/whatsapp-integration/whitelist-modal";
import ExclusionModal from "@/components/whatsapp-integration/exclusion-modal";

type TenantInstance = {
  id: number;
  phone_number: string;
  instance_id: string;
  connected_at: string | null;
  disconnected_at: string | null;
  tenant: string;
};

const WhatsappIntegrationLanding = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const getClerkBearer = useCallback(async () => {
    return getToken({ skipCache: true });
  }, [getToken]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [instances, setInstances] = useState<TenantInstance[]>([]);
  const [showWhitelistFor, setShowWhitelistFor] = useState<string | null>(null);
  const [showExclusion, setShowExclusion] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getClerkBearer();
        const data: TenantInstance[] = await getTenantInstances("FT", token);
        setInstances(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load integrations");
        setInstances([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getClerkBearer]);

  const activeInstances = useMemo(
    () => {
      if (!Array.isArray(instances)) return [];
      return instances.filter((i) => i.disconnected_at === null);
    },
    [instances]
  );

  const handleBack = () => navigate("/integrations");
  const handleConnect = () => navigate("/whatsapp");
  const handleEdit = (instance: TenantInstance) => {
    setShowWhitelistFor(instance.phone_number);
  };
  const handleDelete = (instance: TenantInstance) => {
    console.log("Delete instance", instance);
    // TODO: call delete API when available
  };

  return (
    <IntegrationsLayout>
      <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Back Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45 border-l-2 border-b-2 border-gray-600 ml-0.5 sm:ml-1"></span>
              Back
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border mb-6 sm:mb-8">
          <div className="flex items-start gap-3 sm:gap-4 mb-4 xl:mb-0 w-full xl:w-auto">
            <img src="/whatsapp.svg" alt="WhatsApp" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-1">
                WhatsApp Integration
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                Connect WhatsApp groups to receive and analyze demands automatically
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full xl:w-auto">
            <Button 
              onClick={() => setShowExclusion(true)} 
              variant="outline" 
              className="px-3 sm:px-4 text-xs sm:text-sm lg:text-base h-8 sm:h-9 lg:h-10"
            >
              Edit exclusion list
            </Button>
            <Button 
              onClick={handleConnect} 
              className="px-4 sm:px-6 text-xs sm:text-sm lg:text-base h-8 sm:h-9 lg:h-10"
            >
              Connect WhatsApp
            </Button>
          </div>
        </div>

        {/* Existing Integrations Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
              Active Integrations
            </h2>
            {activeInstances.length > 0 && (
              <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full self-start sm:self-auto">
                {activeInstances.length} connected
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-gray-900"></div>
                <span className="text-xs sm:text-sm">Loading integrations...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-red-700 text-xs sm:text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-red-600 hover:text-red-800 text-xs sm:text-sm underline"
              >
                Try again
              </button>
            </div>
          ) : activeInstances.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">No active WhatsApp integrations</p>
              <Button onClick={handleConnect} size="sm" className="text-xs sm:text-sm">
                Connect your first WhatsApp
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-3 lg:px-4 font-medium text-gray-700">
                        Phone Number
                      </th>
                      <th className="text-left py-3 px-3 lg:px-4 font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-3 lg:px-4 font-medium text-gray-700">
                        Connected
                      </th>
                      <th className="text-center py-3 px-3 lg:px-4 font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activeInstances.map((inst) => (
                      <tr key={inst.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 lg:px-4">
                          <div className="font-medium text-gray-900 text-sm lg:text-base">
                            +{inst.phone_number.replace(/^91/, "91 ")}
                          </div>
                        </td>
                        <td className="py-3 px-3 lg:px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-3 lg:px-4 text-gray-500 text-xs lg:text-sm">
                          {inst.connected_at ? new Date(inst.connected_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-3 lg:px-4">
                          <div className="flex items-center justify-center gap-1 lg:gap-2">
                            <button
                              onClick={() => handleEdit(inst)}
                              className="p-1.5 lg:p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              aria-label="Edit whitelist"
                              title="Edit whitelist"
                            >
                              <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(inst)}
                              className="p-1.5 lg:p-2 text-gray-400 hover:text-red-600 transition-colors"
                              aria-label="Delete integration"
                              title="Delete integration"
                            >
                              <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden">
                {activeInstances.map((inst) => (
                  <div key={inst.id} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm mb-1">
                          +{inst.phone_number.replace(/^91/, "91 ")}
                        </div>
                        <div className="text-xs text-gray-500">
                          Connected: {inst.connected_at ? new Date(inst.connected_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(inst)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        aria-label="Edit whitelist"
                        title="Edit whitelist"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(inst)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="Delete integration"
                        title="Delete integration"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showWhitelistFor && (
        <WhitelistModal
          tenantId="FT"
          phoneNumber={showWhitelistFor}
          isOpen={true}
          onClose={() => setShowWhitelistFor(null)}
        />
      )}
      {showExclusion && (
        <ExclusionModal 
          tenantId="FT" 
          isOpen={true} 
          onClose={() => setShowExclusion(false)} 
        />
      )}
    </IntegrationsLayout>
  );
};

export default WhatsappIntegrationLanding;