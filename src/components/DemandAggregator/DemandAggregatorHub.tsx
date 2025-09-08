import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TrendingUp, Package, Milestone } from "lucide-react";

import DemandCard from "./demand-card";
import DemandAggregatorFilters from "./demandaggregator-filters";
import ChannelSplitPie, { COLORS } from "./channel-split-pie";
import TrendChart from "./trend-chart";
import SplitBarChart from "./split-bar-chart";
import NewDemandAggregator from "./new-demandaggregator";
import Loader from "@/components/ui/loader";

import {
  getLatestFailedDemands,
  getLatestPublishedDemands,
  getChannelSplitData,
  getTrendsData,
  getOriginSplitData,
  getDestinationSplitData,
  getVehicleSplitData,
  getCustomerSplitData,
  ChannelSplitResponse,
  TrendsResponse,
} from "@/services/demandAggregatorService";
import { DemandEntry } from "@/types/demand";

const DemandAggregatorHub: React.FC = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const getClerkBearer = useCallback(async () => {
    const template = import.meta.env.VITE_CLERK_TOKEN_TEMPLATE as
      | string
      | undefined;
    return getToken({ template, skipCache: true });
  }, [getToken]);

  const [latestSuccess, setLatestSuccess] = useState<DemandEntry[]>([]);
  const [latestFailed, setLatestFailed] = useState<DemandEntry[]>([]);
  const [isLoadingLatest, setIsLoadingLatest] = useState<boolean>(false);
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

  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });
  const [selectedBucket, setSelectedBucket] = useState<string>("day");
  const [selectedStatusParam, setSelectedStatusParam] =
    useState<string>("PUBLISHED,COMPLETE");

  const isDemandAggregatorData =
    latestSuccess.length > 0 || latestFailed.length > 0;

  // Fetch latest demands on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingLatest(true);
        const token = await getClerkBearer();
        const [successRes, failedRes] = await Promise.all([
          getLatestPublishedDemands("FT", 10, token),
          getLatestFailedDemands("FT", 10, token),
        ]);
        setLatestSuccess(successRes.entries || []);
        setLatestFailed(failedRes.entries || []);
      } catch (e) {
        console.error(e);
        setLatestSuccess([]);
        setLatestFailed([]);
      } finally {
        setIsLoadingLatest(false);
      }
    };
    fetchData();
    const id = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(id);
  }, [getClerkBearer]);

  // Fetch analytics data when date range changes
  useEffect(() => {
    if (selectedDateRange.from && selectedDateRange.to) {
      fetchChannelSplitData();
      fetchTrendsData();
      fetchSplitData();
    }
  }, [selectedDateRange, selectedBucket, selectedStatusParam]);

  const fetchChannelSplitData = async () => {
    try {
      const token = await getClerkBearer();
      const response = await getChannelSplitData(
        "FT",
        "demand",
        selectedDateRange.from,
        selectedDateRange.to,
        selectedStatusParam,
        token
      );
      setChannelSplitData(response);
    } catch (error) {
      console.error("Error fetching channel split data:", error);
      setChannelSplitData(null);
    }
  };

  const fetchTrendsData = async () => {
    try {
      const token = await getClerkBearer();
      const response = await getTrendsData(
        "FT",
        selectedBucket,
        selectedDateRange.from,
        selectedDateRange.to,
        selectedStatusParam,
        token
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
      const token = await getClerkBearer();
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
            selectedStatusParam,
            token
          ),
          getDestinationSplitData(
            "FT",
            "demand",
            selectedDateRange.from,
            selectedDateRange.to,
            "",
            "",
            "",
            selectedStatusParam,
            token
          ),
          getVehicleSplitData(
            "FT",
            "demand",
            selectedDateRange.from,
            selectedDateRange.to,
            "",
            "",
            "",
            selectedStatusParam,
            token
          ),
          getCustomerSplitData(
            "FT",
            "demand",
            selectedDateRange.from,
            selectedDateRange.to,
            "",
            "",
            "",
            selectedStatusParam,
            token
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

  const handleDateRangeChange = (from: string, to: string) =>
    setSelectedDateRange({ from, to });
  const handleBucketChange = (bucket: string) => setSelectedBucket(bucket);
  const handleStatusChange = (_statuses: string[], statusParam: string) =>
    setSelectedStatusParam(statusParam);
  const handleViewAllClick = () => navigate("/integrations/google-sheets-integration");

  const getCurrentChannelData = () =>
    channelSplitData?.rows ? channelSplitData.rows : [];
  const getCurrentTotal = () => channelSplitData?.total ?? 0;
  const getCurrentTrendsData = () =>
    trendsData || {
      buckets: [],
      counts: [],
    };

  if (isLoadingLatest) {
    return (
      <div className="w-full h-full flex items-center justify-center py-12">
        <Loader />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!isDemandAggregatorData) {
    return <NewDemandAggregator />;
  }

  return (
    <div className="w-full -mt-6 space-y-1 lg:space-y-2 overflow-x-hidden">
      {/* Latest Published Demands */}
      <section className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
          <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-1">
            Latest published demands
          </h3>
          <button
            onClick={handleViewAllClick}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm lg:text-base font-medium self-start sm:self-auto"
          >
            <span>View all</span>
            <FontAwesomeIcon
              size="sm"
              icon={faChevronRight}
              className="text-gray-400"
            />
          </button>
        </div>

        {/* Row-only horizontal scroll */}
        <div
          className="w-full max-w-full overflow-x-auto pb-1 
     [&::-webkit-scrollbar]:hidden"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <div className="flex flex-nowrap gap-4 lg:gap-6 w-full">
            {latestSuccess.length > 0 ? (
              latestSuccess.map((d) => (
                <div
                  key={d.id}
                  className="shrink-0 basis-[280px] sm:basis-[300px] lg:basis-[320px] xl:basis-[360px]"
                >
                  <DemandCard demand={d} variant="success" />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-6 lg:py-8 text-muted-foreground w-full">
                <Package className="w-6 h-6 lg:w-8 lg:h-8 mr-2 lg:mr-3" />
                <span className="text-sm lg:text-base">
                  No published demands available
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Unpublished Load */}
      <section className="w-full">
        <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-1">
          Unpublished load
        </h3>

        <div
          className="w-full max-w-full overflow-x-auto pb-1 
     [&::-webkit-scrollbar]:hidden"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <div className="flex flex-nowrap gap-4 lg:gap-6 w-full">
            {latestFailed.length > 0 ? (
              latestFailed.map((d) => (
                <div
                  key={d.id}
                  className="shrink-0 basis-[280px] sm:basis-[300px] lg:basis-[320px] xl:basis-[360px]"
                >
                  <DemandCard demand={d} variant="failed" />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-6 lg:py-8 text-muted-foreground w-full">
                <Package className="w-6 h-6 lg:w-8 lg:h-8 mr-2 lg:mr-3" />
                <span className="text-sm lg:text-base">
                  No unpublished loads available
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Aggregator Analytics */}
      <section className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1 lg:mb-2">
          <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-1">
            Aggregator analytics
          </h3>
        </div>

        {/* Filters */}
        <DemandAggregatorFilters
          onDateRangeChange={handleDateRangeChange}
          onStatusChange={handleStatusChange}
        />

        {/* Channel Split and Trends */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Channel Split */}
          <div className="w-full border border-border rounded-xl p-3 lg:p-4 shadow-sm bg-card">
            <h3 className="text-base lg:text-lg font-semibold pb-3 lg:pb-4 flex items-center gap-2 lg:gap-3">
              <Milestone className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
              <span>Channel wise aggregation split</span>
            </h3>

            {getCurrentChannelData().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 lg:py-8">
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-muted rounded-full flex items-center justify-center mb-3 lg:mb-4">
                  <Package className="w-7 h-7 lg:w-8 lg:h-8 text-muted-foreground" />
                </div>
                <h4 className="text-base lg:text-lg font-semibold text-foreground mb-1">
                  No data available
                </h4>
                <p className="text-sm lg:text-base text-muted-foreground text-center max-w-sm">
                  We couldn't find any data for the selected filters. Try
                  adjusting your date range or criteria.
                </p>
              </div>
            ) : (
              <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 items-center xl:items-start">
                <div className="w-full max-w-sm xl:max-w-none xl:w-72 h-56 lg:h-64 mx-auto xl:mx-0 flex-shrink-0">
                  <ChannelSplitPie data={getCurrentChannelData()} />
                </div>

                <div className="w-full xl:flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto max-h-52 lg:max-h-64 space-y-2 lg:space-y-3">
                    {getCurrentChannelData().map(({ key, count }, index) => {
                      const label = key && key.trim() !== "" ? key : "Unknown";
                      return (
                        <div
                          key={`${label.toLowerCase()}-${index}`}
                          className="flex justify-between items-center w-full p-2 lg:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                            <span
                              className="w-3 h-3 lg:w-4 lg:h-4 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            ></span>
                            <p className="text-sm lg:text-base font-medium capitalize truncate">
                              {label}
                            </p>
                          </div>
                          <p className="text-sm lg:text-base font-semibold flex-shrink-0 ml-4">
                            {count}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mt-3 lg:mt-4 border-t-2 border-primary/20 bg-primary/10 rounded-lg px-3 lg:px-4 py-2 lg:py-3">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                      <span className="text-sm lg:text-base font-bold text-primary">
                        Total
                      </span>
                    </div>
                    <span className="text-sm lg:text-base font-bold text-primary">
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
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
      </section>
    </div>
  );
};
export default DemandAggregatorHub;
