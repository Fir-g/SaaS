import config from '../config';

const API_BASE_URL = config.service_url.API_BASE_URL;
console.log("API_BASE_URL", API_BASE_URL);
// Request interceptor - will be called with token from component
const requestInterceptor = (url: string, options: RequestInit = {}, token?: string | null, useBearerToken: boolean = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add existing headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }
  
  if (token) {
    if (useBearerToken) {
      // Use Bearer token authentication
      headers['authorization'] = `Bearer ${token}`;
      headers['accept'] = 'application/json, text/plain, */*';
      headers['accept-language'] = 'en-US,en;q=0.9';
      headers['origin'] = window.location.origin;
      headers['referer'] = window.location.origin + '/';
      headers['user-agent'] = navigator.userAgent;
    } else {
      // Use token header for inventory APIs
      headers['token'] = token;
    }
  }
  
  return {
    url,
    options: {
      ...options,
      headers,
    },
  };
};

// Response interceptor
const responseInterceptor = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized - redirect to Clerk sign-in
      // Clerk will handle the redirect automatically
      throw new Error('Please sign in again to continue');
    }
    
    // Don't throw technical errors, let the calling code handle gracefully
    return response;
  }
  
  return response;
};

// Centralized fetch with interceptors
export const apiFetch = async (url: string, options: RequestInit = {}, token?: string | null, useBearerToken: boolean = false) => {
  const { url: interceptedUrl, options: interceptedOptions } = requestInterceptor(url, options, token, useBearerToken);
    const response = await fetch(interceptedUrl, interceptedOptions);
    return await responseInterceptor(response);
};

// API Service class
export class ApiService {
  protected baseUrl = API_BASE_URL;
  
  // Always use proxy in development, direct URL only in production
  protected getApiUrl(endpoint: string): string {
    const appEnv = import.meta.env.VITE_APP_ENV;
    const isDevelopment = import.meta.env.DEV;
    // Use proxy for local development regardless of environment
    if (isDevelopment) {
      const url = `/api${endpoint}`;
      return url;
    } else if (appEnv === 'qa' || appEnv === 'production') {
      // Use direct API URLs for QA and production environments
      const url = `${this.baseUrl}${endpoint}`;
      return url;
    } else {
      // Fallback to direct API URL
      const url = `${this.baseUrl}${endpoint}`;
      return url;
    }
  }

  // Generic GET request
  async get<T>(endpoint: string, params?: Record<string, any>, token?: string | null, useBearerToken: boolean = false): Promise<T> {
    const apiUrl = this.getApiUrl(endpoint);
    // Handle both relative and absolute URLs
    let url: URL;
    if (apiUrl.startsWith('http')) {
      // Absolute URL - use as is
      url = new URL(apiUrl);
    } else {
      // Relative path - construct URL relative to current domain
      url = new URL(apiUrl, window.location.origin);
    }
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => 
        url.searchParams.append(key, String(value))
      );
    }
    
    const response = await apiFetch(url.toString(), {}, token, useBearerToken);
    return response.json();
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any, token?: string | null, useBearerToken: boolean = false): Promise<T> {
    const apiUrl = this.getApiUrl(endpoint);
    const url = apiUrl.startsWith('http') ? apiUrl : new URL(apiUrl, window.location.origin).toString();
    const response = await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token, useBearerToken);
    return response.json();
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any, token?: string | null): Promise<T> {
    const apiUrl = this.getApiUrl(endpoint);
    const url = apiUrl.startsWith('http') ? apiUrl : new URL(apiUrl, window.location.origin).toString();
    const response = await apiFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
    return response.json();
  }

  // Generic DELETE request
  async delete<T>(endpoint: string, token?: string | null): Promise<T> {
    const apiUrl = this.getApiUrl(endpoint);
    const url = apiUrl.startsWith('http') ? apiUrl : new URL(apiUrl, window.location.origin).toString();
    const response = await apiFetch(url, {
      method: 'DELETE',
    }, token);
    return response.json();
  }
}

// Inventory API methods
export interface InventoryParams {
  showInventory?: string; // 'live', 'prospects', 'inventory'
  pageNumber?: number;
  pageSize?: number;
  fleetOwner?: string;
  vehicleType?: string;
  performance?: string;
  origin_list?: string;
  destination_list?: string;
  status?: string;
  inventoryType?: string;
  distanceToDestination?: string;
  availabilityDate?: string;
  updatedBy?: string;
  userEmail?: string;
}

export interface InventoryItem {
  id: string;
  fleetOwner: string;
  fleetOwnerId: string;
  vehicleType: string;
  destination: string;
  performance: string;
  inventoryType: 'Live' | 'L12M' | undefined;
  status: string | undefined;
  vehicleNo: string;
  tripId: string;
  origin: string;
  eta: string;
  foNumber: string;
  onTrip: boolean;
  availabilityDate: string | null;
  currentRegion: string;
  currentState: string;
  originCluster: string;
  destinationCluster: string;
  distanceFromDestination: string;
}

export interface InventoryResponse {
  value: {
    content: InventoryItem[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    numberOfElements: number;
  };
  message?: string;
}

export interface ResponsePayload<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FleetOwnerOption {
  value: string;
  text: string;
  phoneNumber?: string;
}

export interface SupplierData {
  oldCompanyId: number;
  createdAt: number | null;
  branch_fteid: string | null;
  branch_name: string | null;
  company_fteid: string;
  company_name: string;
}

export interface SupplierResponse {
  success: boolean;
  value: SupplierData[];
}

export interface UserData {
  fteid: string;
  old_user_id: number;
  display_id: string;
  firstname: string;
  lastname: string;
  primary_country_code: number;
  primary_mobile_number: string;
  primary_mobile_number_validated: boolean;
  mobile_numbers: {
    list: Array<{
      country_code: number;
      mobile_number: string;
    }>;
  };
  email_address: string;
  email_address_validated: boolean;
  photo_url: string | null;
  last_eula_agreement_date: number;
  is_active: boolean;
  created_at: number;
  updated_at: number;
  is_integration_user: boolean;
  desk_fteids: string[];
  department: string | null;
  branch: string | null;
  company: {
    fteid: string;
    old_company_id: number;
    name: string;
    types: string[];
  };
  parent: {
    fteid: string;
    name: string;
  };
  desk_count: number;
}

export interface UserResponse {
  success: boolean;
  data: UserData[];
}

export interface PaginatedResponseDto {
  items: InventoryItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  totalLive: number;
  totalOnTrip: number;
  totalGold: number;
}

// Extend ApiService with inventory methods
export class InventoryApiService extends ApiService {
  
  async updateInventoryStatus(tripId: string, status: string, availabilityDates?: string[], token?: string | null, inventoryType?: string, itemData?: any): Promise<boolean> {
    try {
      let url: string;
      let requestBody: any;

      if (status === "Vehicle Available") {
        // Use new API for Vehicle Available status
        const userEmailParam = itemData?.updatedBy ? `&userEmail=${encodeURIComponent(itemData.updatedBy)}` : '';
        url = this.getApiUrl(`/phase-2/v1/trip-locations/status/add?tripId=${encodeURIComponent(tripId)}&inventoryType=${inventoryType}${userEmailParam}`);
        
        // Map table data to TripLocationMappingStatic payload structure
        requestBody = {
          tripId: tripId,
          status: status,
          vehicleNumber: itemData?.vehicleNo || '',
          origin: itemData?.origin || '',
          destination: itemData?.destination || '',
          foName: itemData?.fleetOwner || '',
          foNumber: itemData?.foNumber || '',
          foCompanyId: itemData?.fleetOwnerId || '',
          truckType: itemData?.vehicleType || '',
          originCluster: itemData?.originCluster || '',
          destinationCluster: itemData?.destinationCluster || '',
          inventoryType: inventoryType || 'live',
          grade: itemData?.performance || '',
          isActive: true,
          updatedBy: itemData?.updatedBy || '',
        };
        
        if (availabilityDates && availabilityDates.length > 0) {
          // Send as array of strings for both single and multiple dates
          requestBody.available_dates_list = availabilityDates;
        }

        // Include updatedBy in body if provided
        if (itemData?.updatedBy) {
          requestBody.updatedBy = itemData.updatedBy;
        }
      } else {
        // Use old API for all other statuses
        url = this.getApiUrl(`/phase-2/v1/trip-locations/status/update-status?tripId=${encodeURIComponent(tripId)}&status=${encodeURIComponent(status)}`);
        
        requestBody = { status };

        // Include updatedBy in body if provided
        if (itemData?.updatedBy) {
          requestBody.updatedBy = itemData.updatedBy;
        }
      }

      const response = await apiFetch(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }, token);

      return response.ok;
    } catch (error) {
      
      return false;
    }
  }

  async initiateCall(phoneNumber: string, fleetOwnerId: string, token?: string | null, userPhoneNumber?: string | null): Promise<boolean> {
    const apiUrl = this.getApiUrl(`/phase-2/telephony/service/initiate-call?source=ft-cm-dashboard`);
  
    const requestBody: any = {
      to: phoneNumber,
      receiver_id: fleetOwnerId
    };
    
    // Add user phone number as "from" parameter if provided
    if (userPhoneNumber) {
      requestBody.from = userPhoneNumber;
    }
  
    try {
      
      const response = await apiFetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }, token);
      
      return response.ok;
  
    } catch (error) {
      
      return false;
    }
  }

  async addManualInventory(inventoryData: {
    vehicle_no: string;
    origin: string;
    destination: string;
    origin_place_id: string;
    destination_place_id: string;
    fo_name: string;
    fo_number: string;
    fo_company_id: string;
    truck_type: string;
    vehicle_fteid: string;
    master_vehicle_fteid: string; 
    availability_date: string;
    available_date_list: string;
    user_email?: string;
  }, token?: string | null): Promise<boolean> {
    try {
      const response = await this.post<any>(`/phase-2/v1/trip-locations/add-inventory`, inventoryData, token);
      return true;
    } catch (error) {
      
      return false;
    }
  }



  async fetchFleetOwnerSuggestions(
    search: string, 
    page: number = 0, 
    token?: string | null
  ): Promise<{ 
    suppliers: Array<{ value: string; text: string; phoneNumber?: string }>;
    hasMore: boolean;
    totalPages: number;
  }> {
    if (!search || search.length < 3) return { suppliers: [], hasMore: false, totalPages: 0 };
    
    try {
      const pageSize = 10;
      const queryParams = new URLSearchParams({
        pg: page.toString(),
        ps: pageSize.toString(),
        supplier_id: search,
        phone: '',
        only_deleted: 'false',
        only_premium: 'false'
      });

      const data = await this.get<any>(`/phase-2/suppliers?${queryParams.toString()}`, undefined, token);
      
      if (data && data.success && data.value && Array.isArray(data.value)) {
        const suppliers = data.value.map((supplier: any) => ({
          value: supplier.company_fteid || supplier.id,
          text: supplier.company_name || supplier.name,
          phoneNumber: supplier.phone || supplier.phone_number
        }));

        // Calculate if there are more pages
        const totalPages = data.totalPages || Math.ceil((data.total || 0) / pageSize);
        const hasMore = page < totalPages - 1;

        return {
          suppliers,
          hasMore,
          totalPages
        };
      }
      
      return { suppliers: [], hasMore: false, totalPages: 0 };
    } catch (error) {
      
      return { suppliers: [], hasMore: false, totalPages: 0 };
    }
  }

  async fetchVehicleTypes(token?: string | null): Promise<Array<{ value: string; text: string }>> {
    try {
      const data = await this.get<any>(`/phase-2/vehicle_types`, undefined, token);
      if (data && data.value && Array.isArray(data.value)) {
        return data.value.map((item: any) => ({
          value: item.fteid,
          text: item.label
        }));
      }
      return [];
    } catch (error) {
      
      return [];
    }
  }

  async fetchOriginClusters(token?: string | null): Promise<Array<{ value: string; text: string }>> {
    try {
      const data = await this.get<any>(`/phase-2/supper_clusters`, undefined, token);
      if (data && data.value && Array.isArray(data.value)) {
        const uniqueClusters = Array.from(new Set(
          data.value
            .map((cluster: any) => cluster.super_cluster)
            .filter((name: string) => name && name.trim() !== '')
        ));
        return uniqueClusters.map((name: string) => ({
          value: name,
          text: name
        }));
      }
      return [];
    } catch (error) {
      
      return [];
    }
  }

  async fetchDestinationClusters(token?: string | null): Promise<Array<{ value: string; text: string }>> {
    try {
      const data = await this.get<any>(`/phase-2/supper_clusters`, undefined, token);
      if (data && data.value && Array.isArray(data.value)) {
        const uniqueClusters = Array.from(new Set(
          data.value
            .map((cluster: any) => cluster.super_cluster)
            .filter((name: string) => name && name.trim() !== '')
        ));
        return uniqueClusters.map((name: string) => ({
          value: name,
          text: name
        }));
      }
      return [];
    } catch (error) {
      
      return [];
    }
  }

  async placeAutocomplete(searchTerm: string, token?: string | null): Promise<Array<{ description: string; place_id: string }>> {
    try {
      // Use the existing cluster API to get place suggestions
      const data = await this.get<any>(`/phase-2/supper_clusters`, undefined, token);
      
      if (data && data.value && Array.isArray(data.value)) {
        // Filter clusters that match the search term
        const matchingClusters = data.value.filter((cluster: any) => 
          cluster.super_cluster && 
          cluster.super_cluster.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Return unique clusters with place_id as the cluster name
        const uniqueClusters = Array.from(new Set(
          matchingClusters.map((cluster: any) => cluster.super_cluster)
        ));
        
        return uniqueClusters.map((clusterName: string) => ({
          description: clusterName,
          place_id: clusterName // Use cluster name as place_id for now
        }));
      }
      return [];
    } catch (error) {
      
      return [];
    }
  }

  async getPlaces(input: string, token?: string | null): Promise<Array<{ description: string; place_id: string }>> {
    if (!input || input.length < 3) return [];
    try {
      const data = await this.get<any>(`/location-based-service/v1/place/autocomplete?input=${encodeURIComponent(input)}`, undefined, token);
      if (data && data.data && Array.isArray(data.data.predictions)) {
        return data.data.predictions.map((item: any) => ({
          description: item.description,
          place_id: item.place_id,
        }));
      } else {
        return [];
      }
    } catch (error) {
      
      return [];
    }
  }

  async fetchPsaInventoryDetails(
    month: number, 
    year: number, 
    token?: string | null,
    filters?: {
      psaFteid?: string;
      originCluster?: string;
      destinationCluster?: string;
      inventorySourceType?: string;
      fleetOwners?: string;
      vehicleType?: string;
    }
  ): Promise<Array<{ countOfVehicleAvailableMarked: number; createdAt: number }>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('month', month.toString());
      queryParams.append('year', year.toString());
      
      // Add filter parameters based on API specification
      if (filters?.psaFteid) {
        queryParams.append('psaFteid', filters.psaFteid);
      }
      if (filters?.originCluster) {
        queryParams.append('originCluster', filters.originCluster);
      }
      if (filters?.destinationCluster) {
        queryParams.append('destinationCluster', filters.destinationCluster);
      }
      if (filters?.inventorySourceType) {
        queryParams.append('inventorySourceType', filters.inventorySourceType);
      }
      if (filters?.fleetOwners) {
        queryParams.append('fleetOwners', filters.fleetOwners);
      }
      if (filters?.vehicleType) {
        queryParams.append('vehicleType', filters.vehicleType);
      }

      const data = await this.get<any>(`/phase-2/v1/trip-locations/psa_inventory_details?${queryParams.toString()}`, undefined, token);
      
      if (data && data.success && data.value && Array.isArray(data.value)) {
        return data.value;
      } else {
        return [];
      }
    } catch (error) {
      
      return [];
    }
  }

  async fetchPsaUsers(token?: string | null): Promise<Array<{ id: string; name: string; fteid: string }>> {
    try {
      const data = await this.get<any>(`/eqs/v1/user?filter=%7B%22desk_fteids%22:%22DSK-ebab03b9-0f42-4ea8-9f36-6c3a24253269%22%7D&page=1&size=1000`, undefined, token);
      
      if (data && data.value && Array.isArray(data.value)) {
        return data.value.map((user: any) => ({
          id: user.id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          fteid: user.fteid
        }));
      }
      return [];
    } catch (error) {
      
      return [];
    }
  }

  async fetchUserByEmail(email: string, token?: string | null): Promise<UserResponse> {
    try {
      // URL encode the email for the filter
      const emailFilter = encodeURIComponent(JSON.stringify({ email_address: email }));
      const data = await this.get<UserResponse>(`/eqs/v1/user?filter=${emailFilter}`, undefined, token, true);
      
      return data;
    } catch (error) {
      
      return {
        success: false,
        data: []
      };
    }
  }

  async createPsaClusterMapping(
    email: string, 
    originClusters: string[], 
    destinationClusters: string[], 
    token?: string | null
  ): Promise<ResponsePayload<any>> {
    try {
      const payload = {
        email: email,
        originClusters: originClusters.join(','),
        destinationClusters: destinationClusters.join(',')
      };

      const response = await this.post<ResponsePayload<any>>('/phase-2/psa-cluster-mappings', payload, token, false);
      return response;
    } catch (error) {
      
      return {
        success: false,
        data: null,
        message: 'Failed to create PSA cluster mapping'
      };
    }
  }

  async deleteClustersFromPsaMapping(
    email: string,
    clustersToDelete: string,
    clusterType: 'origin' | 'destination',
    token?: string | null
  ): Promise<ResponsePayload<any>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('clustersToDelete', clustersToDelete);
      queryParams.append('clusterType', clusterType);
      
      const response = await this.delete<ResponsePayload<any>>(`/phase-2/psa-cluster-mappings/${encodeURIComponent(email)}/clusters?${queryParams.toString()}`, token);
      return response;
    } catch (error) {
      
      return {
        success: false,
        data: null,
        message: 'Failed to delete clusters from PSA mapping'
      };
    }
  }

  async getPsaClusterMappingByEmail(
    email: string,
    token?: string | null
  ): Promise<{ success: boolean; value?: any; message?: string }> {
    try {
      const response = await this.get<{ success: boolean; value?: any; message?: string }>(`/phase-2/psa-cluster-mappings/${encodeURIComponent(email)}`, undefined, token, false);
      return response;
    } catch (error) {
      
      return {
        success: false,
        message: 'Failed to fetch PSA cluster mapping'
      };
    }
  }

  async getAllPsaClusterMappings(
    token?: string | null
  ): Promise<{ success: boolean; value?: any[]; message?: string }> {
    try {
      const response = await this.get<{ success: boolean; value?: any[]; message?: string }>(`/phase-2/psa-cluster-mappings/all`, undefined, token, false);
      return response;
    } catch (error) {
      
      return {
        success: false,
        message: 'Failed to fetch all PSA cluster mappings'
      };
    }
  }

  async fetchInventory(params: InventoryParams, token?: string | null): Promise<ResponsePayload<PaginatedResponseDto>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Required parameters
      if (params.showInventory !== undefined) {
        queryParams.append('showInventory', params.showInventory);
      }
      if (params.pageNumber !== undefined) {
        queryParams.append('pageNumber', params.pageNumber.toString());
      }
      if (params.pageSize !== undefined) {
        queryParams.append('pageSize', params.pageSize.toString());
      }
      
      // Optional filters
      if (params.fleetOwner) queryParams.append('fleetOwner', params.fleetOwner);
      if (params.vehicleType) queryParams.append('vehicleType', params.vehicleType);
      if (params.performance) queryParams.append('performance', params.performance);
      if (params.origin_list) queryParams.append('origin_list', params.origin_list);
      if (params.destination_list) queryParams.append('destination_list', params.destination_list);
      if (params.status) queryParams.append('status', params.status);
      if (params.inventoryType) queryParams.append('inventoryType', params.inventoryType);
      if (params.availabilityDate) queryParams.append('availabilityDate', params.availabilityDate);
      if (params.distanceToDestination) queryParams.append('destination_distance', params.distanceToDestination);
      if (params.userEmail) queryParams.append('userEmail', params.userEmail);

      // Use the get method to ensure proper URL construction
      const data: InventoryResponse = await this.get<InventoryResponse>(`/phase-2/v1/trip-locations/inventory?${queryParams.toString()}`, undefined, token);
      

      if (!data.value?.content) {
        throw new Error(data.message || 'Invalid API response structure');
      }

      const items = this.transformInventoryData(data.value.content);
      const total = data.value.totalElements || items.length;
      const totalPages = data.value.totalPages || Math.ceil(total / (params.pageSize || 10));
      const currentPage = data.value.pageNumber || params.pageNumber || 0;
      const pageSize = data.value.pageSize || params.pageSize || 10;

      

      return {
        success: true,
        data: {
          items,
          total,
          page: currentPage,
          size: pageSize,
          totalPages,
          totalLive: items.filter(item => item.inventoryType === 'Live').length,
          totalOnTrip: items.filter(item => item.onTrip).length,
          totalGold: items.filter(item => item.performance === 'GOLD').length
        }
      };
    } catch (error) {
      
      return {
        success: false,
        data: {
          items: [],
          total: 0,
          page: params.pageNumber || 0,
          size: params.pageSize || 10,
          totalPages: 0,
          totalLive: 0,
          totalOnTrip: 0,
          totalGold: 0
        },
        message: 'Something went wrong while loading inventory data. Please try again.'
      };
    }
  }

  private transformInventoryData(content: any[]): InventoryItem[] {
    
    
    const items = content.map((item: any) => {
      // Safely handle availability date conversion
      let availabilityDate: string | null = null;
      try {
        if (item.availabilityDate) {
          // Helper function to convert epoch to IST date string
          const epochToISTDate = (epochValue: string | number): string => {
            const timestamp = typeof epochValue === 'string' ? parseInt(epochValue) : epochValue;
            if (isNaN(timestamp)) return epochValue.toString();
            
            // Create date from epoch timestamp (epoch is already in UTC)
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return epochValue.toString();
            
            // For epoch timestamps, we need to format directly in IST
            // Use toLocaleDateString with IST timezone
            return date.toLocaleDateString('en-CA', { 
              timeZone: 'Asia/Kolkata',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }); // Returns YYYY-MM-DD format
          };

          // Check if it's a comma-separated string (multiple dates)
          if (typeof item.availabilityDate === 'string' && item.availabilityDate.includes(',')) {
            // For multiple dates, parse each date individually
            const dateStrings = item.availabilityDate.split(',').map((d: string) => d.trim());
            const correctedDates = dateStrings.map((dateStr: string) => {
              // Check if it's an epoch timestamp (numeric string)
              if (/^\d+$/.test(dateStr)) {
                return epochToISTDate(dateStr);
              } else {
                                 // Try parsing as regular date string
                 const date = new Date(dateStr);
                 if (!isNaN(date.getTime())) {
                   // Format in IST timezone
                   return date.toLocaleDateString('en-CA', { 
                     timeZone: 'Asia/Kolkata',
                     year: 'numeric',
                     month: '2-digit',
                     day: '2-digit'
                   });
                 }
                return dateStr; // Return original if parsing fails
              }
            });
            availabilityDate = correctedDates.join(',');
          } else {
            // Single date - check if it's epoch or regular date
            if (typeof item.availabilityDate === 'string' && /^\d+$/.test(item.availabilityDate)) {
              // It's an epoch timestamp
              availabilityDate = epochToISTDate(item.availabilityDate);
                         } else {
               // Try parsing as regular date string
               const date = new Date(item.availabilityDate);
               if (!isNaN(date.getTime())) {
                 // Format in IST timezone
                 availabilityDate = date.toLocaleDateString('en-CA', { 
                   timeZone: 'Asia/Kolkata',
                   year: 'numeric',
                   month: '2-digit',
                   day: '2-digit'
                 });
               } else {
                 // Invalid date, set to null
                 availabilityDate = null;
               }
             }
          }
        } else {
          // No availability date, set to null
          availabilityDate = null;
        }
      } catch (error) {
        
        availabilityDate = null;
      }

      return {
        id: item.tripId || item.id,
        fleetOwner: item.fleetOwner || item.foName,
        fleetOwnerId: item.foCompanyId || item.fleetOwnerId,
        vehicleType: item.vehicleType || item.truckType || 'N/A',
        destination: item.destination,
        performance: item.performance || 'SILVER',
        inventoryType: item.inventoryType as "Live" | "L12M",
        status: item.status,
        vehicleNo: item.vehicleNumber || item.vehicleNo,
        tripId: item.tripId,
        origin: item.origin,
        eta: item.eta,
        foNumber: item.foNumber,
        onTrip: item.inventoryType === "Live" || false,
        availabilityDate: availabilityDate || null,
        currentRegion: item.originCluster || 'N/A',
        currentState: item.destinationCluster || 'N/A',
        originCluster: item.originCluster || 'N/A',
        destinationCluster: item.destinationCluster || 'N/A',
        distanceFromDestination: item.distanceFromDestination || "N/A",
        updatedBy: item.updatedBy || 'N/A',
      };
    });
    

    
    return items;
  }
}

// Export singleton instance
export const apiService = new InventoryApiService(); 