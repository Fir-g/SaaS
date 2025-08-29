import React, { useState, useEffect, useCallback } from 'react';
import { Phone, RefreshCw, AlertCircle, X, ChevronLeft, ChevronRight, Plus, CalendarDays, PhoneCall, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
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
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import { TripDetailsModal } from '@/components/modals/TripDetailsModal';
import ManualInventoryModal from '@/components/modals/ManualInventoryModal';
import { apiService, InventoryParams, InventoryItem as ApiInventoryItem } from '@/services/api';
import { getUserPhoneNumber, getUserData } from '@/lib/user-utils';
import { useUser } from '@clerk/clerk-react';
import config from '../../config';

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
  psaAgent?: string;
  addedDate?: string;
  capacity?: string;
  rate?: string;
  availabilityDate?: string | null;
}

interface LiveTripsTabProps {
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
  vehicleTypeOptions: Array<{ value: string; text: string }>;
  originClusterOptions: Array<{ value: string; text: string }>;
  destinationClusterOptions: Array<{ value: string; text: string }>;
  token: string;
}

const LiveTripsTab: React.FC<LiveTripsTabProps> = ({ 
  onManualInventoryAdd, 
  vehicleTypeOptions, 
  originClusterOptions, 
  destinationClusterOptions,
  token 
}) => {
  const { user } = useUser();
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fleetOwnerFilter, setFleetOwnerFilter] = useState<string>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [distanceFilter, setDistanceFilter] = useState<string>('all');

  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [manualInventoryModalOpen, setManualInventoryModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedOriginClusters, setSelectedOriginClusters] = useState<string[]>([]);
  const [selectedDestinationClusters, setSelectedDestinationClusters] = useState<string[]>([]);

  const [callPopoverOpen, setCallPopoverOpen] = useState<string | null>(null);
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
  const [originClusterSearchOptions, setOriginClusterSearchOptions] = useState<Array<{ value: string; text: string }>>([]);
  const [originClusterSearchTimeout, setOriginClusterSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [destinationClusterSearchTerm, setDestinationClusterSearchTerm] = useState<string>('');
  const [destinationClusterSearchOptions, setDestinationClusterSearchOptions] = useState<Array<{ value: string; text: string }>>([]);
  const [destinationClusterSearchTimeout, setDestinationClusterSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // State for availability dates modal
  // State for inline calendar
  const [calendarOpen, setCalendarOpen] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<{ [key: string]: Date[] }>({});
  const [tempSelectedDates, setTempSelectedDates] = useState<Date[]>([]);

  // Fetch live trips data from API
  const fetchLiveTripsData = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    setData([]);
    
    try {
      const params: InventoryParams = {
        showInventory: 'live',
        pageNumber: currentPage,
        pageSize: 20,
        fleetOwner: fleetOwnerFilter !== 'all' ? fleetOwnerFilter : undefined,
        vehicleType: vehicleTypeFilter !== 'all' ? vehicleTypeFilter : undefined,
        performance: performanceFilter !== 'all' ? performanceFilter : undefined,
        origin_list: selectedOriginClusters.length > 0 ? selectedOriginClusters.join(',') : undefined,
        destination_list: selectedDestinationClusters.length > 0 ? selectedDestinationClusters.join(',') : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        distanceToDestination: distanceFilter !== 'all' ? distanceFilter : undefined,
      };

      const response = await apiService.fetchInventory(params, token);
      
      if (response.success) {
        setApiData(response.data.items);
        setTotalItems(response.data.total);
        setTotalPages(response.data.totalPages);
        
        // Transform API data to match local interface
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
          psaAgent: undefined,
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
          description: "Unable to load live trips data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      
      setApiError('Something went wrong while loading data');
      setData([]);
      toast({
        title: "Something went wrong",
        description: "Unable to load live trips data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApiLoading(false);
      setLoading(false);
    }
  }, [currentPage, fleetOwnerFilter, vehicleTypeFilter, performanceFilter, statusFilter, distanceFilter, selectedOriginClusters, selectedDestinationClusters, toast, token]);

  useEffect(() => {
    fetchLiveTripsData();
  }, [fetchLiveTripsData]);

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

  const formatAvailabilityDates = (dateString: string | null) => {
    if (!dateString || dateString === '-' || dateString === 'null') return 'N/A';
    
    // Helper function to convert epoch to IST date string
    const epochToISTDate = (epochValue: string | number): string => {
      const timestamp = typeof epochValue === 'string' ? parseInt(epochValue) : epochValue;
      if (isNaN(timestamp)) return epochValue.toString();
      
      // Create date from epoch timestamp (epoch is already in UTC)
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return epochValue.toString();
      
      // Format directly in IST timezone
      return date.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };
    
    if (dateString.includes(',')) {
      const dates = dateString.split(',').map(date => date.trim());
      
      const formattedDates = dates.map(date => {
        // Check if it's an epoch timestamp (numeric string)
        if (/^\d+$/.test(date)) {
          return epochToISTDate(date);
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
    
    // Single date - check if it's epoch or regular date
    if (/^\d+$/.test(dateString)) {
      // It's an epoch timestamp
      return epochToISTDate(dateString);
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

  const formatEta = (eta: number | string | null | undefined): string => {
    if (!eta) return 'N/A';
    try {
      const timestamp = typeof eta === 'string' ? Number(eta) : eta;
      if (isNaN(timestamp)) return 'N/A';
      const etaDate = new Date(timestamp);
      if (isNaN(etaDate.getTime())) return 'N/A';
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      }).format(etaDate);
    } catch (error) {
      return 'N/A';
    }
  };

  const getFilteredData = useCallback(() => {
    if (!searchTerm.trim()) {
      return data;
    }
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    const filtered = data.filter(item => {
      const fleetOwnerMatch = item.fleetOwner.toLowerCase().includes(searchTermLower);
      const vehicleNoMatch = item.vehicleNo.toLowerCase().includes(searchTermLower);
      const destinationMatch = item.destination.toLowerCase().includes(searchTermLower);
      return fleetOwnerMatch || vehicleNoMatch || destinationMatch;
    });
    
    return filtered;
  }, [data, searchTerm]);

  const handleCallClick = (foNumber: string, fleetOwnerId: string, fleetOwnerName: string, item: InventoryItem) => {
    const itemKey = `${item.id}_${item.vehicleNo}`;
    setCallPopoverOpen(itemKey);
  };

  const handleCallConfirm = async (foNumber: string, fleetOwnerId: string, fleetOwnerName: string) => {
    try {
      // Get user phone number from localStorage
      const userPhoneNumber = getUserPhoneNumber();
      const userData = getUserData();
      
      
      
      const success = await apiService.initiateCall(foNumber, fleetOwnerId, token, userPhoneNumber);
      
      if (success) {
        toast({
          title: "Call initiated",
          description: `Calling ${fleetOwnerName} at ${foNumber} from ${userPhoneNumber}...`,
        });
      } else {
        toast({
          title: "Call failed",
          description: "Unable to initiate call. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      
      toast({
        title: "Call failed",
        description: "Something went wrong while initiating the call.",
        variant: "destructive",
      });
    } finally {
      setCallPopoverOpen(null);
    }
  };

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  const handleStatusChange = async (item: InventoryItem, newStatus: string) => {
    if (newStatus === "Vehicle Available") {
      // For "Vehicle Available" status, user should use the calendar action button
      // to set availability dates first, then the status will be updated
      toast({
        title: "Set Availability Dates",
        description: "Please use the calendar button to set availability dates first.",
        variant: "default",
      });
      return;
    }

    try {
      const success = await apiService.updateInventoryStatus(
        item.tripId, 
        newStatus, 
        undefined, 
        token,
        'live',
        { ...item, updatedBy: user?.primaryEmailAddress?.emailAddress || undefined }
      );
      if (success) {
        setData(prevData => 
          prevData.map(prevItem => 
            prevItem.id === item.id 
              ? { ...prevItem, status: newStatus }
              : prevItem
          )
        );
        
        toast({
          title: "Success",
          description: "Status updated successfully",
        });
      } else {
        toast({
          title: "Update failed",
          description: "Unable to update status. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      
      toast({
        title: "Update failed",
        description: "Something went wrong while updating status.",
        variant: "destructive",
      });
    }
  };

  // Handle opening inline calendar
  const handleOpenCalendar = (item: InventoryItem) => {
    const itemKey = `${item.id}_${item.vehicleNo}`;
    setCalendarOpen(itemKey);
    
    // Parse existing availability dates
    const existingDates: Date[] = [];
    if (item.availabilityDate && item.availabilityDate !== 'N/A') {
      const dateStrings = item.availabilityDate.split(',').map(d => d.trim());
      dateStrings.forEach(dateStr => {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          existingDates.push(date);
        }
      });
    }
    
    setSelectedDates(prev => ({ ...prev, [itemKey]: existingDates }));
    setTempSelectedDates(existingDates);
  };

  // Handle date selection in calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setTempSelectedDates(prev => {
      const isSelected = prev.some(d => d.toDateString() === date.toDateString());
      if (isSelected) {
        return prev.filter(d => d.toDateString() !== date.toDateString());
      } else {
        return [...prev, date].sort((a, b) => a.getTime() - b.getTime());
      }
    });
  };

  // Handle updating dates
  const handleUpdateDates = async (item: InventoryItem) => {
    const itemKey = `${item.id}_${item.vehicleNo}`;
    
    try {
      // Format dates for API
      const formattedDates = tempSelectedDates.map(date => 
        format(date, 'yyyy-MM-dd')
      );

      // Call API to update availability dates and status
      const success = await apiService.updateInventoryStatus(
        item.tripId, 
        "Vehicle Available", 
        formattedDates, 
        token,
        'live',
        { ...item, updatedBy: user?.primaryEmailAddress?.emailAddress || undefined }
      );
      
      if (success) {
        // Update local state
        setSelectedDates(prev => ({ ...prev, [itemKey]: [...tempSelectedDates] }));
        
        // Update the item's availability date and status in the data
        const updatedData = data.map(dataItem => {
          if (dataItem.id === item.id) {
            return { 
              ...dataItem, 
              availabilityDate: formattedDates.join(',') || null,
              status: "Vehicle Available"
            };
          }
          return dataItem;
        });
        setData(updatedData);
        
        setCalendarOpen(null);
        
        toast({
          title: "Success",
          description: "Availability dates and status updated successfully.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update availability dates. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      
      toast({
        title: "Update Failed",
        description: "Failed to update availability dates. Please try again.",
        variant: "destructive",
      });
    }
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
          
        }
      } else {
        setDestinationClusterSearchOptions([]);
      }
    }, 300);

    setDestinationClusterSearchTimeout(timeout);
  };

  const handleClearFilters = () => {
    setFleetOwnerFilter('all');
    setVehicleTypeFilter('all');
    setPerformanceFilter('all');
    setStatusFilter('all');
    setDistanceFilter('all');
    setSearchTerm('');
    setFleetOwnerSearchTerm('');
    setFleetOwnerOptions([]);
    setSelectedOriginClusters([]);
    setSelectedDestinationClusters([]);
    setOriginClusterSearchTerm('');
    setDestinationClusterSearchTerm('');
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
                <p className="text-muted-foreground">Loading live trips data...</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
       {/* Compact Filters Above Table */}
       <div className="rounded-md border bg-card p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Fleet Owner</label>
            <div className="relative">
            <Select value={fleetOwnerFilter} onValueChange={setFleetOwnerFilter}>
              <SelectTrigger className="h-8 text-xs pr-8"><SelectValue placeholder="Fleet Owner" /></SelectTrigger>
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
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Vehicle Type</label>
            <Select value={vehicleTypeFilter} onValueChange={(value) => {
              
              setVehicleTypeFilter(value);
            }}>
              <SelectTrigger className="h-8 text-xs pr-8"><SelectValue placeholder="Vehicle Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {vehicleTypeOptions.map(type => (
                  <SelectItem key={type.value} value={type.text}>{type.text}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Origin Cluster</label>
            <div className="relative">
              <Select value={'all'} onValueChange={(value) => {
                if (value === 'all') {
                  setSelectedOriginClusters([]);
                  return;
                }
                if (!selectedOriginClusters.includes(value)) {
                  setSelectedOriginClusters([...selectedOriginClusters, value]);
                }
              }}>
                <SelectTrigger className="h-8 text-xs pr-8"><SelectValue placeholder={selectedOriginClusters.length > 0 ? `${selectedOriginClusters.length} Origins` : 'Origin'} /></SelectTrigger>
                <SelectContent>
                  <div className="p-2 border-b">
                    <Input placeholder="Search origins..." value={originClusterSearchTerm} onChange={(e) => setOriginClusterSearchTerm(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="h-7 text-xs" />
                  </div>
                  <SelectItem value="all">All Origins</SelectItem>
                  {originClusterOptions
                    .filter(option => originClusterSearchTerm === '' || option.text.toLowerCase().includes(originClusterSearchTerm.toLowerCase()))
                    .map(option => (<SelectItem key={option.value} value={option.value}>{option.text}</SelectItem>))}
                </SelectContent>
              </Select>
              {selectedOriginClusters.length > 0 && (
                <button
                  onClick={() => { setSelectedOriginClusters([]); setOriginClusterSearchTerm(''); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  title="Clear all origins"
                >
                  ×
                </button>
              )}
            </div>
            {selectedOriginClusters.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedOriginClusters.map((cluster) => (
                  <Badge key={cluster} variant="secondary" className="text-xs px-2 py-1 h-6 flex items-center gap-1">
                    <span className="truncate max-w-[120px]">{originClusterOptions.find(o => o.value === cluster)?.text || cluster}</span>
                    <button
                      onClick={() => setSelectedOriginClusters(selectedOriginClusters.filter(c => c !== cluster))}
                      className="hover:text-destructive text-xs font-medium"
                      title="Remove"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Destination Cluster</label>
            <div className="relative">
              <Select value={'all'} onValueChange={(value) => {
                if (value === 'all') {
                  setSelectedDestinationClusters([]);
                  return;
                }
                if (!selectedDestinationClusters.includes(value)) {
                  setSelectedDestinationClusters([...selectedDestinationClusters, value]);
                }
              }}>
                <SelectTrigger className="h-8 text-xs pr-8"><SelectValue placeholder={selectedDestinationClusters.length > 0 ? `${selectedDestinationClusters.length} Dests` : 'Destination'} /></SelectTrigger>
                <SelectContent>
                  <div className="p-2 border-b">
                    <Input placeholder="Search destinations..." value={destinationClusterSearchTerm} onChange={(e) => setDestinationClusterSearchTerm(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="h-7 text-xs" />
                  </div>
                  <SelectItem value="all">All Destinations</SelectItem>
                  {destinationClusterOptions
                    .filter(option => destinationClusterSearchTerm === '' || option.text.toLowerCase().includes(destinationClusterSearchTerm.toLowerCase()))
                    .map(option => (<SelectItem key={option.value} value={option.value}>{option.text}</SelectItem>))}
                </SelectContent>
              </Select>
              {selectedDestinationClusters.length > 0 && (
                <button
                  onClick={() => { setSelectedDestinationClusters([]); setDestinationClusterSearchTerm(''); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  title="Clear all destinations"
                >
                  ×
                </button>
              )}
            </div>
            {selectedDestinationClusters.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedDestinationClusters.map((cluster) => (
                  <Badge key={cluster} variant="secondary" className="text-xs px-2 py-1 h-6 flex items-center gap-1">
                    <span className="truncate max-w-[120px]">{destinationClusterOptions.find(o => o.value === cluster)?.text || cluster}</span>
                    <button
                      onClick={() => setSelectedDestinationClusters(selectedDestinationClusters.filter(c => c !== cluster))}
                      className="hover:text-destructive text-xs font-medium"
                      title="Remove"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Score Card</label>
            <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
              <SelectTrigger className="h-8 text-xs pr-8"><SelectValue placeholder="Score" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="GOLD">Gold</SelectItem>
                <SelectItem value="SILVER">Silver</SelectItem>
                <SelectItem value="RED">Red</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Distance</label>
            <Select value={distanceFilter} onValueChange={setDistanceFilter}>
              <SelectTrigger className="h-8 text-xs pr-8"><SelectValue placeholder="Distance" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0-50">0-50km</SelectItem>
                <SelectItem value="51-100">51-100km</SelectItem>
                <SelectItem value="101-200">101-200km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          
        </div>
        <div className="flex items-center justify-between mt-3 pt-2 border-t">
          <Button variant="outline" size="sm" className="h-8" onClick={handleClearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
         
        </div>
      </div>
      {/* Top Pagination */}
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
              <TableHead className="text-left font-bold text-base">FleetOwner</TableHead>
              <TableHead className="text-left font-bold text-base">Phone</TableHead>
              <TableHead className="text-left font-bold text-base">VehicleType</TableHead>
              <TableHead className="text-left font-bold text-base">Origin</TableHead>
              <TableHead className="text-left font-bold text-base">Destination</TableHead>
              <TableHead className="text-left font-bold text-base">ScoreCard</TableHead>
              <TableHead className="text-center font-bold text-base">Distance</TableHead>
              <TableHead className="text-left font-bold text-base">Status</TableHead>
              <TableHead className="text-left font-bold text-base">ETA</TableHead>
              <TableHead className="text-left font-bold text-base">AvailableDates</TableHead>
              <TableHead className="text-left font-bold text-base">Actions</TableHead>
            </TableRow>
            {/* Former inline filter row removed from view */}
            <TableRow className="hidden">
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
                    <Select onValueChange={(value) => {
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
                    <Select onValueChange={(value) => {
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
                
                {/* Distance Filter */}
                <TableHead className="p-2">
                  <div className="relative">
                    <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                      <SelectTrigger className="h-8 text-xs pr-8">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="0-50">0-50km</SelectItem>
                        <SelectItem value="50-100">50-100km</SelectItem>
                        <SelectItem value="100-200">100-200km</SelectItem>
                        <SelectItem value="200+">200+km</SelectItem>
                      </SelectContent>
                    </Select>
                    {distanceFilter !== 'all' && (
                      <button
                        onClick={() => setDistanceFilter('all')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        title="Clear filter"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </TableHead>
                
                {/* Status Filter */}
                <TableHead className="p-2">
                  <div className="relative">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-8 text-xs pr-8">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Vehicle Available">Available</SelectItem>
                        <SelectItem value="Vehicle Not Available">Not Available</SelectItem>
                        <SelectItem value="Call Not Picked">No Pick</SelectItem>
                        <SelectItem value="Did Not Call">No Call</SelectItem>
                        <SelectItem value="Vehicle Placed">Placed</SelectItem>
                        <SelectItem value="Inventory Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {statusFilter !== 'all' && (
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        title="Clear filter"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </TableHead>
                
                {/* ETA - No Filter */}
                <TableHead className="p-2"></TableHead>
                
                {/* Available Dates - No Filter */}
                <TableHead className="p-2"></TableHead>
                
                {/* Actions - Clear Filters Button */}
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
                  <TableCell colSpan={11} className="h-32 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : getFilteredData().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center text-muted-foreground">
                    {searchTerm ? 'No matching live trips found' : 'No live trips data found'}
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredData().map((item: any, index: number) => (
                    <TableRow key={item.id || item.vehicleNo || index} className="hover:bg-muted/50">
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
                    <TableCell className="text-center tabular-nums">{item.distanceFromDestination || 'N/A'}</TableCell>
                    <TableCell>
                      <Select 
                        value={item.status || 'Did Not Call'} 
                        onValueChange={(newStatus) => handleStatusChange(item, newStatus)}
                      >
                        <SelectTrigger className="w-full h-8 max-w-[150px]" title={item.status || 'Did Not Call'}>
                          <SelectValue className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[200px] text-left">
                          <SelectItem value="Vehicle Available">Vehicle Available</SelectItem>
                          <SelectItem value="Vehicle Not Available">Vehicle Not Available</SelectItem>
                          <SelectItem value="Call Not Picked">Call Not Picked</SelectItem>
                          <SelectItem value="Did Not Call">Did Not Call</SelectItem>
                          <SelectItem value="Vehicle Placed">Vehicle Placed</SelectItem>
                          <SelectItem value="Inventory Cancelled">Inventory Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatEta(item.eta)}</TableCell>
                    <TableCell className="break-words">{formatAvailabilityDates(item.availabilityDate)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Popover 
                                open={calendarOpen === `${item.id}_${item.vehicleNo}`} 
                                onOpenChange={(open) => {
                                  if (open) {
                                    handleOpenCalendar(item);
                                  } else {
                                    setCalendarOpen(null);
                                  }
                                }}
                              >
                                <PopoverTrigger asChild>
                                  <Button 
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <CalendarDays className="w-4 h-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <div className="p-4 space-y-4">
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-sm">Set Availability Dates</h4>
                                      <p className="text-xs text-muted-foreground">
                                        Vehicle: {item.vehicleNo} | Fleet Owner: {item.fleetOwner}
                                      </p>
                                    </div>
                                    
                                    <Calendar
                                      mode="multiple"
                                      selected={tempSelectedDates}
                                      onSelect={(dates) => {
                                        if (Array.isArray(dates)) {
                                          setTempSelectedDates(dates);
                                        }
                                      }}
                                      className="rounded-md border [&_.rdp-day_selected]:!bg-blue-600 [&_.rdp-day_selected]:!text-white [&_.rdp-day_today:not(.rdp-day_selected)]:!bg-transparent [&_.rdp-day_today:not(.rdp-day_selected)]:!text-inherit [&_.rdp-day_selected.rdp-day_today]:!bg-blue-600 [&_.rdp-day_selected.rdp-day_today]:!text-white"
                                    />
                                    
                                    {tempSelectedDates.length > 0 && (
                                      <div className="space-y-2">
                                        <p className="text-xs font-medium">Selected Dates:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {tempSelectedDates.map((date, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                              {format(date, 'MMM dd, yyyy')}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex gap-2 pt-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateDates(item)}
                                        className="flex items-center gap-1"
                                      >
                                        <Check className="w-3 h-3" />
                                        Update Dates
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setCalendarOpen(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Set vehicle availability dates</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Popover 
                          open={callPopoverOpen === `${item.id}_${item.vehicleNo}`} 
                          onOpenChange={(open) => {
                            if (open) {
                              handleCallClick(item.foNumber, item.fleetOwnerId, item.fleetOwner, item);
                            } else {
                              setCallPopoverOpen(null);
                            }
                          }}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                  <Button 
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                  >
                                    <PhoneCall className="w-4 h-4" />
                                  </Button>
                                </PopoverTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Call fleet owner: {item.foNumber}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-4 space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">Confirm Call</h4>
                                <p className="text-xs text-muted-foreground">
                                  Are you sure you want to call
                                </p>
                                <p className="text-sm font-medium text-blue-600">
                                  {item.fleetOwner}
                                </p>
                                <p className="text-sm font-mono">
                                  {item.foNumber}
                                </p>
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleCallConfirm(item.foNumber, item.fleetOwnerId, item.fleetOwner)}
                                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                                >
                                  <PhoneCall className="w-3 h-3" />
                                  Yes, Call
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setCallPopoverOpen(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
          </TableBody>
        </Table>
        </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {getFilteredData().length} of {totalItems} results
          {(fleetOwnerFilter !== 'all' || vehicleTypeFilter !== 'all' || performanceFilter !== 'all' || statusFilter !== 'all' || distanceFilter !== 'all' || selectedOriginClusters.length > 0 || selectedDestinationClusters.length > 0) && (
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

      {/* Modals */}
      <TripDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        item={selectedItem}
      />

      <ManualInventoryModal
        open={manualInventoryModalOpen}
        onClose={() => setManualInventoryModalOpen(false)}
        onAdd={onManualInventoryAdd}
        vehicleTypeOptions={vehicleTypeOptions}
        token={token}
      />




    </div>
  );
};

export default LiveTripsTab;
