import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, AlertCircle, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ManualInventoryModal from '@/components/modals/ManualInventoryModal';
import { apiService, InventoryParams, InventoryItem as ApiInventoryItem } from '@/services/api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useOrganization, useUser } from '@clerk/clerk-react';

interface InventoryItem {
  id: string;
  tripId: string;
  fleetOwner: string;
  vehicleNo: string;
  vehicleType: string;
  origin: string;
  destination: string;
  destinationCluster: string;
  originCluster: string;
  performance: string;
  inventoryType: string | undefined;
  status: string | undefined;
  foNumber: string;
  fleetOwnerId: string;
  eta?: number;
  distanceFromDestination?: string;
  updatedBy?: string;
  addedDate?: string;
  capacity?: string;
  rate?: string;
  availabilityDate?: string | null;
}

interface InventoryListTabProps {
  vehicleTypeOptions: Array<{ value: string; text: string; masterFteid?: string }>;
  originClusterOptions: Array<{ value: string; text: string }>;
  destinationClusterOptions: Array<{ value: string; text: string }>;
  token: string;
  onManualInventoryAdd: (inventoryData: {
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
  }) => Promise<void>;
}

const InventoryListTab: React.FC<InventoryListTabProps> = ({ 
  vehicleTypeOptions, 
  originClusterOptions, 
  destinationClusterOptions,
  token,
  onManualInventoryAdd
}) => {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [inventoryView, setInventoryView] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [fleetOwnerFilter, setFleetOwnerFilter] = useState<string>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  const [inventoryTypeFilter, setInventoryTypeFilter] = useState<string>('all');

  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedOriginClusters, setSelectedOriginClusters] = useState<string[]>([]);
  const [selectedDestinationClusters, setSelectedDestinationClusters] = useState<string[]>([]);
  const [selectedAvailableDate, setSelectedAvailableDate] = useState<Date | null>(null);
  const { toast } = useToast();

  // API data state
  const [apiData, setApiData] = useState<ApiInventoryItem[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filter data state
  const [fleetOwnerOptions, setFleetOwnerOptions] = useState<Array<{ value: string; text: string }>>([]);
  const [fleetOwnerSearchTerm, setFleetOwnerSearchTerm] = useState('');
  const [fleetOwnerSearchTimeout, setFleetOwnerSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Origin and Destination Cluster Search States
  const [originClusterSearchTerm, setOriginClusterSearchTerm] = useState<string>('');
  
  // Place autocomplete states
  const [originSearchTerm, setOriginSearchTerm] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<Array<{ description: string; place_id: string; main_text?: string }>>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [destinationSearchTerm, setDestinationSearchTerm] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState<Array<{ description: string; place_id: string; main_text?: string }>>([]);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [originTimeout, setOriginTimeout] = useState<NodeJS.Timeout | null>(null);
  const [destinationTimeout, setDestinationTimeout] = useState<NodeJS.Timeout | null>(null);
  const [originClusterSearchOptions, setOriginClusterSearchOptions] = useState<Array<{ value: string; text: string }>>([]);
  const [originClusterSearchTimeout, setOriginClusterSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [destinationClusterSearchTerm, setDestinationClusterSearchTerm] = useState<string>('');
  const [destinationClusterSearchOptions, setDestinationClusterSearchOptions] = useState<Array<{ value: string; text: string }>>([]);
  const [destinationClusterSearchTimeout, setDestinationClusterSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // State for PSA inventory details
  const [psaInventoryDetails, setPsaInventoryDetails] = useState<Array<{ countOfVehicleAvailableMarked: number; createdAt: number }>>([]);
  const [psaInventoryLoading, setPsaInventoryLoading] = useState(false);

  // State for PSA inventory filters
  const [psaFiltersVisible, setPsaFiltersVisible] = useState(true);
  const [psaUsers, setPsaUsers] = useState<Array<{ id: string; name: string; fteid: string; email: string }>>([]);
  const [selectedPsaId, setSelectedPsaId] = useState<string>('all');
  const [selectedPsaEmail, setSelectedPsaEmail] = useState<string>('all');
  const [psaUsersLoading, setPsaUsersLoading] = useState(false);
  const [psaEmailSearchTerm, setPsaEmailSearchTerm] = useState<string>('');

  // Logged-in PSA user (for updatedBy)
  const { user } = useUser();

  // Clerk organization hook for PSA agents
  const { memberships } = useOrganization({ 
    memberships: { 
      infinite: true,
      pageSize: 100 // Increase page size to get more members
    } 
  });

  // Function to fetch PSA users from Clerk memberships
  const fetchPsaUsers = async () => {
    setPsaUsersLoading(true);
    try {
      
      
      // Ensure all pages are loaded when using infinite memberships
      try {
        const memAny: any = memberships as any;
        let safetyCounter = 0;
        while (memAny && memAny.hasNextPage && typeof memAny.fetchNext === 'function' && safetyCounter < 20) {
          safetyCounter += 1;
          // eslint-disable-next-line no-await-in-loop
          await memAny.fetchNext();
        }
      } catch (pagingErr) {}

      const agents: Array<{ id: string; name: string; fteid: string; email: string }> = (memberships?.data || []).map((m: any) => {
        
        const agent = {
          id: m.publicUserData?.userId,
          email: m.publicUserData?.identifier,
          name: `${m.publicUserData?.firstName || ''} ${m.publicUserData?.lastName || ''}`.trim() || m.publicUserData?.identifier,
          fteid: m.publicUserData?.userId || '', // Use userId as fteid for now
        };
        return agent;
      }).filter(a => {
        const isValid = !!a.id && !!a.email;
        return isValid;
      });
      
      setPsaUsers(agents);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to load organization members.",
        variant: "destructive",
      });
    } finally {
      setPsaUsersLoading(false);
    }
  };

  // Email-only filtered and alphabetically sorted PSA options
  const psaOptions = useMemo(() => {
    const sorted = [...psaUsers].sort((a, b) => (a.email || '').toLowerCase().localeCompare((b.email || '').toLowerCase()));
    const term = psaEmailSearchTerm.trim().toLowerCase();
    if (!term) return sorted;
    return sorted.filter(u => (u.email || '').toLowerCase().includes(term));
  }, [psaUsers, psaEmailSearchTerm]);
  
  // Calendar filter states
  const [calendarFleetOwnerFilter, setCalendarFleetOwnerFilter] = useState<string>('all');
  const [calendarVehicleTypeFilter, setCalendarVehicleTypeFilter] = useState<string>('all');
  const [calendarOriginClusterFilter, setCalendarOriginClusterFilter] = useState<string>('all');
  const [calendarDestinationClusterFilter, setCalendarDestinationClusterFilter] = useState<string>('all');
  const [calendarInventorySourceTypeFilter, setCalendarInventorySourceTypeFilter] = useState<string>('all');
  
  // Manual inventory modal state
  const [manualInventoryModalOpen, setManualInventoryModalOpen] = useState(false);

  // Handle manual inventory add
  const handleManualInventoryAdd = async (inventoryData: {
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
  }) => {
    const userEmail = user?.primaryEmailAddress?.emailAddress || (selectedPsaEmail !== 'all' ? selectedPsaEmail : undefined);
    const payload = { ...inventoryData, user_email: userEmail } as any;
    await onManualInventoryAdd(payload);
    setManualInventoryModalOpen(false);
    // Refresh the inventory data
    fetchInventoryData();
  };

  // Fetch inventory data from API
  const fetchInventoryData = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    setData([]);
    
    try {
      const params = {
        showInventory: 'inventory',
        pageNumber: currentPage,
        pageSize: 20,
        fleetOwner: fleetOwnerFilter !== 'all' ? fleetOwnerFilter : undefined,
        vehicleType: vehicleTypeFilter !== 'all' ? vehicleTypeFilter : undefined,
        performance: performanceFilter !== 'all' ? performanceFilter : undefined,
        origin_list: selectedOriginClusters.length > 0 ? selectedOriginClusters.join(',') : undefined,
        destination_list: selectedDestinationClusters.length > 0 ? selectedDestinationClusters.join(',') : undefined,
        inventoryType: inventoryTypeFilter !== 'all' ? 
          (inventoryTypeFilter === 'Live' ? 'live' : 
           inventoryTypeFilter === 'Prospects' ? 'L12M' : 
           inventoryTypeFilter === 'Manual' ? 'manual' : undefined) : undefined,
        availabilityDate: selectedAvailableDate ? format(selectedAvailableDate, 'yyyy-MM-dd') : undefined,
        userEmail: selectedPsaEmail !== 'all' ? selectedPsaEmail : undefined,
      };

      // Debug: Log the API parameters including userEmail
      console.log('Current selectedPsaEmail state:', selectedPsaEmail);
      console.log('Inventory API Parameters:', {
        ...params,
        userEmail: selectedPsaEmail !== 'all' ? selectedPsaEmail : 'Not selected'
      });

      const response = await apiService.fetchInventory(params, token);
      
      if (response.success) {
        setApiData(response.data.items);
        setTotalItems(response.data.total);
        setTotalPages(response.data.totalPages);
        
        const transformedData: InventoryItem[] = response.data.items.map((item: any) => ({
          id: item.id,
          tripId: item.tripId,
          fleetOwner: item.fleetOwner || item.foName || 'N/A',
          vehicleNo: item.vehicleNo || item.vehicleNumber || 'N/A',
          vehicleType: item.vehicleType || item.truckType || 'N/A',
          origin: item.origin,
          destination: item.destination,
          destinationCluster: item.destinationCluster,
          originCluster: item.originCluster,
          performance: item.performance || 'SILVER',
          inventoryType: item.inventoryType,
          status: item.status,
          availabilityDate: item.availabilityDate || null,
          foNumber: item.foNumber || item.phoneNumber || item.phone || 'N/A',
          fleetOwnerId: item.fleetOwnerId || item.foCompanyId || 'N/A',
          eta: item.eta ? Number(item.eta) : undefined,
          distanceFromDestination: item.distanceFromDestination,
          updatedBy: item.updatedBy  || undefined,
          addedDate: undefined,
          capacity: undefined,
          rate: undefined,
        }));

        setData(transformedData);
      } else {
        setApiError('Something went wrong while loading data');
        setData([]);
        toast({
          title: "Something went wrong",
          description: "Unable to load inventory data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setApiError('Something went wrong while loading data');
      setData([]);
      toast({
        title: "Something went wrong",
        description: "Unable to load inventory data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApiLoading(false);
      setLoading(false);
    }
  }, [currentPage, fleetOwnerFilter, vehicleTypeFilter, performanceFilter, inventoryTypeFilter, selectedOriginClusters, selectedDestinationClusters, selectedAvailableDate, selectedPsaEmail, toast, token]);

  // Fetch inventory data with a specific date (for immediate calendar clicks)
  const fetchInventoryDataWithDate = useCallback(async (date: Date) => {
    setApiLoading(true);
    setApiError(null);
    setData([]);
    
    try {
      const params = {
        showInventory: 'inventory',
        pageNumber: currentPage,
        pageSize: 20,
        fleetOwner: fleetOwnerFilter !== 'all' ? fleetOwnerFilter : undefined,
        vehicleType: vehicleTypeFilter !== 'all' ? vehicleTypeFilter : undefined,
        performance: performanceFilter !== 'all' ? performanceFilter : undefined,
        origin_list: selectedOriginClusters.length > 0 ? selectedOriginClusters.join(',') : undefined,
        destination_list: selectedDestinationClusters.length > 0 ? selectedDestinationClusters.join(',') : undefined,
        inventoryType: inventoryTypeFilter !== 'all' ? 
          (inventoryTypeFilter === 'Live' ? 'live' : 
           inventoryTypeFilter === 'Prospects' ? 'L12M' : 
           inventoryTypeFilter === 'Manual' ? 'manual' : undefined) : undefined,
        availabilityDate: format(date, 'yyyy-MM-dd'),
        userEmail: selectedPsaEmail !== 'all' ? selectedPsaEmail : undefined,
      };

    

      const response = await apiService.fetchInventory(params, token);
      
      if (response.success) {
        setApiData(response.data.items);
        setTotalItems(response.data.total);
        setTotalPages(response.data.totalPages);
        
        const transformedData: InventoryItem[] = response.data.items.map((item: any) => ({
          id: item.id,
          tripId: item.tripId,
          fleetOwner: item.fleetOwner || item.foName || 'N/A',
          vehicleNo: item.vehicleNo || item.vehicleNumber || 'N/A',
          vehicleType: item.vehicleType || item.truckType || 'N/A',
          origin: item.origin,
          destination: item.destination,
          destinationCluster: item.destinationCluster,
          originCluster: item.originCluster,
          performance: item.performance || 'SILVER',
          inventoryType: item.inventoryType,
          status: item.status,
          availabilityDate: item.availabilityDate || null,
          foNumber: item.foNumber || item.phoneNumber || item.phone || 'N/A',
          fleetOwnerId: item.fleetOwnerId || item.foCompanyId || 'N/A',
          eta: item.eta ? Number(item.eta) : undefined,
          distanceFromDestination: item.distanceFromDestination,
          psaAgent: item.psaAgent || undefined,
          psaAgentName: item.psaAgentName || item.psaName || undefined,
          psaAgentEmail: item.psaAgentEmail || item.userEmail || item.psaEmail || undefined,
          addedDate: undefined,
          capacity: undefined,
          rate: undefined,
        }));

        setData(transformedData);
      } else {
        setApiError('Something went wrong while loading data');
        setData([]);
        toast({
          title: "Something went wrong",
          description: "Unable to load inventory data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setApiError('Something went wrong while loading data');
      setData([]);
      toast({
        title: "Something went wrong",
        description: "Unable to load inventory data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApiLoading(false);
      setLoading(false);
    }
  }, [currentPage, fleetOwnerFilter, vehicleTypeFilter, performanceFilter, inventoryTypeFilter, selectedOriginClusters, selectedDestinationClusters, selectedAvailableDate, selectedPsaEmail, toast, token]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // Fetch PSA users when memberships are available
  useEffect(() => {
    if (memberships?.data && memberships.data.length > 0) {
      fetchPsaUsers();
    } else {
      
    }
  }, [memberships?.data?.length]);

  // Fallback: Fetch PSA users from API if Clerk fails
  const fetchPsaUsersFromAPI = async () => {
    setPsaUsersLoading(true);
    try {
      const users = await apiService.fetchPsaUsers(token);
      
      // Ensure each user has an email field; fall back to identifier if needed
      const normalizedUsers = (users || []).map((u: any) => ({
        id: u.id || u.userId,
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || u.identifier,
        fteid: u.fteid || u.id || u.userId || '',
        email: u.email || u.identifier || '',
      })).filter((u: any) => u.id && u.email);
      setPsaUsers(normalizedUsers);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to fetch PSA users from API",
        variant: "destructive",
      });
    } finally {
      setPsaUsersLoading(false);
    }
  };

  // Debug: Log when PSA users are updated
  useEffect(() => {}, [psaUsers, selectedPsaEmail]);

  // Debug: Log filter changes
  useEffect(() => {}, [fleetOwnerFilter, vehicleTypeFilter, performanceFilter, inventoryTypeFilter, selectedPsaEmail, selectedOriginClusters, selectedDestinationClusters, selectedAvailableDate]);

  // Specific effect for vehicle type filter changes
  useEffect(() => {
    console.log('Vehicle type filter changed to:', vehicleTypeFilter);
    if (vehicleTypeFilter !== 'all') {
      console.log('Triggering API call for vehicle type filter change');
      fetchInventoryData();
    }
  }, [vehicleTypeFilter, fetchInventoryData]);

  // Fetch PSA inventory details when calendar view is active and date changes
  useEffect(() => {
    if (inventoryView === 'calendar' && selectedDate) {
      const month = selectedDate.getMonth() + 1; // getMonth() returns 0-11
      const year = selectedDate.getFullYear();
      fetchPsaInventoryDetails(month, year);
    }
  }, [inventoryView, selectedDate]);

  // Debug: Log every render
  
  console.log('Vehicle type options available:', vehicleTypeOptions.length, vehicleTypeOptions);

  // Debug: Log state changes
  useEffect(() => {
    console.log('=== STATE CHANGE DETECTED ===');
    console.log('Filter states changed:', {
      fleetOwnerFilter,
      vehicleTypeFilter,
      inventoryTypeFilter,
      selectedPsaEmail,
      selectedOriginClusters,
      selectedDestinationClusters
    });
    console.log('=== END STATE CHANGE ===');
  }, [fleetOwnerFilter, vehicleTypeFilter, inventoryTypeFilter, selectedPsaEmail, selectedOriginClusters, selectedDestinationClusters]);

  // Debug: Log every filter state change individually
  useEffect(() => {
    console.log('Fleet owner filter changed to:', fleetOwnerFilter);
  }, [fleetOwnerFilter]);

  useEffect(() => {
    console.log('Vehicle type filter changed to:', vehicleTypeFilter);
  }, [vehicleTypeFilter]);

  useEffect(() => {
    console.log('Inventory type filter changed to:', inventoryTypeFilter);
  }, [inventoryTypeFilter]);

  useEffect(() => {
    console.log('Origin clusters changed to:', selectedOriginClusters);
  }, [selectedOriginClusters]);

  useEffect(() => {
    console.log('Destination clusters changed to:', selectedDestinationClusters);
  }, [selectedDestinationClusters]);

  // Fetch PSA inventory details when filters change in calendar view
  useEffect(() => {
    console.log('useEffect triggered - inventoryView:', inventoryView, 'filters:', {
      fleetOwnerFilter,
      vehicleTypeFilter,
      inventoryTypeFilter,
      selectedPsaEmail,
      selectedOriginClusters,
      selectedDestinationClusters
    });
    
    if (inventoryView === 'calendar') {
      let month: number, year: number;
      
      if (selectedDate) {
        month = selectedDate.getMonth() + 1; // getMonth() returns 0-11
        year = selectedDate.getFullYear();
      } else {
        // Use current month/year if no date is selected
        const now = new Date();
        month = now.getMonth() + 1;
        year = now.getFullYear();
      }
      
      console.log('Calendar filters changed, fetching PSA inventory details with filters:', {
        month,
        year,
        fleetOwnerFilter,
        vehicleTypeFilter,
        inventoryTypeFilter,
        selectedPsaEmail,
        selectedOriginClusters,
        selectedDestinationClusters
      });
      fetchPsaInventoryDetails(month, year);
    }
  }, [inventoryView, selectedDate, fleetOwnerFilter, vehicleTypeFilter, inventoryTypeFilter, selectedPsaEmail, selectedOriginClusters, selectedDestinationClusters, calendarFleetOwnerFilter, calendarVehicleTypeFilter, calendarOriginClusterFilter, calendarDestinationClusterFilter, calendarInventorySourceTypeFilter]);

  // Function to fetch PSA inventory details
  const fetchPsaInventoryDetails = useCallback(async (month: number, year: number) => {
    console.log('=== fetchPsaInventoryDetails called ===');
    console.log('Parameters:', { month, year });
    setPsaInventoryLoading(true);
    try {
      // Map inventory source type to correct API parameter values
      const getInventorySourceTypeValue = (filterValue: string) => {
        switch (filterValue) {
          case 'Live':
            return 'live';
          case 'Prospects':
            return 'L12M';
          case 'Manual':
            return 'manual';
          default:
            return undefined;
        }
      };

      // Use calendar filter states when in calendar view, otherwise use main filter states
      const filters = {
        psaFteid: selectedPsaEmail === 'all' ? undefined : selectedPsaEmail,
        originCluster: inventoryView === 'calendar' 
          ? (calendarOriginClusterFilter === 'all' ? undefined : calendarOriginClusterFilter)
          : (selectedOriginClusters.length > 0 ? selectedOriginClusters.join(',') : undefined),
        destinationCluster: inventoryView === 'calendar'
          ? (calendarDestinationClusterFilter === 'all' ? undefined : calendarDestinationClusterFilter)
          : (selectedDestinationClusters.length > 0 ? selectedDestinationClusters.join(',') : undefined),
        inventorySourceType: inventoryView === 'calendar'
          ? (calendarInventorySourceTypeFilter === 'all' ? undefined : getInventorySourceTypeValue(calendarInventorySourceTypeFilter))
          : (inventoryTypeFilter === 'all' ? undefined : getInventorySourceTypeValue(inventoryTypeFilter)),
        fleetOwners: inventoryView === 'calendar'
          ? (calendarFleetOwnerFilter === 'all' ? undefined : calendarFleetOwnerFilter)
          : (fleetOwnerFilter === 'all' ? undefined : fleetOwnerFilter),
        vehicleType: inventoryView === 'calendar'
          ? (calendarVehicleTypeFilter === 'all' ? undefined : calendarVehicleTypeFilter)
          : (vehicleTypeFilter === 'all' ? undefined : vehicleTypeFilter),
      };

      // Debug: Log the PSA inventory details filters
      console.log('PSA Inventory Details API Parameters:', { month, year, filters });
      console.log('Calling API: /v1/trip-locations/psa_inventory_details');
      
      const details = await apiService.fetchPsaInventoryDetails(month, year, token, filters);
      console.log('PSA Inventory Details API Response:', details);
      setPsaInventoryDetails(details);
    } catch (error) {
      console.error('Error fetching PSA inventory details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch PSA inventory details",
        variant: "destructive",
      });
    } finally {
      setPsaInventoryLoading(false);
    }
  }, [selectedPsaId, selectedPsaEmail, selectedOriginClusters, selectedDestinationClusters, inventoryTypeFilter, fleetOwnerFilter, vehicleTypeFilter, calendarFleetOwnerFilter, calendarVehicleTypeFilter, calendarOriginClusterFilter, calendarDestinationClusterFilter, calendarInventorySourceTypeFilter, inventoryView, token, toast]);

  // Fetch PSA inventory details when calendar view is first loaded
  useEffect(() => {
    if (inventoryView === 'calendar') {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      console.log('Calendar view loaded, fetching PSA inventory details for current month:', { month, year });
      fetchPsaInventoryDetails(month, year);
    }
  }, [inventoryView, fetchPsaInventoryDetails]);

  // Debug: Log when calendar view is switched
  useEffect(() => {
    console.log('Inventory view changed to:', inventoryView);
    if (inventoryView === 'calendar') {
      console.log('Switched to calendar view - PSA API should be called');
    }
  }, [inventoryView]);

  const getPerformanceBadgeVariant = (performance: string) => {
    switch (performance) {
      case 'GOLD': return 'default';
      case 'SILVER': return 'secondary';
      case 'RED': return 'destructive';
      default: return 'outline';
    }
  };

  const getInventoryTypeBadgeVariant = (type: string) => {
    return type === 'Live' ? 'default' : 'secondary';
  };

  const getInventoryTypeDisplayValue = (type: string | undefined) => {
    if (!type) return 'N/A';
    switch (type.toLowerCase()) {
      case 'live':
        return 'Live';
      case 'l12m':
        return 'Prospects';
      case 'manual':
        return 'Manual';
      default:
        return type;
    }
  };

  const formatAvailabilityDates = (dateString: string | null) => {
    if (!dateString || dateString === '-' || dateString === 'null') return 'N/A';
    
    if (dateString.includes(',')) {
      const dates = dateString.split(',').map(date => date.trim());
      
      const formattedDates = dates.map(date => {
        // Check if it's an epoch timestamp (numeric string)
        if (/^\d+$/.test(date)) {
          const timestamp = parseInt(date);
          if (isNaN(timestamp)) return date;
          
                     // Create date from epoch timestamp
           const dateObj = new Date(timestamp);
           if (isNaN(dateObj.getTime())) return date;
           
           // Format in IST timezone
           return dateObj.toLocaleDateString('en-GB', {
             timeZone: 'Asia/Kolkata',
             day: '2-digit',
             month: '2-digit',
             year: 'numeric',
           });
        } else {
                     // Try parsing as regular date string
           const dateObj = new Date(date);
           if (isNaN(dateObj.getTime())) {
             return date;
           }
           // Format in IST timezone
           return dateObj.toLocaleDateString('en-GB', {
             timeZone: 'Asia/Kolkata',
             day: '2-digit',
             month: '2-digit',
             year: 'numeric',
           });
        }
      });
      
      return formattedDates.join(', ');
    }
    
    // Check if it's an epoch timestamp (numeric string)
    if (/^\d+$/.test(dateString)) {
      const timestamp = parseInt(dateString);
      if (isNaN(timestamp)) return 'N/A';
      
             // Create date from epoch timestamp
       const date = new Date(timestamp);
       if (isNaN(date.getTime())) return 'N/A';
       
       // Format in IST timezone
       return date.toLocaleDateString('en-GB', {
         timeZone: 'Asia/Kolkata',
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
       });
    } else {
             // Try parsing as regular date string
       const date = new Date(dateString);
       if (isNaN(date.getTime())) return 'N/A';
       // Format in IST timezone
       return date.toLocaleDateString('en-GB', {
         timeZone: 'Asia/Kolkata',
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
       });
    }
  };

  // Function to get vehicle count for a specific date
  const getVehicleCountForDate = (date: Date): number => {
    // Convert the calendar date to IST date string for comparison
    const calendarDateString = date.toLocaleDateString('en-CA', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const details = psaInventoryDetails.find(detail => {
      // Convert epoch timestamp to IST date string
      const detailDate = new Date(detail.createdAt);
      const detailDateString = detailDate.toLocaleDateString('en-CA', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      return detailDateString === calendarDateString;
    });
    return details?.countOfVehicleAvailableMarked || 0;
  };



  // Handle fleet owner search
  const handleFleetOwnerSearch = async (searchTerm: string) => {
    if (fleetOwnerSearchTimeout) {
      clearTimeout(fleetOwnerSearchTimeout);
    }

    const timeout = setTimeout(async () => {
      if (searchTerm.length >= 3) {
        try {
          const response = await apiService.fetchFleetOwnerSuggestions(searchTerm, 0, token);
          setFleetOwnerOptions(response.suppliers);
        } catch (error) {
          console.error('Error fetching fleet owner suggestions:', error);
        }
      } else {
        setFleetOwnerOptions([]);
      }
    }, 300);

    setFleetOwnerSearchTimeout(timeout);
  };

  // Handle origin cluster search
  const handleOriginClusterSearch = async (searchTerm: string) => {
    if (originClusterSearchTimeout) {
      clearTimeout(originClusterSearchTimeout);
    }

    const timeout = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        try {
          const filteredOptions = originClusterOptions.filter(option =>
            option.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            option.value.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setOriginClusterSearchOptions(filteredOptions);
        } catch (error) {
          console.error('Error filtering origin clusters:', error);
        }
      } else {
        setOriginClusterSearchOptions([]);
      }
    }, 300);

    setOriginClusterSearchTimeout(timeout);
  };

  // Handle destination cluster search
  const handleDestinationClusterSearch = async (searchTerm: string) => {
    if (destinationClusterSearchTimeout) {
      clearTimeout(destinationClusterSearchTimeout);
    }

    const timeout = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        try {
          const filteredOptions = destinationClusterOptions.filter(option =>
            option.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            option.value.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setDestinationClusterSearchOptions(filteredOptions);
        } catch (error) {
          console.error('Error filtering destination clusters:', error);
        }
      } else {
        setDestinationClusterSearchOptions([]);
      }
    }, 300);

    setDestinationClusterSearchTimeout(timeout);
  };

  // Place autocomplete handlers


  const handleClearFilters = () => {
    setFleetOwnerFilter('all');
    setVehicleTypeFilter('all');
    setPerformanceFilter('all');
    setInventoryTypeFilter('all');
    setSelectedPsaEmail('all');
    setSelectedPsaId('all');
    setPsaEmailSearchTerm('');
    setFleetOwnerSearchTerm('');
    setFleetOwnerOptions([]);
    setSelectedOriginClusters([]);
    setSelectedDestinationClusters([]);
    setOriginClusterSearchTerm('');
    setDestinationClusterSearchTerm('');
    setOriginClusterSearchOptions([]);
    setDestinationClusterSearchOptions([]);
    setOriginSearchTerm('');
    setDestinationSearchTerm('');
    setOriginSuggestions([]);
    setDestinationSuggestions([]);
    setShowOriginDropdown(false);
    setShowDestinationDropdown(false);
    setSelectedAvailableDate(null);
  };

  if (loading && data.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            {apiError ? (
              <>
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
                <p className="text-destructive font-medium mb-2">Failed to load data</p>
                <p className="text-muted-foreground text-sm">{apiError}</p>
              </>
            ) : (
              <>
                <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading inventory data...</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* View Toggle and Add Button for Inventory Tab */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
          <Button
            variant={inventoryView === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setInventoryView('list')}
            className="flex items-center space-x-2"
          >
            <List className="w-4 h-4" />
            <span>List View</span>
          </Button>
          <Button
            variant={inventoryView === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setInventoryView('calendar');
            }}
            className="flex items-center space-x-2"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calendar View</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setManualInventoryModalOpen(true)} 
            className="flex items-center space-x-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Inventory</span>
          </Button>
        </div>
      </div>

      {/* Filters for Inventory Calendar View */}
      {inventoryView === 'calendar' && (
        <div className="space-y-1">
          <Card>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* PSA Selection Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">PSA Agent</label>
                  <div className="relative">
                                                                             <Select value={selectedPsaEmail || 'all'} onValueChange={(value) => {
                     console.log('PSA Email selected (list view):', value);
                     console.log('Available PSA users (list view):', psaUsers);
                     setSelectedPsaEmail(value);
                     // Also update selectedPsaId for backward compatibility
                     if (value === 'all') {
                       setSelectedPsaId('all');
                     } else {
                       const psaUser = psaUsers.find(psa => psa.email === value);
                       console.log('Found PSA user (list view):', psaUser);
                       setSelectedPsaId(psaUser?.fteid || 'all');
                     }
                   }}>
                      <SelectTrigger className="h-8 text-xs pr-8">
                        <SelectValue placeholder={psaUsersLoading ? "Loading PSA agents..." : "Select PSA Agent"} />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 border-b">
                          <Input
                            placeholder="Search emails..."
                            value={psaEmailSearchTerm}
                            onChange={(e) => setPsaEmailSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="h-7 text-xs"
                          />
                        </div>
                        <SelectItem value="all">All PSA Agents</SelectItem>
                        {psaOptions.map(psa => {
                          console.log('Rendering PSA option:', psa);
                          return (
                            <SelectItem key={psa.id} value={psa.email}>
                              <div className="flex flex-col">
                                <span className="font-medium">{psa.name}</span>
                                <span className="text-xs text-muted-foreground">{psa.email}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedPsaEmail !== 'all' && (
                      <button
                        onClick={() => {
                          setSelectedPsaEmail('all');
                          setSelectedPsaId('all');
                          setPsaEmailSearchTerm('');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        title="Clear filter"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

               

                {/* Fleet Owner Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fleet Owner</label>
                  <div className="relative">
                    <Select value={calendarFleetOwnerFilter} onValueChange={(value) => {
                    console.log('=== CALENDAR FLEET OWNER FILTER CHANGE ===');
                    console.log('Calendar fleet owner filter changed from', calendarFleetOwnerFilter, 'to', value);
                    setCalendarFleetOwnerFilter(value);
                    console.log('=== END CALENDAR FLEET OWNER FILTER CHANGE ===');
                  }}>
                      <SelectTrigger className="h-8 text-xs pr-8">
                        <SelectValue placeholder="Search FO" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 border-b">
                          <Input
                            placeholder="Search fleet owners..."
                            value={fleetOwnerSearchTerm}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFleetOwnerSearchTerm(value);
                              if (value.length >= 3) {
                                handleFleetOwnerSearch(value);
                              } else {
                                setFleetOwnerOptions([]);
                              }
                            }}
                            className="h-7 text-xs"
                          />
                        </div>
                        <SelectItem value="all">All Fleet Owners</SelectItem>
                        {fleetOwnerOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.text}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {calendarFleetOwnerFilter !== 'all' && (
                      <button
                        onClick={() => setCalendarFleetOwnerFilter('all')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        title="Clear filter"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Vehicle Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Type</label>
                  <div className="relative">
                    <Select value={calendarVehicleTypeFilter} onValueChange={(value) => {
                    console.log('=== CALENDAR VEHICLE TYPE FILTER CHANGE ===');
                    console.log('Calendar vehicle type filter changed from', calendarVehicleTypeFilter, 'to', value);
                    setCalendarVehicleTypeFilter(value);
                    console.log('=== END CALENDAR VEHICLE TYPE FILTER CHANGE ===');
                  }}>
                      <SelectTrigger className="h-8 text-xs pr-8">
                        <SelectValue placeholder="Search" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {vehicleTypeOptions.map(type => (
                          <SelectItem key={type.value} value={type.text}>{type.text}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {calendarVehicleTypeFilter !== 'all' && (
                      <button
                        onClick={() => setCalendarVehicleTypeFilter('all')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        title="Clear filter"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Origin Cluster Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Origin Cluster</label>
                  <div className="relative">
                    <Select value={calendarOriginClusterFilter} onValueChange={(value)=>{ setCalendarOriginClusterFilter(value); if(value==='all'){ setOriginClusterSearchTerm(''); } }}>
                      <SelectTrigger className="h-8 text-xs pr-8">
                        <SelectValue placeholder="Search origin" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 border-b">
                          <Input
                            placeholder="Search origins..."
                            value={originClusterSearchTerm}
                            onChange={(e) => setOriginClusterSearchTerm(e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <SelectItem value="all">All Origins</SelectItem>
                        {originClusterOptions
                          .filter(option => 
                            originClusterSearchTerm === '' || 
                            option.text.toLowerCase().includes(originClusterSearchTerm.toLowerCase())
                          )
                          .map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.text}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    {calendarOriginClusterFilter !== 'all' && (
                      <button
                        onClick={() => setCalendarOriginClusterFilter('all')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        title="Clear filter"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Destination Cluster Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination Cluster</label>
                  <div className="relative">
                    <Select value={calendarDestinationClusterFilter} onValueChange={(value)=>{ setCalendarDestinationClusterFilter(value); if(value==='all'){ setDestinationClusterSearchTerm(''); } }}>
                      <SelectTrigger className="h-8 text-xs pr-8">
                        <SelectValue placeholder="Search destination" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 border-b">
                          <Input
                            placeholder="Search destinations..."
                            value={destinationClusterSearchTerm}
                            onChange={(e) => setDestinationClusterSearchTerm(e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <SelectItem value="all">All Destinations</SelectItem>
                        {destinationClusterOptions
                          .filter(option => 
                            destinationClusterSearchTerm === '' || 
                            option.text.toLowerCase().includes(destinationClusterSearchTerm.toLowerCase())
                          )
                          .map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.text}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    {calendarDestinationClusterFilter !== 'all' && (
                      <button
                        onClick={() => setCalendarDestinationClusterFilter('all')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        title="Clear filter"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Inventory Source Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Inventory Source Type</label>
                  <div className="relative">
                    <Select value={calendarInventorySourceTypeFilter} onValueChange={(value) => {
                    console.log('=== CALENDAR INVENTORY TYPE FILTER CHANGE ===');
                    console.log('Calendar inventory type filter changed from', calendarInventorySourceTypeFilter, 'to', value);
                    setCalendarInventorySourceTypeFilter(value);
                    console.log('=== END CALENDAR INVENTORY TYPE FILTER CHANGE ===');
                  }}>
                      <SelectTrigger className="h-8 text-xs pr-8">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Live">Live</SelectItem>
                        <SelectItem value="Prospects">Prospects</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                    {calendarInventorySourceTypeFilter !== 'all' && (
                      <button
                        onClick={() => setCalendarInventorySourceTypeFilter('all')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        title="Clear filter"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPsaId('all');
                    setSelectedPsaEmail('all');
                    setCalendarFleetOwnerFilter('all');
                    setCalendarVehicleTypeFilter('all');
                    setCalendarOriginClusterFilter('all');
                    setCalendarDestinationClusterFilter('all');
                    setCalendarInventorySourceTypeFilter('all');
                    setFleetOwnerSearchTerm('');
                    setFleetOwnerOptions([]);
                    setOriginClusterSearchTerm('');
                    setDestinationClusterSearchTerm('');
                  }}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Clear All Filters</span>
                </Button>
               
              </div>
            </CardContent>
          </Card>
        </div>
      )}



      {/* Calendar View for Inventory */}
      {inventoryView === 'calendar' ? (
        <div className="space-y-6">
          {/* Calendar Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedDate || new Date());
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    {(selectedDate || new Date()).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track inventory availability and utilization across dates. Click on any date with data to view details.
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedDate || new Date());
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="border rounded-lg overflow-hidden">
                {psaInventoryLoading && (
                  <div className="flex items-center justify-center p-4 bg-muted/20">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">Loading PSA inventory data...</span>
                  </div>
                )}
                {/* Week Header */}
                <div className="grid grid-cols-7 bg-muted/50">
                  {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                  {(() => {
                    const currentDate = selectedDate || new Date();
                    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                    const startDate = new Date(firstDay);
                    startDate.setDate(startDate.getDate() - firstDay.getDay());
                    
                    const days = [];
                    for (let i = 0; i < 42; i++) {
                      const date = new Date(startDate);
                      date.setDate(startDate.getDate() + i);
                      days.push(date);
                    }
                    
                    return days.map((date, index) => {
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                      
                      return (
                        <div
                          key={index}
                          className={`
                            relative h-24 border-r border-b last:border-r-0 p-2 transition-colors
                            ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
                            ${isSelected ? 'bg-primary/10 border-primary' : ''}
                            ${isToday ? 'bg-blue-50' : ''}
                            ${getVehicleCountForDate(date) > 0 && isCurrentMonth ? 'cursor-pointer hover:bg-muted/50' : 'cursor-default'}
                          `}
                          onClick={() => {
                            setSelectedDate(date);
                            // Switch to list view and apply date filter
                            setInventoryView('list');
                            setSelectedAvailableDate(date);
                            // Trigger data fetch with the new date filter immediately
                            fetchInventoryDataWithDate(date);
                            // Show notification to user
                            toast({
                              title: "Date Filter Applied",
                              description: `Showing inventory for ${date.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}`,
                            });
                          }}
                        >
                          <div className={`
                            text-lg font-medium
                            ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                            ${isToday ? 'text-blue-600 font-bold' : ''}
                            ${isSelected ? 'text-primary font-bold' : ''}
                          `}>
                            {date.getDate()}
                          </div>
                          
                          {(() => {
                            const vehicleCount = getVehicleCountForDate(date);
                            if (vehicleCount > 0 && isCurrentMonth) {
                              // Check if the date is in the past
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const isPastDate = date < today;
                              
                              return (
                                <div className="mt-1 space-y-1">
                                  <div className={`text-xs px-1 py-0.5 rounded ${
                                    isPastDate 
                                      ? 'bg-gray-100 text-gray-600' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {vehicleCount} vehicle{vehicleCount > 1 ? 's' : ''} available
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

             
            </CardContent>
          </Card>

         
        </div>
      ) : (
        <div className="space-y-4">
           {/* Compact Filters Above Table */}
           <div className="rounded-md border bg-card p-3 mb-2">
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-2">
               <div className="space-y-1">
                <label className="text-sm font-medium">PSA Agent</label>
                <div className="relative">
                  <Select value={selectedPsaEmail || 'all'} onValueChange={(value) => {
                    console.log('PSA Email selected:', value);
                    console.log('Available PSA users:', psaUsers);
                    setSelectedPsaEmail(value);
                    // Also update selectedPsaId for backward compatibility
                    if (value === 'all') {
                      setSelectedPsaId('all');
                    } else {
                      const psaUser = psaUsers.find(psa => psa.email === value);
                      console.log('Found PSA user:', psaUser);
                      setSelectedPsaId(psaUser?.fteid || 'all');
                    }
                  }}>
                    <SelectTrigger className="h-8 text-xs pr-8">
                      <SelectValue placeholder={psaUsersLoading ? "Loading PSA agents..." : "Select PSA Agent"} />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b">
                        <Input
                          placeholder="Search emails..."
                          value={psaEmailSearchTerm}
                          onChange={(e) => setPsaEmailSearchTerm(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="h-7 text-xs"
                        />
                      </div>
                      <SelectItem value="all">All PSA Agents</SelectItem>
                      {psaOptions.map(psa => {
                        console.log('Rendering PSA option (list view):', psa);
                        return (
                          <SelectItem key={psa.id} value={psa.email}>
                            <div className="flex flex-col">
                              <span className="font-medium">{psa.name}</span>
                              <span className="text-xs text-muted-foreground">{psa.email}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedPsaEmail !== 'all' && (
                    <button
                      onClick={() => {
                        setSelectedPsaEmail('all');
                        setSelectedPsaId('all');
                        setPsaEmailSearchTerm('');
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                      title="Clear filter"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Fleet Owner</label>
                <div className="relative">
                  <Select value={fleetOwnerFilter} onValueChange={(value) => {
                    console.log('=== FLEET OWNER FILTER CHANGE ===');
                    console.log('Fleet owner filter (calendar) changed from', fleetOwnerFilter, 'to', value);
                    console.log('Setting fleetOwnerFilter to:', value);
                    console.log('Current inventoryView:', inventoryView);
                    setFleetOwnerFilter(value);
                    console.log('Fleet owner filter set, should trigger useEffect');
                    console.log('=== END FLEET OWNER FILTER CHANGE ===');
                  }}>
                    <SelectTrigger className="h-8 text-xs pr-8"><SelectValue placeholder="Fleet Owner" /></SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b">
                        <Input placeholder="Search fleet owners..." value={fleetOwnerSearchTerm} onChange={(e)=>{const v=e.target.value; setFleetOwnerSearchTerm(v); if(v.length>=3){handleFleetOwnerSearch(v)} else {setFleetOwnerOptions([])}}} className="h-7 text-xs" />
                      </div>
                      <SelectItem value="all">All Fleet Owners</SelectItem>
                      {fleetOwnerOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.text}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  {fleetOwnerFilter !== 'all' && (
                    <button
                      onClick={() => setFleetOwnerFilter('all')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                      title="Clear filter"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Vehicle Type</label>
                <div className="relative">
                  <Select value={vehicleTypeFilter} onValueChange={(value) => {
                    console.log('=== VEHICLE TYPE FILTER CHANGE ===');
                    console.log('Vehicle type filter (calendar) changed from', vehicleTypeFilter, 'to', value);
                    console.log('About to set vehicleTypeFilter to:', value);
                    setVehicleTypeFilter(value);
                    console.log('Vehicle type filter set, should trigger useEffect');
                    console.log('=== END VEHICLE TYPE FILTER CHANGE ===');
                  }}>
                    <SelectTrigger className="h-8 text-xs pr-8" onClick={() => console.log('Vehicle type dropdown clicked')}>
                      <SelectValue placeholder="Vehicle Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" onClick={() => console.log('All Types selected')}>All Types</SelectItem>
                      {vehicleTypeOptions.map(type => {
                        console.log('Rendering vehicle type option:', type);
                        return <SelectItem key={type.value} value={type.text} onClick={() => console.log('Selected vehicle type:', type.text)}>{type.text}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                  {vehicleTypeFilter !== 'all' && (
                    <button
                      onClick={() => setVehicleTypeFilter('all')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                      title="Clear filter"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Origin Cluster</label>
                <div className="relative">
                  <Select value={'all'} onValueChange={(value)=>{
                    console.log('=== ORIGIN CLUSTER FILTER CHANGE ===');
                    console.log('Origin cluster filter (calendar) changed:', value);
                    if(value==='all'){ 
                      console.log('Clearing all origin clusters');
                      setSelectedOriginClusters([]); 
                      console.log('=== END ORIGIN CLUSTER FILTER CHANGE ===');
                      return; 
                    }
                    if(!selectedOriginClusters.includes(value)){
                      console.log('Adding origin cluster:', value, 'to existing:', selectedOriginClusters);
                      setSelectedOriginClusters([...selectedOriginClusters, value]);
                      console.log('Origin clusters updated, should trigger useEffect');
                    }
                    console.log('=== END ORIGIN CLUSTER FILTER CHANGE ===');
                  }}>
                    <SelectTrigger className="h-8 text-xs pr-8"><SelectValue placeholder={selectedOriginClusters.length>0?`${selectedOriginClusters.length} Origins`:'Origin'} /></SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b"><Input placeholder="Search origins..." value={originClusterSearchTerm} onChange={(e)=>setOriginClusterSearchTerm(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="h-7 text-xs" /></div>
                      <SelectItem value="all">All Origins</SelectItem>
                      {originClusterOptions.filter(o=>originClusterSearchTerm===''||o.text.toLowerCase().includes(originClusterSearchTerm.toLowerCase())).map(o=>(<SelectItem key={o.value} value={o.value}>{o.text}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  {selectedOriginClusters.length>0 && (
                    <button onClick={()=>{
                      console.log('Clearing all origin clusters via clear button');
                      setSelectedOriginClusters([]);
                    }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs" title="Clear all origins">×</button>
                  )}
                </div>
                {selectedOriginClusters.length>0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedOriginClusters.map(c=> (
                      <Badge key={c} variant="secondary" className="text-xs px-2 py-1 h-6 flex items-center gap-1">
                        <span className="truncate max-w-[120px]">{originClusterOptions.find(o=>o.value===c)?.text || c}</span>
                        <button onClick={()=>setSelectedOriginClusters(selectedOriginClusters.filter(x=>x!==c))} className="hover:text-destructive text-xs font-medium" title="Remove">×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Destination Cluster</label>
                <div className="relative">
                  <Select value={'all'} onValueChange={(value)=>{
                    console.log('Destination cluster filter (calendar) changed:', value);
                    if(value==='all'){ 
                      console.log('Clearing all destination clusters');
                      setSelectedDestinationClusters([]); 
                      return; 
                    }
                    if(!selectedDestinationClusters.includes(value)){
                      console.log('Adding destination cluster:', value, 'to existing:', selectedDestinationClusters);
                      setSelectedDestinationClusters([...selectedDestinationClusters, value]);
                    }
                  }}>
                    <SelectTrigger className="h-8 text-xs pr-8"><SelectValue placeholder={selectedDestinationClusters.length>0?`${selectedDestinationClusters.length} Dests`:'Destination'} /></SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b"><Input placeholder="Search destinations..." value={destinationClusterSearchTerm} onChange={(e)=>setDestinationClusterSearchTerm(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="h-7 text-xs" /></div>
                      <SelectItem value="all">All Destinations</SelectItem>
                      {destinationClusterOptions.filter(o=>destinationClusterSearchTerm===''||o.text.toLowerCase().includes(destinationClusterSearchTerm.toLowerCase())).map(o=>(<SelectItem key={o.value} value={o.value}>{o.text}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  {selectedDestinationClusters.length>0 && (
                    <button onClick={()=>{
                      console.log('Clearing all destination clusters via clear button');
                      setSelectedDestinationClusters([]);
                    }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs" title="Clear all destinations">×</button>
                  )}
                </div>
                {selectedDestinationClusters.length>0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedDestinationClusters.map(c=> (
                      <Badge key={c} variant="secondary" className="text-xs px-2 py-1 h-6 flex items-center gap-1">
                        <span className="truncate max-w-[120px]">{destinationClusterOptions.find(o=>o.value===c)?.text || c}</span>
                        <button onClick={()=>setSelectedDestinationClusters(selectedDestinationClusters.filter(x=>x!==c))} className="hover:text-destructive text-xs font-medium" title="Remove">×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>


              <div className="space-y-1">
                <label className="text-sm font-medium">Inventory Source Type</label>
                <div className="relative">
                  <Select value={inventoryTypeFilter} onValueChange={(value) => {
                    console.log('Inventory type filter (calendar) changed from', inventoryTypeFilter, 'to', value);
                    setInventoryTypeFilter(value);
                  }}>
                    <SelectTrigger className="h-8 text-xs pr-8"><SelectValue placeholder="Source" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Live">Live</SelectItem>
                      <SelectItem value="Prospects">Prospects</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                  {inventoryTypeFilter !== 'all' && (
                    <button
                      onClick={() => setInventoryTypeFilter('all')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                      title="Clear filter"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Available Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 text-xs w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedAvailableDate ? format(selectedAvailableDate, 'dd/MM/yyyy') : 'Any date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-2" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedAvailableDate ?? undefined}
                      onSelect={(d) => setSelectedAvailableDate(d ?? null)}
                    />
                  </PopoverContent>
                </Popover>
                {selectedAvailableDate && (
                  <button
                    onClick={() => setSelectedAvailableDate(null)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                    title="Clear date"
                  >
                    Clear date
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t">
              <Button variant="outline" size="sm" className="h-8" onClick={handleClearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          </div>
          {/* Top Pagination for List View */}
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage + 1} of {Math.max(1, totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

         

          {/* Data Table */}
          <div className="rounded-md border h-[500px] overflow-auto">
            <Table className="table-fixed">
              <TableHeader className="sticky top-0 z-20 bg-background border-b">
                <TableRow className="border-b">
                  <TableHead className="sticky top-0 z-20 bg-background text-left font-bold text-base">PSA</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-background text-left font-bold text-base">FleetOwner</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-background text-left font-bold text-base">Phone</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-background text-left font-bold text-base">VehicleType</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-background text-left font-bold text-base">Origin</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-background text-left font-bold text-base">Destination</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-background text-left font-bold text-base">ScoreCard</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-background text-left font-bold text-base">Type</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-background text-left font-bold text-base">AvailableDates</TableHead>
                </TableRow>
                {/* Former inline filter row removed from view */}
                <TableRow className="hidden">
                  {/* PSA Selection Filter */}
                  <TableHead className="p-2">
                    <div className="relative">
                      <label className="text-sm font-medium">PSA Agent</label>
                      <div className="relative">
                        <Select value={selectedPsaId || 'all'} onValueChange={setSelectedPsaId}>
                          <SelectTrigger className="h-8 text-xs pr-8">
                            <SelectValue placeholder={psaUsersLoading ? "Loading PSA agents..." : "Select PSA Agent"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All PSA Agents</SelectItem>
                            {psaUsers.map(psa => (
                              <SelectItem key={psa.id} value={psa.fteid}>{psa.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedPsaId !== 'all' && (
                          <button
                            onClick={() => setSelectedPsaId('all')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                            title="Clear filter"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </TableHead>

                  {/* Fleet Owner Filter */}
                   <TableHead className="p-2">
                    <div className="relative">
                      <Select value={fleetOwnerFilter} onValueChange={setFleetOwnerFilter}>
                        <SelectTrigger className="h-8 text-xs pr-8">
                          <SelectValue placeholder="Search FO" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 border-b">
                            <Input
                              placeholder="Search fleet owners..."
                              value={fleetOwnerSearchTerm}
                              onChange={(e) => {
                                const value = e.target.value;
                                setFleetOwnerSearchTerm(value);
                                if (value.length >= 3) {
                                  handleFleetOwnerSearch(value);
                                } else {
                                  setFleetOwnerOptions([]);
                                }
                              }}
                              className="h-7 text-xs"
                            />
                          </div>
                          <SelectItem value="all">All Fleet Owners</SelectItem>
                          {fleetOwnerOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.text}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fleetOwnerFilter !== 'all' && (
                        <button
                          onClick={() => setFleetOwnerFilter('all')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                          title="Clear filter"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </TableHead>
                  
                  {/* Phone - No Filter */}
                  <TableHead className="p-2"></TableHead>
                  
                  {/* Vehicle Type Filter */}
                  <TableHead className="p-2">
                    <div className="relative">
                      <Select value={vehicleTypeFilter} onValueChange={(value) => {
                        console.log('Vehicle type filter changed from', vehicleTypeFilter, 'to', value);
                        setVehicleTypeFilter(value);
                      }}>
                        <SelectTrigger className="h-8 text-xs pr-8">
                          <SelectValue placeholder="Search" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {vehicleTypeOptions.map(type => (
                            <SelectItem key={type.value} value={type.text}>{type.text}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {vehicleTypeFilter !== 'all' && (
                        <button
                          onClick={() => setVehicleTypeFilter('all')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                          title="Clear filter"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </TableHead>
                  
                  {/* Origin Filter */}
                  <TableHead className="p-2">
                    <div className="relative">
                      <Select value={'all'} onValueChange={(value) => {
                        if (value !== 'all' && !selectedOriginClusters.includes(value)) {
                          setSelectedOriginClusters([...selectedOriginClusters, value]);
                        }
                      }}>
                        <SelectTrigger className="h-8 text-xs pr-8">
                          <SelectValue placeholder={selectedOriginClusters.length > 0 ? `${selectedOriginClusters.length} selected` : "Search origin"} />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 border-b">
                            <Input
                              placeholder="Search origins..."
                              value={originClusterSearchTerm}
                              onChange={(e) => setOriginClusterSearchTerm(e.target.value)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <SelectItem value="all">All Origins</SelectItem>
                          {originClusterOptions
                            .filter(option => 
                              originClusterSearchTerm === '' || 
                              option.text.toLowerCase().includes(originClusterSearchTerm.toLowerCase())
                            )
                            .map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.text}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      {selectedOriginClusters.length > 0 && (
                        <button
                          onClick={() => setSelectedOriginClusters([])}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                          title="Clear all origins"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {selectedOriginClusters.length > 0 && (
                      <div className="flex flex-col gap-1 mt-2">
                        {selectedOriginClusters.map((cluster) => (
                          <Badge key={cluster} variant="secondary" className="text-xs px-2 py-1 h-6 flex items-center gap-1 w-fit">
                            <span className="truncate max-w-[120px]">
                              {originClusterOptions.find(opt => opt.value === cluster)?.text || cluster}
                            </span>
                            <button
                              onClick={() => setSelectedOriginClusters(selectedOriginClusters.filter(c => c !== cluster))}
                              className="ml-1 hover:text-destructive text-xs font-medium"
                              title="Remove filter"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableHead>
                  
                  {/* Destination Filter */}
                  <TableHead className="p-2">
                    <div className="relative">
                      <Select value={'all'} onValueChange={(value) => {
                        if (value !== 'all' && !selectedDestinationClusters.includes(value)) {
                          setSelectedDestinationClusters([...selectedDestinationClusters, value]);
                        }
                      }}>
                        <SelectTrigger className="h-8 text-xs pr-8">
                          <SelectValue placeholder={selectedDestinationClusters.length > 0 ? `${selectedDestinationClusters.length} selected` : "Search destination"} />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 border-b">
                            <Input
                              placeholder="Search destinations..."
                              value={destinationClusterSearchTerm}
                              onChange={(e) => setDestinationClusterSearchTerm(e.target.value)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <SelectItem value="all">All Destinations</SelectItem>
                          {destinationClusterOptions
                            .filter(option => 
                              destinationClusterSearchTerm === '' || 
                              option.text.toLowerCase().includes(destinationClusterSearchTerm.toLowerCase())
                            )
                            .map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.text}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      {selectedDestinationClusters.length > 0 && (
                        <button
                          onClick={() => setSelectedDestinationClusters([])}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                          title="Clear all destinations"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {selectedDestinationClusters.length > 0 && (
                      <div className="flex flex-col gap-1 mt-2">
                        {selectedDestinationClusters.map((cluster) => (
                          <Badge key={cluster} variant="secondary" className="text-xs px-2 py-1 h-6 flex items-center gap-1 w-fit">
                            <span className="truncate max-w-[120px]">
                              {destinationClusterOptions.find(opt => opt.value === cluster)?.text || cluster}
                            </span>
                            <button
                              onClick={() => setSelectedDestinationClusters(selectedDestinationClusters.filter(c => c !== cluster))}
                              className="ml-1 hover:text-destructive text-xs font-medium"
                              title="Remove filter"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableHead>
                  
                  {/* ScoreCard Filter */}
                  <TableHead className="p-2">
                    <div className="relative">
                      <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                        <SelectTrigger className="h-8 text-xs pr-8">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="GOLD">Gold</SelectItem>
                          <SelectItem value="SILVER">Silver</SelectItem>
                          <SelectItem value="RED">Red</SelectItem>
                        </SelectContent>
                      </Select>
                      {performanceFilter !== 'all' && (
                        <button
                          onClick={() => setPerformanceFilter('all')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                          title="Clear filter"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </TableHead>
                  
                  {/* Type Filter */}
                  <TableHead className="p-2">
                    <div className="relative">
                      <Select value={inventoryTypeFilter} onValueChange={setInventoryTypeFilter}>
                        <SelectTrigger className="h-8 text-xs pr-8">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="Live">Live</SelectItem>
                          <SelectItem value="Prospects">Prospects</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                      {inventoryTypeFilter !== 'all' && (
                        <button
                          onClick={() => setInventoryTypeFilter('all')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                          title="Clear filter"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </TableHead>
                  
                  {/* Available Date - Clear Filters Button */}
                  <TableHead className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      title="Clear All Filters"
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No inventory data found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item: any, index: number) => (
                    <TableRow key={item.id || item.vehicleNo || index} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex flex-col max-w-[240px]">
                          <span className="truncate text-xs text-muted-foreground font-mono" title={item.updatedBy || 'N/A'}>
                            {item.updatedBy || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block max-w-[200px] truncate whitespace-nowrap" title={item.fleetOwner || 'N/A'}>
                                {item.fleetOwner || 'N/A'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.fleetOwner || 'N/A'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="font-mono">{item.foNumber || 'N/A'}</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block max-w-[180px] truncate whitespace-nowrap" title={item.vehicleType || 'N/A'}>
                                {item.vehicleType || 'N/A'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.vehicleType || 'N/A'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block max-w-[160px] truncate whitespace-nowrap" title={item.origin || 'N/A'}>
                                {item.origin || 'N/A'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.origin || 'N/A'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block max-w-[180px] truncate whitespace-nowrap" title={item.destination || 'N/A'}>
                                {item.destination || 'N/A'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.destination || 'N/A'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPerformanceBadgeVariant(item.performance)} className="text-xs whitespace-nowrap">
                          {item.performance || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getInventoryTypeBadgeVariant(item.inventoryType)} className="text-xs whitespace-nowrap">
                          {getInventoryTypeDisplayValue(item.inventoryType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="break-words">{formatAvailabilityDates(item.availabilityDate)}</TableCell>
                    </TableRow>
                  ))
                )}
          </TableBody>
            </Table>
          </div>
          </div>
        
      )}

      {/* Pagination - only show for list view */}
      {inventoryView === 'list' && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {data.length} of {totalItems} results
            {(fleetOwnerFilter !== 'all' || vehicleTypeFilter !== 'all' || performanceFilter !== 'all' || inventoryTypeFilter !== 'all' || selectedOriginClusters.length > 0 || selectedDestinationClusters.length > 0) && (
              <span className="ml-2 text-blue-600">(filtered)</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage + 1} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Manual Inventory Modal */}
      <ManualInventoryModal
        open={manualInventoryModalOpen}
        onClose={() => setManualInventoryModalOpen(false)}
        onAdd={handleManualInventoryAdd}
        vehicleTypeOptions={vehicleTypeOptions}
        token={token}
      />
    </div>
  );
};

export default InventoryListTab;
