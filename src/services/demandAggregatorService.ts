import { ApiService } from "./api";
import { LatestDemandsResponse, ODVLSPResponse } from "@/types/demand";
import config from '@/config';

// Create an instance of ApiService for demand aggregator
class DemandAggregatorApiService extends ApiService {
  private token = config.service_url.token;

  async getDemandData<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.get<T>(endpoint, params, this.token, false);
  }
}

const demandAggregatorApi = new DemandAggregatorApiService();

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
  limit: number = 10
): Promise<LatestDemandsResponse> => {
  return demandAggregatorApi.getDemandData<LatestDemandsResponse>("/demand/latest_success", {
    tenant_id: tenantId,
    limit
  });
};

export const getLatestFailedDemands = async (
  tenantId: string = "FT",
  limit: number = 10
): Promise<LatestDemandsResponse> => {
  return demandAggregatorApi.getDemandData<LatestDemandsResponse>("/demand/latest_failed", {
    tenant_id: tenantId,
    limit
  });
};

export const getChannelSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  status: string
): Promise<ChannelSplitResponse> => {
  return demandAggregatorApi.getDemandData<ChannelSplitResponse>("/split/source", {
    tenant_id: tenantId,
    entity,
    from: fromDate,
    to: toDate,
    status
  });
};

export const getTrendsData = async (
  tenantId: string = "FT",
  bucket: string = "day",
  fromDate: string,
  toDate: string,
  status: string = ""
): Promise<TrendsResponse> => {
  return demandAggregatorApi.getDemandData<TrendsResponse>("/demand/trends", {
    tenant_id: tenantId,
    bucket,
    from: fromDate,
    to: toDate,
    status
  });
};

export const getOriginSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  destination: string = "",
  vehicleId: string = "",
  lspName: string = "",
  status: string = ""
): Promise<ChannelSplitResponse> => {
  return demandAggregatorApi.getDemandData<ChannelSplitResponse>("/split/origin", {
    tenant_id: tenantId,
    entity,
    from: fromDate,
    to: toDate,
    destination,
    vehicle_id: vehicleId,
    lsp_name: lspName,
    status
  });
};

export const getDestinationSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  origin: string = "",
  vehicleId: string = "",
  lspName: string = "",
  status: string = ""
): Promise<ChannelSplitResponse> => {
  return demandAggregatorApi.getDemandData<ChannelSplitResponse>("/split/destination", {
    tenant_id: tenantId,
    entity,
    from: fromDate,
    to: toDate,
    origin,
    vehicle_id: vehicleId,
    lsp_name: lspName,
    status
  });
};

export const getVehicleSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  origin: string = "",
  destination: string = "",
  lspName: string = "",
  vehicleStatus: string = ""
): Promise<ChannelSplitResponse> => {
  return demandAggregatorApi.getDemandData<ChannelSplitResponse>("/split/vehicle_type", {
    tenant_id: tenantId,
    entity,
    from: fromDate,
    to: toDate,
    origin,
    destination,
    lsp_name: lspName,
    status: vehicleStatus
  });
};

export const getCustomerSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  origin: string = "",
  destination: string = "",
  vehicleId: string = "",
  status: string = ""
): Promise<ChannelSplitResponse> => {
  return demandAggregatorApi.getDemandData<ChannelSplitResponse>("/split/customer", {
    tenant_id: tenantId,
    entity,
    from: fromDate,
    to: toDate,
    origin,
    destination,
    vehicle_id: vehicleId,
    status
  });
};

export const getVehicleMapping = async (
  tenantId: string = "FT"
): Promise<VehicleMappingResponse[]> => {
  return demandAggregatorApi.getDemandData<VehicleMappingResponse[]>("/tenant-vehicle-mapping", {
    tenant_id: tenantId
  });
};

export const getLspNames = async (
  tenantId: string = "FT"
): Promise<LspNamesResponse> => {
  return demandAggregatorApi.getDemandData<LspNamesResponse>("/lsp/names", {
    tenant_id: tenantId
  });
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
  vehicleIds: string = ""
): Promise<ODVLSPResponse> => {
  return demandAggregatorApi.getDemandData<ODVLSPResponse>("/aggregate/odv_lsp", {
    tenant_id: tenantId,
    entity,
    from: fromDate,
    to: toDate,
    status,
    origins,
    destinations,
    lsp_names: lspNames,
    vehicle_ids: vehicleIds
  });
};
