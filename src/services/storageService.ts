import { ApiService } from "./api";
import config from '@/config';

// Create an instance of ApiService for storage services
class StorageApiService extends ApiService {
  private token = config.service_url.token;

  async getStorageData<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.get<T>(endpoint, params, this.token, false);
  }
}

const storageApi = new StorageApiService();

export const getTenantInstances = async (tenantId:string) => {
  try {
    return storageApi.getStorageData<any>(`/instances/${tenantId}/tenant-instances`);
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch instances");
  }
};
