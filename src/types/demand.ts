export interface LocationCompose {
  location_id: string;
  location_source: string;
  pincode: string;
  city: string;
  district: string;
  office: string;
  area_locality: string;
  division: string;
  state: string;
  country: string;
}

export type DemandStatus =
  | "PUBLISHED"
  | "HUMAN_REVIEW"
  | "FAILED"
  | string;

export interface DemandEntry {
  id: number;
  origin: string;
  destination: string;
  origin_compose: LocationCompose;
  destination_compose: LocationCompose;
  demand_src: string;
  source: string;
  vehicle_type: string;
  quantity: number;
  status: DemandStatus;
  created_at: string;
}

export interface LatestDemandsResponse {
  entries: DemandEntry[];
}


