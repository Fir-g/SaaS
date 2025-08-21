import api from "@/utils/api/api";
import { LatestDemandsResponse } from "@/types/demand";

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
  const response = await api.get("/demand/latest_success", {
    params: { tenant_id: tenantId, limit },
  });
  return response.data;
};

export const getLatestFailedDemands = async (
  tenantId: string = "FT",
  limit: number = 10
): Promise<LatestDemandsResponse> => {
  const response = await api.get("/demand/latest_failed", {
    params: { tenant_id: tenantId, limit },
  });
  return response.data;
};

export const getChannelSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string
): Promise<ChannelSplitResponse> => {
  const response = await api.get("/split/source", {
    params: { 
      tenant_id: tenantId, 
      entity, 
      from: fromDate, 
      to: toDate 
    },
  });
  return response.data;
};

export const getTrendsData = async (
  tenantId: string = "FT",
  bucket: string = "day",
  fromDate: string,
  toDate: string
): Promise<TrendsResponse> => {
  const response = await api.get("/demand/trends", {
    params: { 
      tenant_id: tenantId, 
      bucket, 
      from: fromDate, 
      to: toDate 
    },
  });
  return response.data;
};

export const getOriginSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  destination: string = "",
  vehicleId: string = "",
  lspName: string = ""
): Promise<ChannelSplitResponse> => {
  const response = await api.get("/split/origin", {
    params: { 
      tenant_id: tenantId, 
      entity, 
      from: fromDate, 
      to: toDate,
      destination,
      vehicle_id: vehicleId,
      lsp_name: lspName
    },
  });
  return response.data;
};

export const getDestinationSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  origin: string = "",
  vehicleId: string = "",
  lspName: string = ""
): Promise<ChannelSplitResponse> => {
  const response = await api.get("/split/destination", {
    params: { 
      tenant_id: tenantId, 
      entity, 
      from: fromDate, 
      to: toDate,
      origin,
      vehicle_id: vehicleId,
      lsp_name: lspName
    },
  });
  return response.data;
};

export const getVehicleSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  origin: string = "",
  destination: string = "",
  lspName: string = "",
  status: string = ""
): Promise<ChannelSplitResponse> => {
  const response = await api.get("/split/vehicle_type", {
    params: { 
      tenant_id: tenantId, 
      entity, 
      from: fromDate, 
      to: toDate,
      origin,
      destination,
      lsp_name: lspName,
      status
    },
  });
  return response.data;
};

export const getCustomerSplitData = async (
  tenantId: string = "FT",
  entity: string = "demand",
  fromDate: string,
  toDate: string,
  origin: string = "",
  destination: string = "",
  vehicleId: string = ""
): Promise<ChannelSplitResponse> => {
  const response = await api.get("/split/customer", {
    params: { 
      tenant_id: tenantId, 
      entity, 
      from: fromDate, 
      to: toDate,
      origin,
      destination,
      vehicle_id: vehicleId
    },
  });
  return response.data;
};

export const getVehicleMapping = async (
  tenantId: string = "FT"
): Promise<VehicleMappingResponse[]> => {
  const response = await api.get("/tenant-vehicle-mapping", {
    params: { tenant_id: tenantId },
  });
  return response.data;
};

export const getLspNames = async (
  tenantId: string = "FT"
): Promise<LspNamesResponse> => {
  const response = await api.get("/lsp/names", {
    params: { tenant_id: tenantId },
  });
  return response.data;
};

