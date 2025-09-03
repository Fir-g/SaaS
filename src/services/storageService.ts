import { ApiService } from "@/services/api";

// Get the API URL from environment variables
const STORAGE_API = import.meta.env.VITE_STORAGE_API as string | undefined;

class StorageApiService extends ApiService {
  constructor() {
    super();
    if (!STORAGE_API) {
      throw new Error("VITE_STORAGE_API is not set");
    }
    // Override base URL like DemandAggregator does
    this.baseUrl = STORAGE_API as unknown as string;
  }

  // Always use direct base URL, do not proxy
  protected getApiUrl(endpoint: string): string {
    return `${STORAGE_API}${endpoint}`;
  }
}

const storageApi = new StorageApiService();

export const getTenantInstances = async (tenantId: string, token?: string | null) => {
  try {
    return storageApi.get<any>(`/instances/${tenantId}/tenant-instances`, {}, token, true);
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Failed to fetch instances");
  }
};