import { WhatsAppGroupType, WhitelistedGroupType } from "@/types/groups";
import { ApiService } from "./api";
import config from '@/config';

// Create an instance of ApiService for group services
class GroupApiService extends ApiService {
  private token = config.service_url.token;

  async getGroupData<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.get<T>(endpoint, params, this.token, false);
  }

  async postGroupData<T>(endpoint: string, data?: any): Promise<T> {
    return this.post<T>(endpoint, data, this.token, false);
  }
}

const groupApi = new GroupApiService();

export const getWhitelistedGroups = async (tenantId: string) => {
  try {
    const response = await groupApi.getGroupData<{entries: WhitelistedGroupType[]}>(`/${tenantId}/whitelisted-entries`);
    return response.entries;
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch groups");
  }
};

export const getWhatsAppGroups = async (phoneNumber: string) => {
  try {
    // For WhatsApp groups, we'll need to use a different approach since qrApi was external
    // This might need to be updated based on your actual WhatsApp API integration
    const response = await groupApi.getGroupData<{ success: boolean; chats: WhatsAppGroupType[] }>(`/api/instances/${phoneNumber}/chats`);
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
    const response = await groupApi.postGroupData("/whitelist/bulk", {
      tenant_id: tenantId,
      entries: whitelistedGroups,
    });
    console.log("successfully added groups to whitelist");
  } catch (error) {
    throw new Error(`Error fetching whitelisted groups: ${error}`);
  }
};

// Blacklist (exclusion list) services
export const getBlacklistedNumbers = async (tenantId: string): Promise<string[]> => {
  try {
    const data = await groupApi.getGroupData<any>(`/${tenantId}/blacklisted-numbers`);
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
    await groupApi.postGroupData(`/blacklist`, {
      tenant_id: tenantId,
      phone_numbers: phoneNumbers,
    });
  } catch (error) {
    console.error("Error updating blacklist:", error);
    throw new Error("Failed to update blacklist");
  }
};
