import { WhatsAppGroupType, WhitelistedGroupType } from "@/types/groups";
import { ApiService } from "@/services/api";

// Get the API URLs from environment variables
const GROUP_API = import.meta.env.VITE_GROUP_API as string | undefined;
const CHAT_API = import.meta.env.VITE_CHAT_API as string | undefined;

class GroupApiService extends ApiService {
  constructor() {
    super();
    if (!GROUP_API) {
      throw new Error("VITE_GROUP_API is not set");
    }
    this.baseUrl = GROUP_API as unknown as string;
  }

  protected getApiUrl(endpoint: string): string {
    return `${GROUP_API}${endpoint}`;
  }
}

class ChatApiService extends ApiService {
  constructor() {
    super();
    if (!CHAT_API) {
      throw new Error("VITE_CHAT_API is not set");
    }
    this.baseUrl = CHAT_API as unknown as string;
  }

  protected getApiUrl(endpoint: string): string {
    return `${CHAT_API}${endpoint}`;
  }
}

const groupApi = new GroupApiService();
const chatApi = new ChatApiService();

export const getWhitelistedGroups = async (tenantId: string, token: string | null) => {
  try {
    const response = await groupApi.get<{entries: WhitelistedGroupType[]}>(`/${tenantId}/whitelisted-entries`, {}, token, true);
    return response.entries || [];
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch whitelisted groups");
  }
};

export const getWhatsAppGroups = async (phoneNumber: string, token: string | null) => {
  try {
    // Use the chat API endpoint instead of group API
    const response = await chatApi.get<{ success: boolean; chats: WhatsAppGroupType[] }>(`/api/instances/${phoneNumber}/chats`, {}, token, true);
    return response.chats || [];
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch WhatsApp groups");
  }
};

export const postWhitelistedGroups = async (
  whitelistedGroups: WhitelistedGroupType[],
  token: string | null
) => {
  try {
    const tenantId = whitelistedGroups?.[0]?.tenant_id || "FT";
    const response = await groupApi.post("/whitelist/bulk", {
      tenant_id: tenantId,
      entries: whitelistedGroups,
    }, token, true);
    console.log("Successfully added groups to whitelist");
    return response;
  } catch (error) {
    console.error("Error posting whitelisted groups:", error);
    throw new Error(`Error updating whitelisted groups: ${error}`);
  }
};

export const getBlacklistedNumbers = async (tenantId: string, token: string | null): Promise<string[]> => {
  try {
    const data = await groupApi.get<any>(`/${tenantId}/blacklisted-numbers`, {}, token, true);
    const toStrings = (arr: any[]): string[] => {
      if (!Array.isArray(arr)) return [];
      const values = arr.map((item) => {
        if (typeof item === "string") return item;
        if (item?.phone_number) return String(item.phone_number);
        if (item?.number) return String(item.number);
        return undefined;
      }).filter(Boolean) as string[];
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
  phoneNumbers: string[],
  token: string | null
) => {
  try {
    await groupApi.post(`/blacklist`, {
      tenant_id: tenantId,
      phone_numbers: phoneNumbers,
    }, token, true);
  } catch (error) {
    console.error("Error updating blacklist:", error);
    throw new Error("Failed to update blacklist");
  }
};