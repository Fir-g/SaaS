import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TrendingUp, Package, Milestone } from 'lucide-react';

import DemandCard from './demand-card';
import DemandAggregatorFilters from './demandaggregator-filters';
import ChannelSplitPie, { COLORS } from './channel-split-pie';
import TrendChart from './trend-chart';
import SplitBarChart from './split-bar-chart';
import NewDemandAggregator from './new-demandaggregator';

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
} from '@/services/demandAggregatorService';
import { DemandEntry } from '@/types/demand';

const DemandAggregatorHub: React.FC = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const getClerkBearer = useCallback(async () => {
    const template = import.meta.env.VITE_CLERK_TOKEN_TEMPLATE as string | undefined;
    return getToken({ template, skipCache: true });
  }, [getToken]);

  const [latestSuccess, setLatestSuccess] = useState<DemandEntry[]>([]);
  const [latestFailed, setLatestFailed] = useState<DemandEntry[]>([]);
  const [channelSplitData, setChannelSplitData] = useState<ChannelSplitResponse | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null);
  const [originData, setOriginData] = useState<ChannelSplitResponse | null>(null);
  const [destinationData, setDestinationData] = useState<ChannelSplitResponse | null>(null);
  const [vehicleData, setVehicleData] = useState<ChannelSplitResponse | null>(null);
  const [customerData, setCustomerData] = useState<ChannelSplitResponse | null>(null);

  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: '', to: '' });
  const [selectedBucket, setSelectedBucket] = useState<string>('day');
  const [selectedStatusParam, setSelectedStatusParam] = useState<string>('PUBLISHED,COMPLETE');

  const isDemandAggregatorData = latestSuccess.length > 0 || latestFailed.length > 0;

  // Fetch latest demands on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getClerkBearer();
        const [successRes, failedRes] = await Promise.all([
          getLatestPublishedDemands('FT', 10, token),
          getLatestFailedDemands('FT', 10, token),
        ]);
        setLatestSuccess(successRes.entries || []);
        setLatestFailed(failedRes.entries || []);
      } catch (e) {
        console.error(e);
        setLatestSuccess([]);
        setLatestFailed([]);
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
        'FT',
        'demand',
        selectedDateRange.from,
        selectedDateRange.to,
        selectedStatusParam,
        token
      );
      setChannelSplitData(response);
    } catch (error) {
      console.error('Error fetching channel split data:', error);
      setChannelSplitData(null);
    }
  };

  const fetchTrendsData = async () => {
    try {
      const token = await getClerkBearer();
      const response = await getTrendsData(
        'FT',
        selectedBucket,
        selectedDateRange.from,
        selectedDateRange.to,
        selectedStatusParam,
        token
      );
      setTrendsData(response);
    } catch (error) {
      console.error('Error fetching trends data:', error);
      setTrendsData(null);
    }
  };

  const fetchSplitData = async () => {
    if (!selectedDateRange.from || !selectedDateRange.to) return;

    try {
      const token = await getClerkBearer();
      const [originRes, destinationRes, vehicleRes, customerRes] = await Promise.all([
        getOriginSplitData(
          'FT',
          'demand',
          selectedDateRange.from,
          selectedDateRange.to,
          '',
          '',
          '',
          selectedStatusParam,
          token
        ),
        getDestinationSplitData(
          'FT',
          'demand',
          selectedDateRange.from,
          selectedDateRange.to,
          '',
          '',
          '',
          selectedStatusParam,
          token
        ),
        getVehicleSplitData(
          'FT',
          'demand',
          selectedDateRange.from,
          selectedDateRange.to,
          '',
          '',
          '',
          selectedStatusParam,
          token
        ),
        getCustomerSplitData(
          'FT',
          'demand',
          selectedDateRange.from,
          selectedDateRange.to,
          '',
          '',
          '',
          selectedStatusParam,
          token
        ),
      ]);

      setOriginData(originRes);
      setDestinationData(destinationRes);
      setVehicleData(vehicleRes);
      setCustomerData(customerRes);
    } catch (error) {
      console.error('Error fetching split data:', error);
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
    navigate('/demand-aggregator/spreadsheet');
  };

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

  if (!isDemandAggregatorData) {
    return <NewDemandAggregator />;
  }

  return (
    <div className="space-y-6">
      {/* Latest Published Demands */}
      <div>
        <div className="flex flex-row justify-between mb-4">
          <h3 className="text-lg font-semibold">Latest published demands</h3>
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
          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
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
      </div>

      {/* Unpublished Load */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Unpublished load</h3>
        <div
          className="flex flex-row gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2"
          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
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

      {/* Aggregator Analytics */}
      <div>
        <div className="flex flex-row justify-between mb-4">
          <h3 className="text-lg font-semibold">Aggregator analytics</h3>
        </div>

        {/* Filters */}
        <DemandAggregatorFilters
          onDateRangeChange={handleDateRangeChange}
          onStatusChange={handleStatusChange}
        />

        {/* Channel Split and Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          {/* Channel Split */}
          <div className="border p-2 rounded-lg shadow-sm bg-white">
            <h3 className="text-sm font-semibold pb-4 flex items-center gap-2 bg-white">
              <Milestone className="w-4 h-4 text-blue-600" />
              Channel wise aggregation split
            </h3>

            {getCurrentChannelData().length === 0 ? (
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
              <div className="flex flex-col lg:flex-row justify-around">
                <div className="h-60 w-60 sm:h-80 sm:w-80 mx-auto lg:mx-0 p-0">
                  <ChannelSplitPie data={getCurrentChannelData()} />
                </div>

                <div className="w-full lg:w-1/2 pt-4 text-sm flex flex-col">
                  <div className="flex-1 overflow-y-auto scrollbar-none max-h-60">
                    {getCurrentChannelData().map(({ key, count }, index) => {
                      const label = key && key.trim() !== '' ? key : 'Unknown';
                      return (
                        <div
                          key={`${label.toLowerCase()}-${index}`}
                          className="flex justify-between items-center w-full font-semibold pb-2"
                        >
                          <div className="flex items-center space-x-2">
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            ></span>
                            <p className="capitalize truncate">{label}</p>
                          </div>
                          <p className="flex-shrink-0">{count}</p>
                        </div>
                      );
                    })}
                  </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
      </div>
    </div>
  );
};

export default DemandAggregatorHub;