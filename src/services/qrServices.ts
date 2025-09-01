import { ApiService } from "./api";
import config from '@/config';

// Create an instance of ApiService for QR services
class QRApiService extends ApiService {
  private token = config.service_url.token;

  async postQRData<T>(endpoint: string, data?: any): Promise<T> {
    return this.post<T>(endpoint, data, this.token, false);
  }
}

const qrApi = new QRApiService();

export const getQrCode = async () => {
  return qrApi.postQRData("/api/create-instance", {
    tenantId: "FT",
  });
};

