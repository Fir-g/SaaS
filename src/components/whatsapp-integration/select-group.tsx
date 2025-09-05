import NextButton from "@/components/ui/next-button";
import PageWrapper from "@/components/ui/page-wrapper";
import { useEffect, useState } from "react";
import { WhatsAppGroupType, WhitelistedGroupType } from "@/types/groups";
import {
  getWhatsAppGroups,
  getWhitelistedGroups,
  postWhitelistedGroups,
} from "@/services/groupServices";
import { getTenantInstances } from "@/services/storageService";
import GrouplistTable from "./grouplist-table";
import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";

type TenantInstance = {
  id: number;
  phone_number: string;
  instance_id: string;
  connected_at: string | null;
  disconnected_at: string | null;
  tenant: string;
};

const SelectGroup = () => {
  const { getToken } = useAuth();
  const getClerkBearer = useCallback(async () => {
    return getToken({ skipCache: true });
  }, [getToken]);

  const [fetchedGroups, setFetchedGroups] = useState<WhitelistedGroupType[]>([]);
  const [whatsAppGroups, setWhatsAppGroups] = useState<WhatsAppGroupType[]>([]);
  const [whitelistedGroups, setWhitelistedGroups] = useState<WhitelistedGroupType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [activeInstances, setActiveInstances] = useState<TenantInstance[]>([]);

  // Get phone number from active instances
  useEffect(() => {
    const fetchActiveInstances = async () => {
      try {
        setLoading(true);
        const token = await getClerkBearer();
        const instances: TenantInstance[] = await getTenantInstances("FT", token);
        
        // Filter for active instances (not disconnected)
        const active = Array.isArray(instances) 
          ? instances.filter((i) => i.disconnected_at === null)
          : [];
        
        setActiveInstances(active);
        
        if (active.length > 0) {
          // Use the first active instance's phone number
          setPhoneNumber(active[0].phone_number);
        } else {
          setError("No active WhatsApp integrations found. Please connect WhatsApp first.");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load active integrations");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveInstances();
  }, [getClerkBearer]);

  const combinedGroup = whatsAppGroups.map((group) => {
    const matchingWhitelisted = fetchedGroups.find(
      (g) => g.whitelisted_id === group.id
    );
    return {
      id: group.id,
      whitelisted_name: group.name,
      phone_number: phoneNumber,
      whitelisted_type: group.isGroup ? "group" : "one on one",
      participantsCount: group.participantsCount,
      checked: !!matchingWhitelisted,
    };
  });

  useEffect(() => {
    if (!phoneNumber) return;

    const getGroups = async () => {
      try {
        setLoading(true);
        setError("");
        const token = await getClerkBearer();
        
        // Commented out whitelisted-entries API call
        // const [whitelistedGroups, waGroups] = await Promise.all([
        //   getWhitelistedGroups('FT', token),
        //   getWhatsAppGroups(phoneNumber, token),
        // ]);
        
        // Only fetch WhatsApp groups (chat API)
        const waGroups = await getWhatsAppGroups(phoneNumber, token);
        
        // setFetchedGroups(whitelistedGroups || []);
        // setWhitelistedGroups(whitelistedGroups || []);
        setFetchedGroups([]); // Initialize as empty since we're not fetching whitelisted groups
        setWhitelistedGroups([]); // Initialize as empty since we're not fetching whitelisted groups
        setWhatsAppGroups(waGroups || []);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError("Failed to fetch groups. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    getGroups();
  }, [phoneNumber, getClerkBearer]);

  const handleToggle = (group_id: string, checked: boolean) => {
    const group = combinedGroup.find((g) => g.id === group_id);
    if (!group) return;

    if (checked) {
      setWhitelistedGroups((prev) => {
        // Avoid duplicates
        const alreadyExists = prev.some(
          (entry) => entry.whitelisted_id === group.id
        );
        if (alreadyExists) return prev;

        const newEntry: WhitelistedGroupType = {
          phone_number: group.phone_number,
          tenant_id: "FT",
          whitelisted_id: group.id,
          whitelisted_type: group.whitelisted_type,
          whitelisted_name: group.whitelisted_name,
          lsp_name: "mktest",
        };

        return [...prev, newEntry];
      });
      setFetchedGroups((prev) => {
        const alreadyExists = prev.some(
          (entry) => entry.whitelisted_id === group.id
        );
        if (alreadyExists) return prev;

        const newEntry: WhitelistedGroupType = {
          phone_number: group.phone_number,
          tenant_id: "FT",
          whitelisted_id: group.id,
          whitelisted_type: group.whitelisted_type,
          whitelisted_name: group.whitelisted_name,
          lsp_name: "mktest",
        };

        return [...prev, newEntry];
      });
    } else {
      setWhitelistedGroups((prev) =>
        prev.filter((entry) => entry.whitelisted_id !== group.id)
      );
      setFetchedGroups((prev) =>
        prev.filter((entry) => entry.whitelisted_id !== group.id)
      );
    }
  };

  const handleNextClick = async () => {
    try {
      const token = await getClerkBearer();
      await postWhitelistedGroups(whitelistedGroups, token);
      console.log("Successfully saved whitelisted groups");
    } catch (error) {
      console.error("Error saving whitelisted groups:", error);
      setError("Failed to save group selection. Please try again.");
    }
  };

  if (loading && !phoneNumber) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading active integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full py-4 px-4 md:px-8 lg:px-12 pt-16">
      <PageWrapper
        header="Configure conversations to read"
        description="We value your privacy and data and understand that it might be
            uncomfortable to have an AI agent scanning your WhatsApp. We provide
            you full freedom to select & mark which numbers or groups you want
            us to skip reading in our analysis."
      >
        {activeInstances.length > 0 && (
          <div className="mb-4 space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              Select WhatsApp Integration
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {activeInstances.map((instance) => (
                <button
                  key={instance.id}
                  onClick={() => setPhoneNumber(instance.phone_number)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    phoneNumber === instance.phone_number
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        +{instance.phone_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        Connected {instance.connected_at 
                          ? new Date(instance.connected_at).toLocaleDateString()
                          : 'Recently'
                        }
                      </p>
                    </div>
                    {phoneNumber === instance.phone_number && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {phoneNumber && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Configuring conversations for:</strong> +{phoneNumber}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="shadow-lg sm:rounded-lg mt-4 min-h-64 overflow-auto">
          <GrouplistTable
            combinedGroup={combinedGroup}
            whitelistedGroups={whitelistedGroups}
            handleToggle={handleToggle}
            error={error}
            loading={loading}
          />
        </div>
      </PageWrapper>
      
      <div className="mt-auto pt-6">
        <NextButton
          handleClick={handleNextClick}
          nextPageUrl="/whatsapp/success"
          text="Next"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default SelectGroup;