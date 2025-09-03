import React, { useState } from 'react';
import DemandAggregatorFilters from './demandaggregator-filters';
import ODVLSPFilter from './ODVLSPFilter';
import ODVLSPTable from './ODVLSPTable';

const ODVLSPAnalysis: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: '', to: '' });
  const [selectedStatusParam, setSelectedStatusParam] = useState<string>('PUBLISHED,COMPLETE');
  const [odvlspFilters, setODVLSPFilters] = useState({
    origins: [],
    destinations: [],
    lsp_names: [],
    vehicle_ids: []
  });

  const handleDateRangeChange = (from: string, to: string) => {
    setSelectedDateRange({ from, to });
  };

  const handleStatusChange = (statuses: string[], statusParam: string) => {
    setSelectedStatusParam(statusParam);
  };

  const handleODVLSPFiltersChange = (filters: any) => {
    setODVLSPFilters(filters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">ODV LSP Analysis</h2>
        <p className="text-muted-foreground">
          Detailed analysis of Origin, Destination, Vehicle and LSP data
        </p>
      </div>

      {/* Date and Status Filters */}
      <DemandAggregatorFilters
        onDateRangeChange={handleDateRangeChange}
        onStatusChange={handleStatusChange}
      />

      {/* ODV LSP Specific Filters */}
      <ODVLSPFilter onFiltersChange={handleODVLSPFiltersChange} />

      {/* ODV LSP Table */}
      <ODVLSPTable
        dateRange={selectedDateRange}
        statusParam={selectedStatusParam}
        filters={odvlspFilters}
      />
    </div>
  );
};

export default ODVLSPAnalysis;