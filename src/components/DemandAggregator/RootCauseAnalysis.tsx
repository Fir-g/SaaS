import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import SunburstChart from './SunburstChart';
import { getRootCauseAnalysis, RootCauseData } from '@/services/rootCauseService';

interface RootCauseAnalysisProps {
  entityType?: string;
  title?: string;
  description?: string;
  showSummaryStats?: boolean;
  showDetailedBreakdown?: boolean;
  chartHeight?: string;
}

const RootCauseAnalysis: React.FC<RootCauseAnalysisProps> = ({
  entityType = 'FT',
  title = 'Root Cause Analysis',
  description = 'Analyze failure patterns and identify root causes for unpublished demands',
  showSummaryStats = true,
  showDetailedBreakdown = true,
  chartHeight = 'h-96'
}) => {
  const { getToken } = useAuth();
  const getClerkBearer = useCallback(async () => {
    const template = import.meta.env.VITE_CLERK_TOKEN_TEMPLATE as string | undefined;
    return getToken({ template, skipCache: true });
  }, [getToken]);

  const [rcaData, setRcaData] = useState<RootCauseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRCAData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getClerkBearer();
      const response = await getRootCauseAnalysis(entityType, token);
      setRcaData(response);
    } catch (err) {
      console.error('Error fetching RCA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch root cause analysis data');
      setRcaData([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, getClerkBearer]);

  useEffect(() => {
    fetchRCAData();
  }, [fetchRCAData]);

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12 lg:py-16">
      <div className="animate-spin rounded-full h-10 w-10 lg:h-12 lg:w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
      <span className="text-gray-600 font-medium text-sm lg:text-base">Loading root cause analysis...</span>
    </div>
  );

  const ErrorState = () => (
    <div className="text-center py-12 lg:py-16 px-4 lg:px-6 max-w-md mx-auto">
      <div className="mx-auto flex items-center justify-center h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-red-100 mb-4 lg:mb-6">
        <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
      </div>
      <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
      <p className="text-gray-600 mb-4 lg:mb-6 leading-relaxed text-sm lg:text-base">{error}</p>
      <button
        onClick={fetchRCAData}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm lg:text-base"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </button>
    </div>
  );

  const NoIssuesState = () => (
    <div className="text-center py-12 lg:py-16 px-4 lg:px-6 max-w-md mx-auto">
      <div className="mx-auto flex items-center justify-center h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-green-100 mb-4 lg:mb-6">
        <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
      </div>
      <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">All demand are published </h3>
      <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
        Great! No failure patterns detected at this time.
      </p>
    </div>
  );

  return (
    <div className="w-full mx-auto space-y-6 lg:space-y-8 p-4 lg:p-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 truncate">{title}</h2>
          <p className="text-gray-600 text-base lg:text-lg leading-relaxed">{description}</p>
        </div>
        <button
          onClick={fetchRCAData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 lg:px-4 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-lg border-0 bg-white overflow-hidden">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : rcaData.length === 0 ? (
            <NoIssuesState />
          ) : (
                <div className={`w-full ${chartHeight} min-h-[300px] lg:min-h-[500px]`}>
                  <SunburstChart data={rcaData} />
                </div>          
          )}
      </Card>
    </div>
  );
};

export default RootCauseAnalysis;