import React, { useState, useEffect } from 'react';
import { MapPin, Package, Plus, UserCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser, useOrganization, useAuth } from '@clerk/clerk-react';

import { apiService } from '@/services/api';
import config from '../config';
import LiveTripsTab from '@/components/inventory/LiveTripsTab';
import ProspectsTab from '@/components/inventory/ProspectsTab';
import InventoryListTab from '@/components/inventory/InventoryListTab';
import PSAPreferencesTab from '@/components/inventory/PSAPreferencesTab';

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live-trips' | 'prospects' | 'inventory' | 'psa-preferences'>('live-trips');
  const { user } = useUser();
  const { organization } = useOrganization();
  const { has } = useAuth();
  const { toast } = useToast();

  // Debug: Log user and organization metadata to understand the structure
  console.log('User metadata:', user?.publicMetadata);
  console.log('Organization metadata:', organization?.publicMetadata);
  
  // Check if user is admin - only admins in organization can view PSA Preferences
  const isAdmin = (has && has({ role: 'org:admin' })) ||
                  user?.publicMetadata?.userType === 'admin' || 
                  user?.publicMetadata?.role === 'admin' ||
                  organization?.publicMetadata?.companyType === 'admin' ||
                  organization?.publicMetadata?.userType === 'admin';

  // Hardcoded token for testing
  const HARDCODED_TOKEN = config.service_url.token;
  
  // User data state
  const [userData, setUserData] = useState<any>(null);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string>('');

  // Filter data state
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState<Array<{ value: string; text: string; masterFteid?: string }>>([]);
  const [originClusterOptions, setOriginClusterOptions] = useState<Array<{ value: string; text: string }>>([]);
  const [destinationClusterOptions, setDestinationClusterOptions] = useState<Array<{ value: string; text: string }>>([]);

  const handleTabChange = (tab: 'live-trips' | 'prospects' | 'inventory' | 'psa-preferences') => {
    setActiveTab(tab);
  };

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
    user_email?: string;
  }) => {
    try {
      const success = await apiService.addManualInventory(inventoryData, HARDCODED_TOKEN);
      
      if (success) {
        toast({
          title: "Inventory Added",
          description: "Manual inventory has been added successfully.",
        });

      } else {
        toast({
          title: "Add Failed",
          description: "Failed to add manual inventory. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding manual inventory:', error);
      toast({
        title: "Add failed",
        description: "Something went wrong while adding inventory.",
        variant: "destructive",
      });
    }
  };

  // Fetch user data and filter data on component mount
  useEffect(() => {
    const fetchUserAndFilterData = async () => {
      try {
        // Get user email from Clerk
        const userEmail = user?.primaryEmailAddress?.emailAddress;
        
        if (userEmail) {
          // Fetch user data by email
          const userResponse = await apiService.fetchUserByEmail(userEmail, HARDCODED_TOKEN);
          
          if (userResponse.success && userResponse.data.length > 0) {
            const userInfo = userResponse.data[0];
            setUserData(userInfo);
            setUserPhoneNumber(userInfo.primary_mobile_number);
            
            // Store user phone number in localStorage for future use
            localStorage.setItem('userPhoneNumber', userInfo.primary_mobile_number);
            localStorage.setItem('userData', JSON.stringify(userInfo));
            
            console.log('User data fetched:', userInfo);
            console.log('User phone number:', userInfo.primary_mobile_number);
          }
        }

        // Fetch filter data
        const [vehicleTypes, originClusters, destinationClusters] = await Promise.all([
          apiService.fetchVehicleTypes(HARDCODED_TOKEN),
          apiService.fetchOriginClusters(HARDCODED_TOKEN),
          apiService.fetchDestinationClusters(HARDCODED_TOKEN),
        ]);

        setVehicleTypeOptions(vehicleTypes);
        setOriginClusterOptions(originClusters);
        setDestinationClusterOptions(destinationClusters);
      } catch (error) {
        console.error('Error fetching user and filter data:', error);
      }
    };

    fetchUserAndFilterData();
  }, [user, HARDCODED_TOKEN]);

    return (
    <div className="p-2 md:p-2 ">

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
                                <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'live-trips'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          onClick={() => handleTabChange('live-trips')}
        >
            <MapPin className="w-4 h-4" />
          <span>Live Trips</span>
                                </button>
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'prospects'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          onClick={() => handleTabChange('prospects')}
        >
            <UserCheck className="w-4 h-4" />
            <span>Prospects(L12M)</span>
        </button>
                                <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'inventory'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          onClick={() => handleTabChange('inventory')}
        >
          <Package className="w-4 h-4" />
          <span className="truncate">Inventory</span>
                                </button>
        {isAdmin && (
                                <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'psa-preferences'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            onClick={() => handleTabChange('psa-preferences')}
          >
            <Settings className="w-4 h-4" />
            <span>PSA Preferences</span>
                                </button>
                        )}
                      </div>

      {/* Tab Content */}
      <div className="space-y-4 md:space-y-6">
        {activeTab === 'live-trips' && (
          <LiveTripsTab
            onManualInventoryAdd={handleManualInventoryAdd}
            vehicleTypeOptions={vehicleTypeOptions}
            originClusterOptions={originClusterOptions}
            destinationClusterOptions={destinationClusterOptions}
            token={HARDCODED_TOKEN}
          />
        )}

        {activeTab === 'prospects' && (
          <ProspectsTab
            vehicleTypeOptions={vehicleTypeOptions}
            originClusterOptions={originClusterOptions}
            destinationClusterOptions={destinationClusterOptions}
            token={HARDCODED_TOKEN}
          />
                  )}

                  {activeTab === 'inventory' && (
          <InventoryListTab
            vehicleTypeOptions={vehicleTypeOptions}
            originClusterOptions={originClusterOptions}
            destinationClusterOptions={destinationClusterOptions}
            token={HARDCODED_TOKEN}
            onManualInventoryAdd={handleManualInventoryAdd}
          />
        )}

        {activeTab === 'psa-preferences' && isAdmin && (
          <PSAPreferencesTab
            originClusterOptions={originClusterOptions}
            destinationClusterOptions={destinationClusterOptions}
            token={HARDCODED_TOKEN}
          />
        )}
                </div>
                

    </div>
  );
};

export default Inventory;
