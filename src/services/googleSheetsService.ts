import { ApiService } from "@/services/api";

// Get the API URL from environment variables
const SPREADSHEET_API = import.meta.env.VITE_SPREADSHEET_API as string | undefined;

class GoogleSheetsApiService extends ApiService {
  constructor() {
    super();
    if (!SPREADSHEET_API) {
      throw new Error("VITE_SPREADSHEET_API is not set");
    }
    this.baseUrl = SPREADSHEET_API as unknown as string;
  }

  protected getApiUrl(endpoint: string): string {
    return `${SPREADSHEET_API}${endpoint}`;
  }
}

const googleSheetsApi = new GoogleSheetsApiService();

export interface SpreadsheetResponse {
  id: number;
  spreadsheet_id: string;
  updated_at: string;
  tenant: string;
}

export interface UpdateSpreadsheetRequest {
  tenant: string;
  spreadsheet_id: string;
}

// Get existing spreadsheet for tenant
export const getSpreadsheet = async (tenantId: string = "FT", token?: string | null): Promise<SpreadsheetResponse | null> => {
  try {
    const response = await googleSheetsApi.get<SpreadsheetResponse>(
      `/tenants/sheets?tenant_id=${tenantId}`,
      {},
      token,
      true
    );
    return response;
  } catch (error) {
    console.error("Error fetching spreadsheet:", error);
    return null;
  }
};

// Update or create spreadsheet
export const updateSpreadsheet = async (
  data: UpdateSpreadsheetRequest,
  token?: string | null
): Promise<SpreadsheetResponse> => {
  return googleSheetsApi.put<SpreadsheetResponse>("/tenants/sheets", data, token, true); 
};

// Extract spreadsheet ID from Google Sheets URL
export const extractSpreadsheetId = (url: string): string | null => {
  const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Validate Google Sheets URL format
export const isValidGoogleSheetsUrl = (url: string): boolean => {
  const pattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/;
  return pattern.test(url);
};