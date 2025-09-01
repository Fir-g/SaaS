import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import DemandCard from "./demand-card";
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
  VehicleMappingResponse,
} from "@/services/demandAggregatorService";
import { DemandEntry } from "@/types/demand";
import { startAuthHeartbeat } from "@/services/authService";
import NewDemandAggregator from "./new-demandaggregator";
import DemandAggregatorFilters from "./demandaggregator-filters";
import ChannelSplitPie, { COLORS } from "./channel-split-pie";
import TrendChart from "./trend-chart";
import SplitBarChart from "./split-bar-chart";
import { TrendingUp, Package, Milestone } from "lucide-react";
import { tokenRefreshEmitter } from "@/utils/api/api";
import ODVLSPFilter from "./ODVLSPFilter";
import ODVLSPTable from "./ODVLSPTable";



const DemandAggregator = () => {
  const navigate = useNavigate();
  const isDemandAggregatorData = true;
  const [latestSuccess, setLatestSuccess] = useState<DemandEntry[]>([]);
  const [latestFailed, setLatestFailed] = useState<DemandEntry[]>([]);
  const [channelSplitData, setChannelSplitData] =
    useState<ChannelSplitResponse | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null);
  const [originData, setOriginData] = useState<ChannelSplitResponse | null>(
    null
  );
  const [destinationData, setDestinationData] =
    useState<ChannelSplitResponse | null>(null);
  const [vehicleData, setVehicleData] = useState<ChannelSplitResponse | null>(
    null
  );
  const [customerData, setCustomerData] = useState<ChannelSplitResponse | null>(
    null
  );
  const [vehicleMapping, setVehicleMapping] = useState<
    VehicleMappingResponse[]
  >([]);
  const [lspNames, setLspNames] = useState<string[]>([]);

  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });
  const [selectedBucket, setSelectedBucket] = useState<string>("day");
  const [selectedStatusParam, setSelectedStatusParam] =
    useState<string>("PUBLISHED,COMPLETE");

  // Filter states for split sections
  const [originFilters, setOriginFilters] = useState({
    destination: "",
    vehicle: "",
    customer: "",
  });
  const [destinationFilters, setDestinationFilters] = useState({
    origin: "",
    vehicle: "",
    customer: "",
  });
  const [vehicleFilters, setVehicleFilters] = useState({
    origin: "",
    destination: "",
    customer: "",
  });
  const [customerFilters, setCustomerFilters] = useState({
    origin: "",
    destination: "",
    vehicle: "",
  });

  const [odvlspFilters, setODVLSPFilters] = useState({
  origins: [],
  destinations: [],
  lsp_names: [],
  vehicle_ids: []
  });

  useEffect(() => {
    startAuthHeartbeat();
  }, []);

  // Function to refresh all DemandAggregator data
  const refreshAllDemandAggregatorData = async () => {
    try {
      // Refresh latest demands
      const [successRes, failedRes] = await Promise.all([
        getLatestPublishedDemands("FT", 10),
        getLatestFailedDemands("FT", 10),
      ]);
      setLatestSuccess(successRes.entries || []);
      setLatestFailed(failedRes.entries || []);

      // Refresh other data if date range is available
      if (selectedDateRange.from && selectedDateRange.to) {
        await Promise.all([
          fetchChannelSplitData(),
          fetchTrendsData(),
          fetchSplitData(),
        ]);
      }
    } catch (error) {
      console.error(
        "Error refreshing DemandAggregator data after token refresh:",
        error
      );
    }
  };

  // Listen for token refresh events
  useEffect(() => {
    const handleTokenRefresh = () => {
      console.log("Token refreshed, refreshing DemandAggregator data...");
      refreshAllDemandAggregatorData();
    };

    tokenRefreshEmitter.addEventListener("tokenRefresh", handleTokenRefresh);

    return () => {
      tokenRefreshEmitter.removeEventListener(
        "tokenRefresh",
        handleTokenRefresh
      );
    };
  }, [selectedDateRange, selectedBucket, selectedStatusParam]);

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
        // Set empty arrays on error
        setLatestSuccess([]);
        setLatestFailed([]);
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
  }, [selectedDateRange, selectedBucket, selectedStatusParam]);

  useEffect(() => {
    if (selectedDateRange.from && selectedDateRange.to) {
      fetchSplitData();
    }
  }, [selectedDateRange, selectedStatusParam]);

  const fetchChannelSplitData = async () => {
    try {
      const response = await getChannelSplitData(
        "FT",
        "demand",
        selectedDateRange.from,
        selectedDateRange.to,
        selectedStatusParam
      );
      setChannelSplitData(response);
    } catch (error) {
      console.error("Error fetching channel split data:", error);
      setChannelSplitData(null);
    }
  };

  const fetchTrendsData = async () => {
    try {
      const response = await getTrendsData(
        "FT",
        selectedBucket,
        selectedDateRange.from,
        selectedDateRange.to,
        selectedStatusParam
      );
      setTrendsData(response);
    } catch (error) {
      console.error("Error fetching trends data:", error);
      setTrendsData(null);
    }
  };

  const fetchSplitData = async () => {
    if (!selectedDateRange.from || !selectedDateRange.to) return;

    try {
      const [originRes, destinationRes, vehicleRes, customerRes] =
        await Promise.all([
          getOriginSplitData(
            "FT",
            "demand",
            selectedDateRange.from,
            selectedDateRange.to,
            "",
            "",
            "",
            selectedStatusParam
          ),
          getDestinationSplitData(
            "FT",
            "demand",
            selectedDateRange.from,
            selectedDateRange.to,
            "",
            "",
            "",
            selectedStatusParam
          ),
          getVehicleSplitData(
            "FT",
            "demand",
            selectedDateRange.from,
            selectedDateRange.to,
            "",
            "",
            "",
            selectedStatusParam
          ),
          getCustomerSplitData(
            "FT",
            "demand",
            selectedDateRange.from,
            selectedDateRange.to,
            "",
            "",
            "",
            selectedStatusParam
          ),
        ]);

      setOriginData(originRes);
      setDestinationData(destinationRes);
      setVehicleData(vehicleRes);
      setCustomerData(customerRes);
    } catch (error) {
      console.error("Error fetching split data:", error);
      setOriginData(null);
      setDestinationData(null);
      setVehicleData(null);
      setCustomerData(null);
    }
  };

  const handleDateRangeChange = (from: string, to: string) => {
    setSelectedDateRange({ from, to });
  };

  const handleBucketChange = (bucket: string) => {
    setSelectedBucket(bucket);
  };

  const handleStatusChange = (statuses: string[], statusParam: string) => {
    setSelectedStatusParam(statusParam);
  };

  const handleViewAllClick = () => {
    navigate("/DemandAggregator/spreadsheet");
  };

  const handleODVLSPFiltersChange = (filters: any) => {
  setODVLSPFilters(filters);
  };
  // Get current data for display
  const getCurrentChannelData = () => {
    if (channelSplitData && channelSplitData.rows) {
      return channelSplitData.rows;
    }
    return [];
  };

  const getCurrentTotal = () => {
    if (channelSplitData && channelSplitData.total !== undefined) {
      return channelSplitData.total;
    }
    return 0;
  };

  const getCurrentTrendsData = () => {
    if (trendsData) {
      return trendsData;
    }
    return {
      buckets: [],
      counts: [],
    };
  };

  return (
    <div className="flex flex-col h-full w-full py-6 px-4 sm:px-6 lg:px-12 mb-48">
      <h3 className="text-xl font-semibold py-6">Demand aggregator hub</h3>
      {!isDemandAggregatorData ? (
        <NewDemandAggregator />
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
          <div
            className="flex flex-row gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {latestSuccess.length > 0 ? (
              latestSuccess.map((d) => (
                <DemandCard key={d.id} demand={d} variant="success" />
              ))
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-500 min-w-full">
                <Package className="w-8 h-8 mr-2" />
                <span>No published demands available</span>
              </div>
            )}
          </div>
          <div className="">
            <h3 className="text-md font-semibold my-4">Unpublished load</h3>
            <div
              className="flex flex-row gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              {latestFailed.length > 0 ? (
                latestFailed.map((d) => (
                  <DemandCard key={d.id} demand={d} variant="failed" />
                ))
              ) : (
                <div className="flex items-center justify-center py-8 text-gray-500 min-w-full">
                  <Package className="w-8 h-8 mr-2" />
                  <span>No unpublished loads available</span>
                </div>
              )}
            </div>
          </div>
          <div className="pt-4">
            <div className="flex flex-row justify-between mb-4">
              <h3 className="text-md font-semibold">Aggregator analytics</h3>
            </div>

            {/* DemandAggregator Filters */}
            <DemandAggregatorFilters
              onDateRangeChange={handleDateRangeChange}
              onStatusChange={handleStatusChange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
              {/* Channel Split and Trends in the same row */}
              <div className="border p-2 rounded-lg shadow-sm bg-white">
                <h3 className="text-sm font-semibold pb-4 flex items-center gap-2 bg-white">
                  <Milestone className="w-4 h-4 text-blue-600" />
                  Channel wise aggregation split
                </h3>

                {getCurrentChannelData().length === 0 ? (
                  // -------- Empty State --------
                  <div className="flex-1 flex flex-col items-center justify-center py-12 bg-white">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      No data available
                    </h4>
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                      We couldn't find any data for the selected filters. Try
                      adjusting your date range or criteria.
                    </p>
                  </div>
                ) : (
                  // -------- Pie + Legend --------
                  <div className="flex flex-col lg:flex-row justify-around">
                    <div className="h-60 w-60 sm:h-80 sm:w-80 mx-auto lg:mx-0 p-0">
                      <ChannelSplitPie data={getCurrentChannelData()} />
                    </div>

                    {/* Legend + Total */}
                    <div className="w-full lg:w-1/2 pt-4 text-sm flex flex-col">
                      {/* Scrollable legend with hidden scrollbar */}
                      <div className="flex-1 overflow-y-auto scrollbar-none max-h-60">
                        {getCurrentChannelData().map(
                          ({ key, count }, index) => {
                            const label =
                              key && key.trim() !== "" ? key : "Unknown";
                            return (
                              <div
                                key={`${label.toLowerCase()}-${index}`}
                                className="flex justify-between items-center w-full font-semibold pb-2"
                              >
                                {/* Left side: color dot + label */}
                                <div className="flex items-center space-x-2">
                                  <span
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        COLORS[index % COLORS.length],
                                    }}
                                  ></span>
                                  <p className="capitalize truncate">{label}</p>
                                </div>

                                {/* Right side: count */}
                                <p className="flex-shrink-0">{count}</p>
                              </div>
                            );
                          }
                        )}
                      </div>

                      {/* Total row fixed at bottom */}
                      <div className="flex justify-between items-center mt-3 border-t-2 border-blue-100 bg-blue-50 rounded-lg px-3 py-2 mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-bold text-blue-900">
                            Total
                          </span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
              <SplitBarChart
                title="Origin Split"
                data={originData?.rows || []}
                total={originData?.total || 0}
                isLoading={!originData}
              />

              <SplitBarChart
                title="Destination Split"
                data={destinationData?.rows || []}
                total={destinationData?.total || 0}
                isLoading={!destinationData}
              />

              <SplitBarChart
                title="Vehicle Split"
                data={vehicleData?.rows || []}
                total={vehicleData?.total || 0}
                isLoading={!vehicleData}
              />

              <SplitBarChart
                title="Customer Split"
                data={customerData?.rows || []}
                total={customerData?.total || 0}
                isLoading={!customerData}
              />
            </div>
            {/* table section */}
            <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">ODV LSP Analysis</h3>
            
            {/* ODV LSP Filters */}
            <ODVLSPFilter onFiltersChange={handleODVLSPFiltersChange} />
            
            {/* ODV LSP Table */}
            <ODVLSPTable
              dateRange={selectedDateRange}
              statusParam={selectedStatusParam}
              filters={odvlspFilters}
            />
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandAggregator;
