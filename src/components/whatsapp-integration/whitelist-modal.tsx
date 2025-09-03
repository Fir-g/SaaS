import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  getWhatsAppGroups,
  getWhitelistedGroups,
  postWhitelistedGroups,
} from "@/services/groupServices";
import GrouplistTable from "./grouplist-table";
import { WhitelistedGroupType } from "@/types/groups";

interface WhitelistModalProps {
  tenantId: string;
  phoneNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WhitelistModal({
  tenantId,
  phoneNumber,
  isOpen,
  onClose,
}: WhitelistModalProps) {
  const { getToken } = useAuth();
  const getClerkBearer = useCallback(async () => {
    const template = import.meta.env.VITE_CLERK_TOKEN_TEMPLATE as string | undefined;
    return getToken({ template, skipCache: true });
  }, [getToken]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchedGroups, setFetchedGroups] = useState<WhitelistedGroupType[]>([]);
  const [whatsAppGroups, setWhatsAppGroups] = useState<any[]>([]);
  const [whitelistedGroups, setWhitelistedGroups] = useState<WhitelistedGroupType[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const token = await getClerkBearer();
        const [whitelisted, waGroups] = await Promise.all([
          getWhitelistedGroups(tenantId, token),
          getWhatsAppGroups(phoneNumber, token),
        ]);
        const filtered = (whitelisted || []).filter(
          (e: WhitelistedGroupType) => e.phone_number === phoneNumber
        );
        setFetchedGroups(filtered);
        setWhitelistedGroups(filtered);
        setWhatsAppGroups(waGroups || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load groups");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, tenantId, phoneNumber, getClerkBearer]);

  const combinedGroup = useMemo(
    () =>
      (whatsAppGroups || []).map((group: any) => {
        const matching = whitelistedGroups.find((g) => g.whitelisted_id === group.id);
        return {
          id: group.id,
          whitelisted_name: group.name,
          phone_number: phoneNumber,
          whitelisted_type: "group",
          participantsCount: group.participantsCount,
          checked: !!matching,
        };
      }),
    [whatsAppGroups, whitelistedGroups, phoneNumber]
  );

  const handleToggle = (group_id: string, checked: boolean) => {
    const group = combinedGroup.find((g: any) => g.id === group_id);
    if (!group) return;
    if (checked) {
      setWhitelistedGroups((prev) => {
        const exists = prev.some((e) => e.whitelisted_id === group.id);
        if (exists) return prev;
        const newEntry: WhitelistedGroupType = {
          tenant_id: tenantId,
          phone_number: phoneNumber,
          whitelisted_id: group.id,
          whitelisted_type: "group",
          whitelisted_name: group.whitelisted_name,
          lsp_name: "test",
        } as WhitelistedGroupType;
        return [...prev, newEntry];
      });
    } else {
      setWhitelistedGroups((prev) =>
        prev.filter((e) => e.whitelisted_id !== group.id)
      );
    }
  };

  const handleSave = async () => {
    const token = await getClerkBearer();
    await postWhitelistedGroups(whitelistedGroups, token);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-base font-semibold">Edit whitelist for +{phoneNumber}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="px-5 pb-4 overflow-auto">
          <div className="shadow-lg sm:rounded-lg h-96 overflow-auto">
            <GrouplistTable
              combinedGroup={combinedGroup}
              whitelistedGroups={whitelistedGroups}
              handleToggle={handleToggle}
              error={error}
              loading={loading}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-5 py-3 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-gray-800 rounded">Save</button>
        </div>
      </div>
    </div>
  );
}