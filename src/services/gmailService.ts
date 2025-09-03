import { ApiService } from "@/services/api";

// Get the API URL from environment variables
const GMAIL_API = import.meta.env.VITE_GMAIL_API as string | undefined;

class GmailApiService extends ApiService {
  constructor() {
    super();
    if (!GMAIL_API) {
      throw new Error("VITE_GMAIL_API is not set");
    }
    // Override base URL like other services
    this.baseUrl = GMAIL_API as unknown as string;
  }

  // Always use direct base URL, do not proxy
  protected getApiUrl(endpoint: string): string {
    return `${GMAIL_API}${endpoint}`;
  }
}

const gmailApi = new GmailApiService();

export type GmailAuthResponse = {
  auth_url: string;
  state: string;
};

export type GmailConnectionStatus = {
  connected: boolean;
  email?: string;
  connected_at?: string;
  last_sync?: string;
};

// Get Gmail OAuth URL
export const getGmailAuthUrl = async (token: string | null): Promise<GmailAuthResponse> => {
  return gmailApi.get<GmailAuthResponse>("/gmail_login/auth-url", {}, token, true);
};

// Check Gmail connection status
export const getGmailStatus = async (token: string | null): Promise<GmailConnectionStatus> => {
  try {
    return gmailApi.get<GmailConnectionStatus>("/gmail/status", {}, token, true);
  } catch (error) {
    console.error("Error checking Gmail status:", error);
    throw new Error("Failed to check Gmail connection status");
  }
};

// Disconnect Gmail integration
export const disconnectGmail = async (token: string | null): Promise<void> => {
  try {
    await gmailApi.post("/gmail/disconnect", {}, token, true);
  } catch (error) {
    console.error("Error disconnecting Gmail:", error);
    throw new Error("Failed to disconnect Gmail");
  }
};