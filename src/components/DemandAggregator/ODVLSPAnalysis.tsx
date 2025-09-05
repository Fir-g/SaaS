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
    <div className="w-full space-y-2 lg:space-y-2">

        <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-1">ODV LSP Analysis</h3>
      
      {/* Date and Status Filters */}
      <div className="w-full">
        <DemandAggregatorFilters
          onDateRangeChange={handleDateRangeChange}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* ODV LSP Specific Filters */}
      <div className="w-full ">
        <ODVLSPFilter onFiltersChange={handleODVLSPFiltersChange} />
      </div>

      {/* ODV LSP Table (breakout to full-bleed) */}      

          <div className="w-full">
            <ODVLSPTable
              dateRange={selectedDateRange}
              statusParam={selectedStatusParam}
              filters={odvlspFilters}
            />
          </div>
    </div>
  );
};

export default ODVLSPAnalysis;