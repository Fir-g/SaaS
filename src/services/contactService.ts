import { BlacklistedContact } from "@/types/contacts";
import { ApiService } from "@/services/api";

// Get the API URLs from environment variables
const CONTACT_API = import.meta.env.VITE_CONTACT_API as string | undefined;
const BLACKLIST_API = import.meta.env.VITE_BLACKLIST_API as string | undefined;

class ContactApiService extends ApiService {
  constructor() {
    super();
    if (!CONTACT_API) {
      throw new Error("VITE_CONTACT_API is not set");
    }
    this.baseUrl = CONTACT_API as unknown as string;
  }

  protected getApiUrl(endpoint: string): string {
    return `${CONTACT_API}${endpoint}`;
  }
}

class BlacklistApiService extends ApiService {
  constructor() {
    super();
    if (!BLACKLIST_API) {
      throw new Error("VITE_BLACKLIST_API is not set");
    }
    this.baseUrl = BLACKLIST_API as unknown as string;
  }

  protected getApiUrl(endpoint: string): string {
    return `${BLACKLIST_API}${endpoint}`;
  }
}

const contactApi = new ContactApiService();
const blacklistApi = new BlacklistApiService();

export interface BlacklistResponse {
  message: string;
  summary: {
    created: number;
    reactivated: number;
    deactivated: number;
    total_in_list: number;
  };
}

// Get existing blacklisted contacts
export const getBlacklistedContacts = async (token: string | null): Promise<BlacklistedContact[]> => {
  try {
    return contactApi.get<BlacklistedContact[]>("/FT/blacklisted-numbers", {}, token, true);
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch blacklisted contacts");
  }
};

// Add numbers to blacklist
export const postBlacklistedNumbers = async (
  tenantId: string,
  phoneNumbers: string[],
  token: string | null
): Promise<BlacklistResponse> => {
  try {
    return blacklistApi.post("/blacklist", {
      tenant_id: tenantId,
      // group_id: "group-1", // Default group ID as per your requirements
      phone_numbers: phoneNumbers,
    }, token, true);
  } catch (error) {
    console.error("Error updating blacklist:", error);
    throw new Error("Failed to update blacklist");
  }
};