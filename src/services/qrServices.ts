import { ApiService } from "@/services/api";

// Get the API URL from environment variables
const QR_API = import.meta.env.VITE_QR_API as string | undefined;

class QRApiService extends ApiService {
  constructor() {
    super();
    if (!QR_API) {
      throw new Error("VITE_QR_API is not set");
    }
    // Override base URL like DemandAggregator does
    this.baseUrl = QR_API as unknown as string;
  }

  // Always use direct base URL, do not proxy
  protected getApiUrl(endpoint: string): string {
    return `${QR_API}${endpoint}`;
  }
}

const qrApi = new QRApiService();

export interface CreateInstanceResponse {
  success: string;
  message: string;
  instanceId: string;
  qr: string;
}

export interface InstanceStatus {
  success: boolean;
  instance: {
    instanceId: string;
    state: "qr" | "close" | "connecting" | "open" | "connected" | "disconnected";
    qr?: string;
    phoneNumber: string | null;
    lastActivity: number;
    createdAt: number;
  };
}

export interface RefreshQrResponse {
  success: string;
  instanceId: string;
  qr: string;
}

// Create a new WhatsApp instance
export const getQrCode = async (token: string | null): Promise<CreateInstanceResponse> => {
  return qrApi.post("/api/create-instance", {
    tenantId: "FT",
  }, token, true);
};

// Get instance status
export const getInstanceStatus = async (instanceId: string, token: string | null): Promise<InstanceStatus> => {
  return qrApi.get(`/api/instances/${instanceId}`, {}, token, true);
};

// Refresh QR code for existing instance
export const refreshQrCode = async (instanceId: string, token: string | null): Promise<RefreshQrResponse> => {
  return qrApi.get(`/api/instances/${instanceId}/qr`, {}, token, true);
};