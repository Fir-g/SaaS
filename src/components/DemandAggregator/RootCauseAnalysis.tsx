import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, TrendingDown, Target, BarChart3 } from 'lucide-react';
import SunburstChart from './SunburstChart';
import RCAFilter from './rca-filter';
import { getRootCauseAnalysis, RootCauseData } from '@/services/rootCauseService';
import { getLspNames, LspNamesResponse } from '@/services/demandAggregatorService';

interface RootCauseAnalysisProps {
  entityType?: string;
  title?: string;
  description?: string;
  showSummaryStats?: boolean;
  showDetailedBreakdown?: boolean;
  chartHeight?: string;
  className?: string;
}

const RootCauseAnalysis: React.FC<RootCauseAnalysisProps> = ({
  entityType = 'FT',
  title = 'Root Cause Analysis',
  description = 'Analyze failure patterns and identify root causes for unpublished demands',
  showSummaryStats = true,
  showDetailedBreakdown = true,
  chartHeight = 'h-80 sm:h-86',
  className = '',
}) => {
  const { getToken } = useAuth();
  
  const getClerkBearer = useCallback(async () => {
    const template = import.meta.env.VITE_CLERK_TOKEN_TEMPLATE as string | undefined;
    return getToken({ template, skipCache: true });
  }, [getToken]);

  const [rcaData, setRcaData] = useState<RootCauseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableLspNames, setAvailableLspNames] = useState<string[]>([]);
  
  // Filter states
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedLspNames, setSelectedLspNames] = useState<string[]>([]);

  // Fetch available LSP names
  const fetchLspNames = useCallback(async () => {
    try {
      const token = await getClerkBearer();
      const response = await getLspNames(entityType, token);
      setAvailableLspNames(response.lsp_names || []);
    } catch (err) {
      console.error('Error fetching LSP names:', err);
      setAvailableLspNames([]);
    }
  }, [entityType, getClerkBearer]);

  const fetchRCAData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getClerkBearer();
      
      // Convert selected LSP names to comma-separated string
      const lspNamesParam = selectedLspNames.length > 0 ? selectedLspNames.join(',') : undefined;
      
      const response = await getRootCauseAnalysis(
        entityType, 
        fromDate || undefined, 
        toDate || undefined, 
        lspNamesParam, 
        token
      );
      setRcaData(response);
    } catch (err) {
      console.error('Error fetching RCA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch root cause analysis data');
      setRcaData([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, fromDate, toDate, selectedLspNames, getClerkBearer]);

  // Initial load of LSP names
  useEffect(() => {
    fetchLspNames();
  }, [fetchLspNames]);

  // Fetch RCA data when filters change
  useEffect(() => {
    if (fromDate && toDate) {
      fetchRCAData();
    }
  }, [fetchRCAData]);

  const handleDateRangeChange = useCallback((from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
  }, []);

  const handleLspNamesChange = useCallback((lspNames: string[]) => {
    setSelectedLspNames(lspNames);
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchLspNames(), fetchRCAData()]);
  }, [fetchLspNames, fetchRCAData]);

  // Memoize calculations for better performance
  const summaryStats = useMemo(() => {
    const totalFailures = rcaData.reduce((sum, item) => sum + (item.percent || 0), 0);
    const totalSubCategories = rcaData.reduce((sum, item) => sum + (item.children?.length || 0), 0);
    const rootCausesCount = rcaData.length;

    return {
      totalFailures,
      totalSubCategories,
      rootCausesCount,
    };
  }, [rcaData]);

  // Loading component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
      <span className="text-sm text-muted-foreground text-center">
        Loading root cause analysis...
      </span>
    </div>
  );

  // Error component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mb-4" />
      <h3 className="text-base sm:text-lg font-medium text-red-700 mb-2 text-center">
        Error Loading Data
      </h3>
      <p className="text-xs sm:text-sm text-red-600 text-center max-w-md mb-4 leading-relaxed">
        {error}
      </p>
      <button
        onClick={handleRefresh}
        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
      >
        Try Again
      </button>
    </div>
  );

  // No issues component
  const NoIssuesState = () => (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
      </div>
      <h3 className="text-base sm:text-lg font-medium text-green-700 mb-2 text-center">
        No Issues Found
      </h3>
      <p className="text-xs sm:text-sm text-green-600 text-center max-w-md leading-relaxed">
        Great! No failure patterns detected for the selected filters.
      </p>
    </div>
  );

  // Summary stats component
  const SummaryStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-red-700">
                {summaryStats.rootCausesCount}
              </div>
              <div className="text-xs sm:text-sm text-red-600">
                Root Causes Identified
              </div>
            </div>
            <TrendingDown className="h-6 w-6 text-red-500 opacity-70" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-orange-700">
                {summaryStats.totalFailures.toFixed(1)}%
              </div>
              <div className="text-xs sm:text-sm text-orange-600">
                Total Failure Rate
              </div>
            </div>
            <AlertTriangle className="h-6 w-6 text-orange-500 opacity-70" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200 sm:col-span-2 lg:col-span-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-blue-700">
                {summaryStats.totalSubCategories}
              </div>
              <div className="text-xs sm:text-sm text-blue-600">
                Sub-categories
              </div>
            </div>
            <BarChart3 className="h-6 w-6 text-blue-500 opacity-70" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Detailed breakdown component
  const DetailedBreakdown = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-gray-600" />
        <h4 className="text-base sm:text-lg font-semibold">Detailed Breakdown</h4>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {rcaData.map((item, index) => (
          <Card key={item.key || index} className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-sm sm:text-base lg:text-lg leading-tight">
                  {item.title}
                </CardTitle>
                <div className="self-start sm:self-center text-right">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
                    {item.percent?.toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {item.children && item.children.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <h5 className="font-medium text-xs sm:text-sm text-gray-700 mb-3">
                    Sub-categories ({item.children.length}):
                  </h5>
                  <div className="space-y-2">
                    {item.children.map((child, childIndex) => (
                      <div
                        key={child.key || childIndex}
                        className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-xs sm:text-sm font-medium text-gray-800 leading-tight">
                          {child.title}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 font-medium ml-2 flex-shrink-0">
                          {child.percent?.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const hasData = rcaData.length > 0;

  return (
    <div className={`w-full space-y-3 sm:space-y-4 ${className}`}>
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <RCAFilter
        onDateRangeChange={handleDateRangeChange}
        onLspNamesChange={handleLspNamesChange}
        availableLspNames={availableLspNames}
      />

      {/* Main Content Card */}
      <Card className="shadow-sm">
        <CardHeader className="py-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Failure Analysis
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-4 pb-4">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : !hasData ? (
            <NoIssuesState />
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              {/* {showSummaryStats && <SummaryStats />} */}

              {/* Chart Section */}
              <div className="bg-white border rounded-lg sm:p-4">
                <div className="w-full h-full overflow-hidden">
                  <div className={`w-full ${chartHeight} min-h-[620px]`}>
                    <SunburstChart data={rcaData} />
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              {showDetailedBreakdown && <DetailedBreakdown />}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RootCauseAnalysis;