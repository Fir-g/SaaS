import { ApiService } from '@/services/api';

const DEMAND_AGGREGATOR_API = import.meta.env.VITE_DEMAND_AGGREGATOR_API as string | undefined;

class RootCauseApiService extends ApiService {
  constructor() {
    super();
    if (!DEMAND_AGGREGATOR_API) {
      throw new Error('VITE_DEMAND_AGGREGATOR_API is not set');
    }
    this.baseUrl = DEMAND_AGGREGATOR_API as unknown as string;
  }

  protected getApiUrl(endpoint: string): string {
    return `${DEMAND_AGGREGATOR_API}${endpoint}`;
  }
}

const rcaService = new RootCauseApiService();

export interface RootCauseData {
  title: string;
  key: string;
  percent: number;
  metadata: Record<string, any>;
  children: RootCauseData[];
}

export const getRootCauseAnalysis = async (
  tenantId: string = 'FT',
  fromDate?: string,
  toDate?: string,
  lspName?: string,
  token?: string | null
): Promise<RootCauseData[]> => {
  const params: Record<string, string> = {};
  
  if (fromDate) params.from = fromDate;
  if (toDate) params.to = toDate;
  if (lspName) params.lsp_names = lspName;

  return rcaService.get<RootCauseData[]>(
    `/tenants/${tenantId}/rca`,
    params,
    token,
    true
  );
};