import { ApiService } from "./api";
import config from '@/config';

// Create an instance of ApiService for Gmail services
class GmailApiService extends ApiService {
  private token = config.service_url.token;

  async getGmailData<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.get<T>(endpoint, params, this.token, true);
  }
}

const gmailApi = new GmailApiService();

export type GmailAuthResponse = {
  auth_url: string;
  state: string;
};

export const getGmailAuthUrl = async (): Promise<GmailAuthResponse> => {
  // Note: This endpoint might need to be updated based on your actual Gmail API integration
  return gmailApi.getGmailData<GmailAuthResponse>("/gmail_login/auth-url");
};


