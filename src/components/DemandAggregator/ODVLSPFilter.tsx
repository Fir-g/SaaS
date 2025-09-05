import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { getVehicleMapping, getLspNames } from "@/services/demandAggregatorService";

interface ODVLSPFilters {
  origins: string[];
  destinations: string[];
  lsp_names: string[];
  vehicle_ids: string[];
}

interface ODVLSPFilterProps {
  onFiltersChange: (filters: ODVLSPFilters) => void;
}

const LOCATIONS = [
  'Delhi', 
  'Mumbai', 
  'Bangalore', 
  'Jaipur', 
  'Kolkata', 
  'Patna', 
  'Ranchi', 
  'Lucknow', 
  'Chennai'
];

const ODVLSPFilter: React.FC<ODVLSPFilterProps> = ({ onFiltersChange }) => {
  const { getToken } = useAuth();
  const [filters, setFilters] = useState<ODVLSPFilters>({
    origins: [],
    destinations: [],
    lsp_names: [],
    vehicle_ids: []
  });

  const [availableLsps, setAvailableLsps] = useState<string[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Array<{id: string, name: string}>>([]);
  
  const [tempSelections, setTempSelections] = useState({
    origin: '',
    destination: '',
    lsp: '',
    vehicle: ''
  });

  // Fetch LSPs and Vehicles on component mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const template = import.meta.env.VITE_CLERK_TOKEN_TEMPLATE as string | undefined;
        const token = await getToken({ template, skipCache: true });
        const [lspResponse, vehicleResponse] = await Promise.all([
          getLspNames("FT", token),
          getVehicleMapping("FT", token)
        ]);
        
        setAvailableLsps(lspResponse.lsp_names || []);
        const vehicles = Array.isArray(vehicleResponse) ? vehicleResponse : [];
        setAvailableVehicles(
          vehicles.map(v => ({
            id: v.vehicle_id,
            name: v.vehicle_name
          }))
        );
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const toggleFilter = (type: keyof ODVLSPFilters, value: string) => {
    if (!value) return;

    // If "All" is selected, clear the array to send empty/null values
    if (value === 'ALL') {
      setFilters(prev => ({
        ...prev,
        [type]: []
      }));
    } else {
      setFilters(prev => {
        const alreadySelected = prev[type].includes(value);
        return {
          ...prev,
          [type]: alreadySelected
            ? prev[type].filter(item => item !== value)
            : [...prev[type].filter(item => item !== 'ALL'), value]
        };
      });
    }

    // Clear temp selection (acts as cache for current dropdown value)
    const tempKeyName: 'origin' | 'destination' | 'lsp' | 'vehicle' =
      type === 'origins' ? 'origin'
      : type === 'destinations' ? 'destination'
      : type === 'lsp_names' ? 'lsp'
      : 'vehicle';
    setTempSelections(prev => ({
      ...prev,
      [tempKeyName]: ''
    }));
  };

  const removeFilter = (type: keyof ODVLSPFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      origins: [],
      destinations: [],
      lsp_names: [],
      vehicle_ids: []
    });
    setTempSelections({
      origin: '',
      destination: '',
      lsp: '',
      vehicle: ''
    });
  };

  const getTotalFiltersCount = () => {
    // Count only arrays that have specific values (not "All")
    return Object.values(filters).reduce((sum, arr) => sum + (arr.length > 0 ? arr.length : 0), 0);
  };

  return (
    <div className=" bg-white p-4 rounded-lg border shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getTotalFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getTotalFiltersCount()} active
            </Badge>
          )}
        </div>
        {getTotalFiltersCount() > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Origin Filter */}
        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Select
            value={tempSelections.origin}
            onValueChange={(value) => {
              setTempSelections(prev => ({ ...prev, origin: value }));
              toggleFilter('origins', value);
            }}
          >
            <SelectTrigger>
              {filters.origins.length === 0
                ? <span className="text-muted-foreground">All Origins</span>
                : <span className="truncate">{filters.origins.join(", ")}</span>
              }
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Origins</SelectItem>
              {LOCATIONS.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1">
            {filters.origins.length === 0 ? (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                All Origins
              </Badge>
            ) : (
              filters.origins.map(origin => (
                <Badge key={origin} variant="default" className="text-xs">
                  {origin}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('origins', origin)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Destination Filter */}
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Select
            value={tempSelections.destination}
            onValueChange={(value) => {
              setTempSelections(prev => ({ ...prev, destination: value }));
              toggleFilter('destinations', value);
            }}
          >
            <SelectTrigger>
              {filters.destinations.length === 0
                ? <span className="text-muted-foreground">All Destinations</span>
                : <span className="truncate">{filters.destinations.join(", ")}</span>
              }
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Destinations</SelectItem>
              {LOCATIONS.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1">
            {filters.destinations.length === 0 ? (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                All Destinations
              </Badge>
            ) : (
              filters.destinations.map(destination => (
                <Badge key={destination} variant="default" className="text-xs">
                  {destination}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('destinations', destination)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Customer (LSP) Filter */}
        <div className="space-y-2">
          <Label htmlFor="customer">Customer</Label>
          <Select
            value={tempSelections.lsp}
            onValueChange={(value) => {
              setTempSelections(prev => ({ ...prev, lsp: value }));
              toggleFilter('lsp_names', value);
            }}
          >
            <SelectTrigger>
              {filters.lsp_names.length === 0
                ? <span className="text-muted-foreground">All Customers</span>
                : <span className="truncate">{filters.lsp_names.join(", ")}</span>
              }
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Customers</SelectItem>
              {availableLsps.map(lsp => (
                <SelectItem key={lsp} value={lsp}>
                  {lsp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1">
            {filters.lsp_names.length === 0 ? (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                All Customers
              </Badge>
            ) : (
              filters.lsp_names.map(lsp => (
                <Badge key={lsp} variant="default" className="text-xs">
                  {lsp}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('lsp_names', lsp)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Vehicle Filter */}
        <div className="space-y-2">
          <Label htmlFor="vehicle">Vehicle</Label>
          <Select
            value={tempSelections.vehicle}
            onValueChange={(value) => {
              setTempSelections(prev => ({ ...prev, vehicle: value }));
              toggleFilter('vehicle_ids', value);
            }}
          >
            <SelectTrigger>
              {filters.vehicle_ids.length === 0
                ? <span className="text-muted-foreground">All Vehicles</span>
                : (
                  <span className="truncate">
                    {filters.vehicle_ids
                      .map((vid) => availableVehicles.find(av => av.id === vid)?.name || vid)
                      .join(", ")}
                  </span>
                )
              }
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Vehicles</SelectItem>
              {availableVehicles.map(vehicle => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1">
            {filters.vehicle_ids.length === 0 ? (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                All Vehicles
              </Badge>
            ) : (
              filters.vehicle_ids.map(vehicleId => {
                const vehicle = availableVehicles.find(v => v.id === vehicleId);
                return (
                  <Badge key={vehicleId} variant="default" className="text-xs">
                    {vehicle?.name || vehicleId}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeFilter('vehicle_ids', vehicleId)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ODVLSPFilter;