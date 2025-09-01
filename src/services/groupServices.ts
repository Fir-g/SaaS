import { WhatsAppGroupType, WhitelistedGroupType } from "@/types/groups";
import api from "@/utils/api/api";
import qrApi from "@/utils/api/qrApi";

export const getWhitelistedGroups = async (tenantId: string) => {
  try {
    const response = await api.get(`/${tenantId}/whitelisted-entries`);
    return response.data.entries;
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch groups");
  }
};

export const getWhatsAppGroups = async (phoneNumber: string) => {
  try {
    const response: { success: boolean; chats: WhatsAppGroupType[] } =
      await qrApi.get(`/api/instances/${phoneNumber}/chats`);
    // console.log(response);
    return response.chats;
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch groups");
  }
};

export const postWhitelistedGroups = async (
  whitelistedGroups: WhitelistedGroupType[]
) => {
  try {
    const tenantId = whitelistedGroups?.[0]?.tenant_id || "FT";
    const response = await api.post("/whitelist/bulk", {
      tenant_id: tenantId,
      entries: whitelistedGroups,
    });
    if (response.status == 200) {
      console.log("successfully added groups to whitelist");
    }
  } catch (error) {
    throw new Error(`Error fetching whitelisted groups: ${error}`);
  }
};

// Blacklist (exclusion list) services
export const getBlacklistedNumbers = async (tenantId: string): Promise<string[]> => {
  try {
    const response = await api.get(`/${tenantId}/blacklisted-numbers`);
    const data = response.data;
    const toStrings = (arr: any[]): string[] => {
      if (!Array.isArray(arr)) return [];
      const values = arr.map((item) => {
        if (typeof item === "string") return item;
        if (item?.phone_number) return String(item.phone_number);
        if (item?.number) return String(item.number);
        return undefined;
      }).filter(Boolean) as string[];
      // ensure unique
      return Array.from(new Set(values));
    };

    if (Array.isArray(data)) return toStrings(data);
    if (Array.isArray(data?.numbers)) return toStrings(data.numbers);
    return [];
  } catch (error) {
    console.error("Error fetching blacklisted numbers:", error);
    throw new Error("Failed to fetch blacklisted numbers");
  }
};

export const postBlacklistedNumbers = async (
  tenantId: string,
  phoneNumbers: string[]
) => {
  try {
    await api.post(`/blacklist`, {
      tenant_id: tenantId,
      phone_numbers: phoneNumbers,
    });
  } catch (error) {
    console.error("Error updating blacklist:", error);
    throw new Error("Failed to update blacklist");
  }
};
