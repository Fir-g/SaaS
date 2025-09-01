import React, { useState, useEffect } from 'react';
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
        const [lspResponse, vehicleResponse] = await Promise.all([
          getLspNames("FT"),
          getVehicleMapping("FT")
        ]);
        
        setAvailableLsps(lspResponse.lsp_names || []);
        setAvailableVehicles(
          vehicleResponse.map(v => ({
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

  const addFilter = (type: keyof ODVLSPFilters, value: string) => {
    if (!value || filters[type].includes(value)) return;

    // If "All" is selected, clear the array to send empty/null values
    if (value === 'ALL') {
      setFilters(prev => ({
        ...prev,
        [type]: []
      }));
    } else {
      // Remove "All" if it exists and add the specific value
      setFilters(prev => ({
        ...prev,
        [type]: [...prev[type].filter(item => item !== 'ALL'), value]
      }));
    }

    // Clear temp selection
    const tempKey = type.slice(0, -1) as keyof typeof tempSelections; // Remove 's' from the end
    setTempSelections(prev => ({
      ...prev,
      [tempKey === 'lsp_names' ? 'lsp' : tempKey === 'vehicle_ids' ? 'vehicle' : tempKey]: ''
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
    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">ODV LSP Filters</h3>
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
              addFilter('origins', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select origin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Origins</SelectItem>
              {LOCATIONS.filter(loc => !filters.origins.includes(loc)).map(location => (
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
              addFilter('destinations', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Destinations</SelectItem>
              {LOCATIONS.filter(loc => !filters.destinations.includes(loc)).map(location => (
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
              addFilter('lsp_names', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Customers</SelectItem>
              {availableLsps.filter(lsp => !filters.lsp_names.includes(lsp)).map(lsp => (
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
              addFilter('vehicle_ids', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Vehicles</SelectItem>
              {availableVehicles
                .filter(vehicle => !filters.vehicle_ids.includes(vehicle.id))
                .map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </SelectItem>
                ))
              }
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