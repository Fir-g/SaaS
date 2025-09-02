import { LatestDemandsResponse, ODVLSPResponse } from "@/types/demand";
import { ApiService } from "@/services/api";

const DEMAND_AGGREGATOR_API = import.meta.env.VITE_DEMAND_AGGREGATOR_API as string | undefined;

class DemandAggregatorApiService extends ApiService {
  constructor() {
    super();
    if (!DEMAND_AGGREGATOR_API) {
      throw new Error("VITE_DEMAND_AGGREGATOR_API is not set");
    }
    // Override base URL to segregate from default API
    this.baseUrl = DEMAND_AGGREGATOR_API as unknown as string;
  }

  // Always use direct base URL, do not proxy
  protected getApiUrl(endpoint: string): string {
    return `${DEMAND_AGGREGATOR_API}${endpoint}`;
  }
}

const daService = new DemandAggregatorApiService();

export interface ChannelSplitResponse {
  entity: string;
  rows: Array<{
    key: string;
    count: number;
  }>;
  total: number;
}

export interface TrendsResponse {
  buckets: string[];
  counts: number[];
}

export interface VehicleMappingResponse {
  id: number;
  tenant_id: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_type: string;
  vehicle_code: string;
  vehicle_length: string;
  vehicle_axle: string | null;
  vehicle_capacity: string;
  vehicle_category: string;
  vehicle_tyre: string | null;
  vehicle_hq: string;
  vehicle_family: string | null;
}

export interface LspNamesResponse {
  lsp_names: string[];
}

export const getLatestPublishedDemands = async (
  tenantId: string = "FT",
  limit: number = 10,
  token?: string | null
): Promise<LatestDemandsResponse> => {
  return daService.get<LatestDemandsResponse>(
    "/demand/latest_success",
    { tenant_id: tenantId, limit },
    token,
    true
  );
};

export const getLatestFailedDemands = async (
  tenantId: string = "FT",
  limit: number = 10,
  token?: string | null
): Promise<LatestDemandsResponse> => {
  return daService.get<LatestDemandsResponse>(
    "/demand/latest_failed",
    { tenant_id: tenantId, limit },
    token,
    true
  );
};

export const getChannelSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  status: string,
  token?: string | null
): Promise<ChannelSplitResponse> => {
  return daService.get<ChannelSplitResponse>(
    "/split/source",
    { tenant_id: tenantId, entity, from: fromDate, to: toDate, status },
    token,
    true
  );
};

export const getTrendsData = async (
  tenantId: string = "FT",
  bucket: string = "day",
  fromDate: string,
  toDate: string,
  status: string = "",
  token?: string | null
): Promise<TrendsResponse> => {
  return daService.get<TrendsResponse>(
    "/demand/trends",
    { tenant_id: tenantId, bucket, from: fromDate, to: toDate, status },
    token,
    true
  );
};

export const getOriginSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  destination: string = "",
  vehicleId: string = "",
  lspName: string = "",
  status: string = "",
  token?: string | null
): Promise<ChannelSplitResponse> => {
  return daService.get<ChannelSplitResponse>(
    "/split/origin",
    { tenant_id: tenantId, entity, from: fromDate, to: toDate, destination, vehicle_id: vehicleId, lsp_name: lspName, status },
    token,
    true
  );
};

export const getDestinationSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  origin: string = "",
  vehicleId: string = "",
  lspName: string = "",
  status: string = "",
  token?: string | null
): Promise<ChannelSplitResponse> => {
  return daService.get<ChannelSplitResponse>(
    "/split/destination",
    { tenant_id: tenantId, entity, from: fromDate, to: toDate, origin, vehicle_id: vehicleId, lsp_name: lspName, status },
    token,
    true
  );
};

export const getVehicleSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  origin: string = "",
  destination: string = "",
  lspName: string = "",
  vehicleStatus: string = "",
  token?: string | null
): Promise<ChannelSplitResponse> => {
  return daService.get<ChannelSplitResponse>(
    "/split/vehicle_type",
    { tenant_id: tenantId, entity, from: fromDate, to: toDate, origin, destination, lsp_name: lspName, status: vehicleStatus },
    token,
    true
  );
};

export const getCustomerSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  origin: string = "",
  destination: string = "",
  vehicleId: string = "",
  status: string = "",
  token?: string | null
): Promise<ChannelSplitResponse> => {
  return daService.get<ChannelSplitResponse>(
    "/split/customer",
    { tenant_id: tenantId, entity, from: fromDate, to: toDate, origin, destination, vehicle_id: vehicleId, status },
    token,
    true
  );
};

export const getVehicleMapping = async (
  tenantId: string = "FT",
  token?: string | null
): Promise<VehicleMappingResponse[]> => {
  return daService.get<VehicleMappingResponse[]>(
    "/tenant-vehicle-mapping",
    { tenant_id: tenantId },
    token,
    true
  );
};

export const getLspNames = async (
  tenantId: string = "FT",
  token?: string | null
): Promise<LspNamesResponse> => {
  return daService.get<LspNamesResponse>(
    "/lsp/names",
    { tenant_id: tenantId },
    token,
    true
  );
};

export const getODVLSPData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  status: string,
  origins: string = "",
  destinations: string = "",
  lspNames: string = "",
  vehicleIds: string = "",
  token?: string | null
): Promise<ODVLSPResponse> => {
  return daService.get<ODVLSPResponse>(
    "/aggregate/odv_lsp",
    { tenant_id: tenantId, entity, from: fromDate, to: toDate, status, origins, destinations, lsp_names: lspNames, vehicle_ids: vehicleIds },
    token,
    true
  );
};
