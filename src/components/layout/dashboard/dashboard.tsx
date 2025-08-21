import {
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import DemandCard from "./demand-card";
import { mockDashboardData } from "@/constants/dashboard-data";
import { useEffect, useState } from "react";
import { 
  getLatestFailedDemands, 
  getLatestPublishedDemands, 
  getChannelSplitData, 
  getTrendsData,
  getOriginSplitData,
  getDestinationSplitData,
  getVehicleSplitData,
  getCustomerSplitData,
  getVehicleMapping,
  getLspNames,
  ChannelSplitResponse,
  TrendsResponse,
  VehicleMappingResponse
} from "@/services/dashboardService";
import { DemandEntry } from "@/types/demand";
import { startAuthHeartbeat } from "@/services/authService";
import NewDashboard from "./new-dashboard";
import DashboardFilters from "./dashboard-filters";
import ChannelSplitPie, { COLORS } from "./channel-split-pie";
import TrendChart from "./trend-chart";
import SplitSection from "./split-section";
import { TrendingUp,Package,Milestone   } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  // const [isDashboardData, setIsDashboardData] = useState(false);
  const isDashboardData = true
  const [latestSuccess, setLatestSuccess] = useState<DemandEntry[]>([]);
  const [latestFailed, setLatestFailed] = useState<DemandEntry[]>([]);
  const [channelSplitData, setChannelSplitData] = useState<ChannelSplitResponse | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null);
  const [originData, setOriginData] = useState<ChannelSplitResponse | null>(null);
  const [destinationData, setDestinationData] = useState<ChannelSplitResponse | null>(null);
  const [vehicleData, setVehicleData] = useState<ChannelSplitResponse | null>(null);
  const [customerData, setCustomerData] = useState<ChannelSplitResponse | null>(null);
  const [vehicleMapping, setVehicleMapping] = useState<VehicleMappingResponse[]>([]);
  const [lspNames, setLspNames] = useState<string[]>([]);
  
  const [selectedDateRange, setSelectedDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [selectedBucket, setSelectedBucket] = useState<string>('day');
  
  // Filter states for split sections
  const [originFilters, setOriginFilters] = useState({
    destination: '',
    vehicle: '',
    customer: ''
  });
  const [destinationFilters, setDestinationFilters] = useState({
    origin: '',
    vehicle: '',
    customer: ''
  });
  const [vehicleFilters, setVehicleFilters] = useState({
    origin: '',
    destination: '',
    customer: ''
  });
  const [customerFilters, setCustomerFilters] = useState({
    origin: '',
    destination: '',
    vehicle: ''
  });

  // Hardcoded options for now
  const locationOptions = ['varanasi', 'mumbai', 'surat', 'delhi', 'pune'];

  useEffect(() => {
    startAuthHeartbeat();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [successRes, failedRes] = await Promise.all([
          getLatestPublishedDemands("FT", 10),
          getLatestFailedDemands("FT", 10),
        ]);
        setLatestSuccess(successRes.entries || []);
        setLatestFailed(failedRes.entries || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
    const id = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (selectedDateRange.from && selectedDateRange.to) {
      fetchChannelSplitData();
      fetchTrendsData();
      fetchSplitData();
    }
  }, [selectedDateRange, selectedBucket]);

  useEffect(() => {
    fetchStaticData();
  }, []);

  useEffect(() => {
    fetchSplitData();
  }, [originFilters, destinationFilters, vehicleFilters, customerFilters]);

  const fetchStaticData = async () => {
    try {
      const [vehicleRes, lspRes] = await Promise.all([
        getVehicleMapping("FT"),
        getLspNames("FT")
      ]);
      setVehicleMapping(vehicleRes);
      setLspNames(lspRes.lsp_names);
    } catch (error) {
      console.error('Error fetching static data:', error);
    }
  };

  const fetchChannelSplitData = async () => {
    try {
      const response = await getChannelSplitData(
        "FT",
        "demand",
        selectedDateRange.from,
        selectedDateRange.to
      );
      setChannelSplitData(response);
    } catch (error) {
      console.error('Error fetching channel split data:', error);
      // Fallback to mock data if API fails
      setChannelSplitData({
        entity: "demand",
        rows: mockDashboardData["Channel split"].map(item => ({
          key: item.channelName.toLowerCase(),
          count: item.count
        })),
        total: mockDashboardData["Channel split"].reduce((sum, item) => sum + item.count, 0)
      });
    }
  };

  const fetchTrendsData = async () => {
    try {
      const response = await getTrendsData(
        "FT",
        selectedBucket,
        selectedDateRange.from,
        selectedDateRange.to
      );
      setTrendsData(response);
    } catch (error) {
      console.error('Error fetching trends data:', error);
      // Fallback to mock data if API fails
      setTrendsData({
        buckets: ["2025-08-01", "2025-08-02", "2025-08-03", "2025-08-04", "2025-08-05"],
        counts: [12, 18, 7, 25, 14]
      });
    }
  };

  const fetchSplitData = async () => {
    if (!selectedDateRange.from || !selectedDateRange.to) return;

    try {
      const [originRes, destinationRes, vehicleRes, customerRes] = await Promise.all([
        getOriginSplitData("FT", "demand", selectedDateRange.from, selectedDateRange.to, 
          originFilters.destination, originFilters.vehicle, originFilters.customer),
        getDestinationSplitData("FT", "demand", selectedDateRange.from, selectedDateRange.to, 
          destinationFilters.origin, destinationFilters.vehicle, destinationFilters.customer),
        getVehicleSplitData("FT", "demand", selectedDateRange.from, selectedDateRange.to, 
          vehicleFilters.origin, vehicleFilters.destination, vehicleFilters.customer),
        getCustomerSplitData("FT", "demand", selectedDateRange.from, selectedDateRange.to, 
          customerFilters.origin, customerFilters.destination, customerFilters.vehicle)
      ]);

      setOriginData(originRes);
      setDestinationData(destinationRes);
      setVehicleData(vehicleRes);
      setCustomerData(customerRes);
    } catch (error) {
      console.error('Error fetching split data:', error);
      // Set fallback data
      const fallbackData = {
        entity: "demand",
        rows: [
          { key: "Sample Data", count: 10 },
          { key: "Another Sample", count: 15 }
        ],
        total: 25
      };
      setOriginData(fallbackData);
      setDestinationData(fallbackData);
      setVehicleData(fallbackData);
      setCustomerData(fallbackData);
    }
  };

  const handleDateRangeChange = (from: string, to: string) => {
    setSelectedDateRange({ from, to });
  };

  const handleBucketChange = (bucket: string) => {
    setSelectedBucket(bucket);
  };

  const handleViewAllClick = () => {
    navigate('/dashboard/spreadsheet');
  };

  // Get current data for display (API data or fallback to mock)
  const getCurrentChannelData = () => {
    if (channelSplitData) {
      return channelSplitData.rows;
    }
    return mockDashboardData["Channel split"].map(item => ({
      key: item.channelName.toLowerCase(),
      count: item.count
    }));
  };

  const getCurrentTotal = () => {
    if (channelSplitData) {
      return channelSplitData.total;
    }
    return mockDashboardData["Channel split"].reduce((sum, item) => sum + item.count, 0);
  };

  const getCurrentTrendsData = () => {
    if (trendsData) {
      return trendsData;
    }
    return {
      buckets: ["2025-08-01", "2025-08-02", "2025-08-03", "2025-08-04", "2025-08-05"],
      counts: [12, 18, 7, 25, 14]
    };
  };

  return (
    <div className="flex flex-col h-full w-full py-6 px-12 mb-48">
      <h3 className="text-xl font-semibold py-6">Demand aggregator hub</h3>
      {!isDashboardData ? (
        <NewDashboard />
      ) : (
        <div>
          <div className="flex flex-row justify-between">
            <h3 className="text-md font-semibold">Latest published demands</h3>
            <button
              onClick={handleViewAllClick}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all
              <FontAwesomeIcon
                size="sm"
                icon={faChevronRight}
                className="px-2 text-gray-400"
              />
            </button>
          </div>
          <div className="flex flex-row gap-4 overflow-x-auto">
            {latestSuccess.map((d) => (
              <DemandCard key={d.id} demand={d} variant="success" />
            ))}
          </div>
          <div className="">
            <h3 className="text-md font-semibold my-4">Unpublished load</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {latestFailed.map((d) => (
                <DemandCard key={d.id} demand={d} variant="failed" />
              ))}
            </div>
          </div>
          <div className="pt-4">
            <div className="flex flex-row justify-between mb-4">
              <h3 className="text-md font-semibold">Aggregator analytics</h3>
            </div>
            
            {/* Dashboard Filters */}
            <DashboardFilters
              onDateRangeChange={handleDateRangeChange}
              onStatusChange={() => {}}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
  {/* Channel Split and Trends in the same row */}
  <div className="border p-2 rounded-md">
    <h3 className="text-sm font-semibold pb-4 flex items-center gap-2">
    <Milestone    className="w-4 h-4 text-blue-600" />
    Channel wise aggregation split
  </h3>

    {getCurrentChannelData().length === 0 ? (
      // -------- Empty State --------
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 font-medium">No data available</p>
        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
      </div>
    ) : (
      // -------- Pie + Legend --------
      <div className="flex flex-row justify-around">
        <div className="h-80 w-80 p-0">
          <ChannelSplitPie data={getCurrentChannelData()} />
        </div>

        {/* Legend + Total */}
        <div className="w-1/2 pt-4 text-sm flex flex-col">
          {/* Scrollable legend */}
          <div className="flex-1 overflow-y-auto">
            {getCurrentChannelData().map(({ key, count }, index) => {
              const label = key && key.trim() !== "" ? key : "Unknown";
              return (
                <div
                  key={label.toLowerCase()}
                  className="flex justify-between items-center w-full font-semibold pb-2"
                >
                  {/* Left side: color dot + label */}
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <p className="capitalize">{label}</p>
                  </div>

                  {/* Right side: count */}
                  <p>{count}</p>
                </div>
              );
            })}
          </div>

          {/* Total row fixed at bottom */}
          <div className="flex justify-between items-center mt-3 border-t-2 border-blue-100 bg-blue-50 rounded-lg px-3 py-2 mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-900">Total</span>
            </div>
            <span className="text-sm font-bold text-blue-900">
              {getCurrentTotal()}
            </span>
          </div>
        </div>
      </div>
    )}
  </div>

  {/* Trends Chart */}
  <TrendChart
    data={getCurrentTrendsData()}
    onBucketChange={handleBucketChange}
    selectedBucket={selectedBucket}
  />
</div>


            {/* Split Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Origin Split */}
              <SplitSection
                title="Origin Split"
                data={originData?.rows || []}
                total={originData?.total || 0}
                dropdowns={{
                  destination: {
                    value: originFilters.destination,
                    onChange: (value) => setOriginFilters(prev => ({ ...prev, destination: value })),
                    options: locationOptions
                  },
                  vehicle: {
                    value: originFilters.vehicle,
                    onChange: (value) => setOriginFilters(prev => ({ ...prev, vehicle: value })),
                    options: vehicleMapping.map(v => ({ id: v.vehicle_id, name: v.vehicle_name }))
                  },
                  customer: {
                    value: originFilters.customer,
                    onChange: (value) => setOriginFilters(prev => ({ ...prev, customer: value })),
                    options: lspNames
                  }
                }}
                isLoading={!originData}
              />

              {/* Destination Split */}
              <SplitSection
                title="Destination Split"
                data={destinationData?.rows || []}
                total={destinationData?.total || 0}
                dropdowns={{
                  origin: {
                    value: destinationFilters.origin,
                    onChange: (value) => setDestinationFilters(prev => ({ ...prev, origin: value })),
                    options: locationOptions
                  },
                  vehicle: {
                    value: destinationFilters.vehicle,
                    onChange: (value) => setDestinationFilters(prev => ({ ...prev, vehicle: value })),
                    options: vehicleMapping.map(v => ({ id: v.vehicle_id, name: v.vehicle_name }))
                  },
                  customer: {
                    value: destinationFilters.customer,
                    onChange: (value) => setDestinationFilters(prev => ({ ...prev, customer: value })),
                    options: lspNames
                  }
                }}
                isLoading={!destinationData}
              />

              {/* Vehicle Split */}
              <SplitSection
                title="Vehicle Split"
                data={vehicleData?.rows || []}
                total={vehicleData?.total || 0}
                dropdowns={{
                  origin: {
                    value: vehicleFilters.origin,
                    onChange: (value) => setVehicleFilters(prev => ({ ...prev, origin: value })),
                    options: locationOptions
                  },
                  destination: {
                    value: vehicleFilters.destination,
                    onChange: (value) => setVehicleFilters(prev => ({ ...prev, destination: value })),
                    options: locationOptions
                  },
                  customer: {
                    value: vehicleFilters.customer,
                    onChange: (value) => setVehicleFilters(prev => ({ ...prev, customer: value })),
                    options: lspNames
                  }
                }}
                isLoading={!vehicleData}
              />

              {/* Customer Split */}
              <SplitSection
                title="Customer Split"
                data={customerData?.rows || []}
                total={customerData?.total || 0}
                dropdowns={{
                  origin: {
                    value: customerFilters.origin,
                    onChange: (value) => setCustomerFilters(prev => ({ ...prev, origin: value })),
                    options: locationOptions
                  },
                  destination: {
                    value: customerFilters.destination,
                    onChange: (value) => setCustomerFilters(prev => ({ ...prev, destination: value })),
                    options: locationOptions
                  },
                  vehicle: {
                    value: customerFilters.vehicle,
                    onChange: (value) => setCustomerFilters(prev => ({ ...prev, vehicle: value })),
                    options: vehicleMapping.map(v => ({ id: v.vehicle_id, name: v.vehicle_name }))
                  }
                }}
                isLoading={!customerData}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
