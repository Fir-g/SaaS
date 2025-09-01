import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
        const data: TenantInstance[] = await getTenantInstances("FT");
        // Ensure data is always an array
        setInstances(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load integrations");
        // Reset instances to empty array on error
        setInstances([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeInstances = useMemo(
    () => {
      // Additional safety check to ensure instances is an array
      if (!Array.isArray(instances)) {
        return [];
      }
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <span className="inline-block w-2 h-2 rotate-45 border-l-2 border-b-2 border-gray-600 ml-1"></span>
            Back
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border">
        <div className="flex items-start gap-4">
          <img src="/whatsapp.svg" alt="WhatsApp" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Whatsapp</h1>
            <p className="text-sm text-gray-600">
              Connect WhatsApp groups receive demands
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowExclusion(true)} variant="outline" className="px-4">Edit exclusion list</Button>
          <Button onClick={handleConnect} className="px-6">Connect</Button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Existing integration</h2>
        {loading ? (
          <div className="text-gray-500 text-sm">Loading…</div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : activeInstances.length === 0 ? (
          <div className="text-gray-500 text-sm">No active integrations</div>
        ) : (
          <ul className="divide-y rounded-md border overflow-hidden max-w-xl">
            {activeInstances.map((inst) => (
              <li key={inst.id} className="flex items-center justify-between p-3 bg-white">
                <div className="text-sm text-gray-800">+{inst.phone_number.replace(/^91/, "91 ")}</div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEdit(inst)}
                    className="text-gray-600 hover:text-gray-900"
                    aria-label="Edit"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(inst)}
                    className="text-gray-600 hover:text-red-600"
                    aria-label="Delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {showWhitelistFor && (
        <WhitelistModal
          tenantId="FT"
          phoneNumber={showWhitelistFor}
          isOpen={true}
          onClose={() => setShowWhitelistFor(null)}
        />
      )}
      {showExclusion && (
        <ExclusionModal tenantId="FT" isOpen={true} onClose={() => setShowExclusion(false)} />
      )}
    </IntegrationsLayout>
  );
};

export default WhatsappIntegrationLanding;