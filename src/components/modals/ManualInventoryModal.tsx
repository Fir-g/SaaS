import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { apiService, InventoryApiService } from '../../services/api';
import config from '@/config';

interface ManualInventoryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
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
    inventory_type: string;
  }) => void;
  vehicleTypeOptions: Array<{ value: string; text: string; masterFteid?: string }>;
  token?: string | null;
}

const ManualInventoryModal: React.FC<ManualInventoryModalProps> = ({ open, onClose, onAdd, vehicleTypeOptions, token }) => {
  const [origin, setOrigin] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<{ description: string; place_id: string }[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [destination, setDestination] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState<{ description: string; place_id: string }[]>([]);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [vehicleType, setVehicleType] = useState('');
  const [showVehicleTypeDropdown, setShowVehicleTypeDropdown] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [fleetOwner, setFleetOwner] = useState('');
  const [fleetOwnerSuggestions, setFleetOwnerSuggestions] = useState<{ value: string; text: string; phoneNumber?: string }[]>([]);
  const [showFleetOwnerDropdown, setShowFleetOwnerDropdown] = useState(false);
  const [fleetOwnerPage, setFleetOwnerPage] = useState(0);
  const [fleetOwnerHasMore, setFleetOwnerHasMore] = useState(true);
  const [fleetOwnerLoading, setFleetOwnerLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const originTimeout = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeout = useRef<NodeJS.Timeout | null>(null);
  const fleetOwnerTimeout = useRef<NodeJS.Timeout | null>(null);
  const modalWrapperRef = useRef<HTMLDivElement>(null);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const vehicleTypeInputRef = useRef<HTMLInputElement>(null);
  const fleetOwnerInputRef = useRef<HTMLInputElement>(null);
  const [selectedFleetOwnerId, setSelectedFleetOwnerId] = useState('');
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOriginId, setSelectedOriginId] = useState('');
  const [selectedDestinationId, setSelectedDestinationId] = useState('');
  const [selectedFleetOwnerPhone, setSelectedFleetOwnerPhone] = useState('');
  const [selectedMasterVehicleFteid, setSelectedMasterVehicleFteid] = useState('');
  const [foNumber, setFoNumber] = useState('');
  const HARDCODED_TOKEN = config.service_url.token;
  
  // Create instance of InventoryApiService for place autocomplete
  const inventoryApiService = new InventoryApiService();

  useEffect(() => {
    function handleClickInsideModal(event: MouseEvent) {
      if (!modalWrapperRef.current) return;
      if (!modalWrapperRef.current.contains(event.target as Node)) return;
      if (
        originInputRef.current &&
        !originInputRef.current.contains(event.target as Node) &&
        (event.target as HTMLElement).closest('.origin-dropdown') === null
      ) {
        setShowOriginDropdown(false);
      }
      if (
        destinationInputRef.current &&
        !destinationInputRef.current.contains(event.target as Node) &&
        (event.target as HTMLElement).closest('.destination-dropdown') === null
      ) {
        setShowDestinationDropdown(false);
      }
      if (
        vehicleTypeInputRef.current &&
        !vehicleTypeInputRef.current.contains(event.target as Node) &&
        (event.target as HTMLElement).closest('.vehicle-type-dropdown') === null
      ) {
        setShowVehicleTypeDropdown(false);
      }
      if (
        fleetOwnerInputRef.current &&
        !fleetOwnerInputRef.current.contains(event.target as Node) &&
        (event.target as HTMLElement).closest('.fleet-owner-dropdown') === null
      ) {
        setShowFleetOwnerDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickInsideModal);
    return () => document.removeEventListener('mousedown', handleClickInsideModal);
  }, []);

  if (!open) return null;

  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOrigin(value);
    if (originTimeout.current) clearTimeout(originTimeout.current);
    if (value.length >= 3) {
      originTimeout.current = setTimeout(async () => {
        try {
          const results = await inventoryApiService.getPlaces(value, token);
          setOriginSuggestions(results);
          setShowOriginDropdown(true);
        } catch (error) {
          console.error('Error fetching origin suggestions:', error);
        }
      }, 300);
    } else {
      setOriginSuggestions([]);
      setShowOriginDropdown(false);
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    if (destinationTimeout.current) clearTimeout(destinationTimeout.current);
    if (value.length >= 3) {
      destinationTimeout.current = setTimeout(async () => {
        try {
          const results = await inventoryApiService.getPlaces(value, token);
          setDestinationSuggestions(results);
          setShowDestinationDropdown(true);
        } catch (error) {
          console.error('Error fetching destination suggestions:', error);
        }
      }, 300);
    } else {
      setDestinationSuggestions([]);
      setShowDestinationDropdown(false);
    }
  };

  const handleFleetOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFleetOwner(value);
    if (fleetOwnerTimeout.current) clearTimeout(fleetOwnerTimeout.current);
    if (value.length >= 3) {
      setFleetOwnerPage(0);
      setFleetOwnerHasMore(true);
      setFleetOwnerLoading(true);
      fleetOwnerTimeout.current = setTimeout(async () => {
        try {
          const response = await apiService.fetchFleetOwnerSuggestions(value, 0, token);
          setFleetOwnerSuggestions(response.suppliers);
          setShowFleetOwnerDropdown(true);
          setFleetOwnerHasMore(response.hasMore);
          setFleetOwnerLoading(false);
        } catch (error) {
          console.error('Error fetching fleet owner suggestions:', error);
          setFleetOwnerLoading(false);
        }
      }, 300);
    } else {
      setFleetOwnerSuggestions([]);
      setShowFleetOwnerDropdown(false);
      setFleetOwnerPage(0);
      setFleetOwnerHasMore(true);
      setFleetOwnerLoading(false);
    }
  };

  const handleShowMoreFleetOwners = async () => {
    if (!fleetOwnerHasMore || fleetOwnerLoading) return;
    setFleetOwnerLoading(true);
    const nextPage = fleetOwnerPage + 1;
    const response = await apiService.fetchFleetOwnerSuggestions(fleetOwner, nextPage, token);
    if (response.suppliers.length > 0) {
      setFleetOwnerSuggestions(prev => [...prev, ...response.suppliers]);
      setFleetOwnerPage(nextPage);
      setFleetOwnerHasMore(response.hasMore);
    } else {
      setFleetOwnerHasMore(false);
    }
    setFleetOwnerLoading(false);
  };

  const handleVehicleTypeFocus = () => {
    setShowVehicleTypeDropdown(true);
  };

  const handleRemoveDate = (dateToRemove: Date) => {
    setSelectedDates(selectedDates.filter(date => date.getTime() !== dateToRemove.getTime()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!origin || !destination || !vehicleType || !fleetOwner || selectedDates.length === 0) {
      alert('Please fill in all required fields and select at least one availability date');
      return;
    }

    // Validate FO number (must be exactly 10 digits)
    const foNumberToValidate = foNumber || selectedFleetOwnerPhone;
    if (foNumberToValidate && !/^\d{10}$/.test(foNumberToValidate)) {
      alert('FO Number must be exactly 10 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert Date[] to string[] for API
      const formattedDates = selectedDates.map(date => format(date, 'yyyy-MM-dd'));
      
      const inventoryData = {
        vehicle_no: vehicleNumber || '', // Make vehicle number optional
        origin: origin,
        destination: destination,
        origin_place_id: selectedOriginId,
        destination_place_id: selectedDestinationId,
        fo_name: fleetOwner,
        fo_number: foNumber || selectedFleetOwnerPhone, // Use manual input if provided, otherwise use auto-populated
        fo_company_id: selectedFleetOwnerId,
        truck_type: vehicleType,
        vehicle_fteid: selectedVehicleTypeId,
        master_vehicle_fteid: selectedMasterVehicleFteid,
        availability_date: formattedDates[0], // Keep the first date for backward compatibility
        available_date_list: formattedDates.join(','), // New field with comma-separated dates
        inventory_type: 'manual'
      };
      
      // Call the parent's onAdd function instead of making API call here
      onAdd(inventoryData);
      
      // Reset form
      setOrigin('');
      setDestination('');
      setVehicleType('');
      setVehicleNumber('');
      setFleetOwner('');
      setFoNumber('');
      setSelectedDates([]);
      setSelectedFleetOwnerId('');
      setSelectedVehicleTypeId('');
      setSelectedOriginId('');
      setSelectedDestinationId('');
      setSelectedFleetOwnerPhone('');
      setSelectedMasterVehicleFteid('');
      setOriginSuggestions([]);
      setDestinationSuggestions([]);
      setFleetOwnerSuggestions([]);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Something went wrong while adding inventory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative" ref={modalWrapperRef}>
        <h2 className="text-lg font-bold mb-4 text-foreground">Add Manual Inventory</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <Label htmlFor="manual-origin" className="text-xs mb-1 block">Origin</Label>
            <Input
              id="manual-origin"
              ref={originInputRef}
              type="text"
              placeholder="Enter origin"
              value={origin}
              onChange={handleOriginChange}
              onFocus={() => { if (originSuggestions.length > 0) setShowOriginDropdown(true); }}
              autoComplete="off"
            />
            {showOriginDropdown && originSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto origin-dropdown">
                {originSuggestions.map(option => (
                  <button
                    key={option.place_id}
                    type="button"
                    onClick={() => {
                      setOrigin(option.description);
                      setSelectedOriginId(option.place_id);
                      setShowOriginDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  >
                    {option.description}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Label htmlFor="manual-destination" className="text-xs mb-1 block">Destination</Label>
            <Input
              id="manual-destination"
              ref={destinationInputRef}
              type="text"
              placeholder="Enter destination"
              value={destination}
              onChange={handleDestinationChange}
              onFocus={() => { if (destinationSuggestions.length > 0) setShowDestinationDropdown(true); }}
              autoComplete="off"
            />
            {showDestinationDropdown && destinationSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto destination-dropdown">
                {destinationSuggestions.map(option => (
                  <button
                    key={option.place_id}
                    type="button"
                    onClick={() => {
                      setDestination(option.description);
                      setSelectedDestinationId(option.place_id);
                      setShowDestinationDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  >
                    {option.description}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Label htmlFor="manual-vehicle-type" className="text-xs mb-1 block">Vehicle Type</Label>
            <Input
              id="manual-vehicle-type"
              ref={vehicleTypeInputRef}
              type="text"
              placeholder="Enter vehicle type"
              value={vehicleType}
              onFocus={handleVehicleTypeFocus}
              onChange={e => setVehicleType(e.target.value)}
              autoComplete="off"
            />
            {showVehicleTypeDropdown && vehicleTypeOptions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto vehicle-type-dropdown">
                {vehicleTypeOptions.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setVehicleType(type.text);
                      setSelectedVehicleTypeId(type.value);
                      setSelectedMasterVehicleFteid(type.masterFteid || type.value); // Use masterFteid if available, fallback to value
                      setShowVehicleTypeDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  >
                    {type.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="manual-vehicle-number" className="text-xs mb-1 block">Vehicle Number (Optional)</Label>
            <Input 
              id="manual-vehicle-number"
              type="text" 
              placeholder="Enter vehicle number (optional)" 
              value={vehicleNumber} 
              onChange={e => setVehicleNumber(e.target.value)} 
            />
          </div>

          <div>
            <Label htmlFor="manual-fleet-owner" className="text-xs mb-1 block">Fleet Owner <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="manual-fleet-owner"
                ref={fleetOwnerInputRef}
                type="text"
                placeholder="Enter fleet owner (required)"
                value={fleetOwner}
                onChange={handleFleetOwnerChange}
                onFocus={() => { if (fleetOwnerSuggestions.length > 0) setShowFleetOwnerDropdown(true); }}
                autoComplete="off"
                required
              />
              {showFleetOwnerDropdown && fleetOwnerSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto fleet-owner-dropdown">
                  {fleetOwnerSuggestions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFleetOwner(option.text);
                        setSelectedFleetOwnerId(option.value);
                        setSelectedFleetOwnerPhone(option.phoneNumber || '');
                        setShowFleetOwnerDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    >
                      {option.text}
                    </button>
                  ))}
                  {fleetOwnerHasMore && (
                    <button
                      type="button"
                      className="w-full text-center py-2 text-xs text-blue-600 hover:underline bg-white"
                      onClick={handleShowMoreFleetOwners}
                      disabled={fleetOwnerLoading}
                    >
                      {fleetOwnerLoading ? 'Loading...' : 'Show more'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="manual-fo-number" className="text-xs mb-1 block">FO Number</Label>
            <Input
              id="manual-fo-number"
              type="text"
              placeholder="Enter 10-digit FO number"
              value={foNumber}
              onChange={e => {
                const value = e.target.value;
                if (value === '' || /^\d{0,10}$/.test(value)) {
                  setFoNumber(value);
                }
              }}
              maxLength={10}
            />
            {foNumber && foNumber.length !== 10 && (
              <p className="text-xs text-destructive mt-1">FO Number must be exactly 10 digits</p>
            )}
          </div>

          <div>
            <Label className="text-xs mb-1 block">Availability Dates</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDates.length > 0 
                    ? `${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''} selected`
                    : "Select availability dates"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => {
                    setSelectedDates(dates || []);
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                  className="[&_.rdp-day_selected]:!bg-blue-600 [&_.rdp-day_selected]:!text-white [&_.rdp-day_today:not(.rdp-day_selected)]:!bg-transparent [&_.rdp-day_today:not(.rdp-day_selected)]:!text-inherit [&_.rdp-day_selected.rdp-day_today]:!bg-blue-600 [&_.rdp-day_selected.rdp-day_today]:!text-white"
                />
              </PopoverContent>
            </Popover>
            
            {selectedDates.length > 0 && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-2">Selected Dates:</label>
                <div className="flex flex-wrap gap-1">
                  {selectedDates.map((date, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                      onClick={() => handleRemoveDate(date)}
                    >
                      {format(date, 'MMM dd, yyyy')} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedDates.length === 0}
            >
              {isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </form>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ManualInventoryModal; 