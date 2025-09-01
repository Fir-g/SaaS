import { ApiService } from "./api";
import config from '@/config';

// Create an instance of ApiService for contact services
class ContactApiService extends ApiService {
  private token = config.service_url.token;

  async getContactData<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.get<T>(endpoint, params, this.token, true);
  }
}

const contactApi = new ContactApiService();

export const getBlacklistedContacts = async () => {
  try {
    return contactApi.getContactData<any>("/FT/blacklisted-numbers");
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch blacklisted contacts");
  }
};
