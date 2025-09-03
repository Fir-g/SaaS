import React, { useState } from 'react';
import { ChevronDown, X, TrendingUp, Package, MapPin, Truck, Users, Search } from 'lucide-react';

interface SplitSectionProps {
  title: string;
  data: Array<{ key: string; count: number }>;
  total: number;
  dropdowns: {
    origin?: { value: string; onChange: (value: string) => void; options: string[] };
    destination?: { value: string; onChange: (value: string) => void; options: string[] };
    vehicle?: { value: string; onChange: (value: string) => void; options: Array<{ id: string; name: string }> };
    customer?: { value: string; onChange: (value: string) => void; options: string[] };
  };
  isLoading?: boolean;
}

const SplitSection: React.FC<SplitSectionProps> = ({ 
  title, 
  data, 
  total, 
  dropdowns, 
  isLoading = false 
}) => {
  const [searchTerms, setSearchTerms] = useState<{[key: string]: string}>({});
  const [dropdownOpen, setDropdownOpen] = useState<{[key: string]: boolean}>({});

  // Get icon based on title
  const getIcon = () => {
    switch (title.toLowerCase()) {
      case 'origin split':
        return <MapPin className="w-4 h-4" />;
      case 'destination split':
        return <Package className="w-4 h-4" />;
      case 'vehicle split':
        return <Truck className="w-4 h-4" />;
      case 'customer split':
        return <Users className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  // Get the appropriate label based on section title
  const getDataLabel = () => {
    switch (title.toLowerCase()) {
      case 'origin split':
        return 'Origin';
      case 'destination split':
        return 'Destination';
      case 'vehicle split':
        return 'Vehicle';
      case 'customer split':
        return 'Customer';
      default:
        return 'Route';
    }
  };

  // Filter options based on search term
  const filterOptions = (options: any[], searchTerm: string) => {
    if (!searchTerm) return options.slice(0, 100);
    const filtered = options.filter(option => {
      const searchText = typeof option === 'string' ? option : option.name;
      return searchText.toLowerCase().includes(searchTerm.toLowerCase());
    });
    return filtered.slice(0, 7);
  };

  // Toggle dropdown
  const toggleDropdown = (key: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle search term change
  const handleSearchChange = (key: string, value: string) => {
    setSearchTerms(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(dropdowns).some(config => config?.value);
  };

  // Clear all filters
  const clearAllFilters = () => {
    Object.values(dropdowns).forEach(config => {
      if (config) config.onChange('');
    });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.values(dropdowns).filter(config => config?.value).length;
  };

  const renderCompactDropdown = (key: string, config: any, icon: React.ReactNode) => {
    if (!config) return null;

    const isActive = Boolean(config.value);
    const isOpen = dropdownOpen[key] || false;
    const searchTerm = searchTerms[key] || '';
    const filteredOptions = filterOptions(config.options, searchTerm);

    return (
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <label className="text-xs font-medium text-gray-600 capitalize">
            {key}
          </label>
        </div>
        
        {/* Custom Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown(key)}
            className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-left flex items-center justify-between ${
              isActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <span className="truncate">
              {config.value ? (
                key === 'vehicle' 
                  ? config.options.find((opt: any) => opt.id === config.value)?.name || config.value
                  : config.value.charAt(0).toUpperCase() + config.value.slice(1)
              ) : `All ${key}s`}
            </span>
            <div className="flex items-center gap-1">
              {isActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    config.onChange('');
                  }}
                  className="text-blue-500 hover:text-blue-700 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              {/* Search Input */}
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${key}s...`}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(key, e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Options List */}
              <div className="max-h-48 overflow-y-auto">
                {/* All option */}
                <button
                  onClick={() => {
                    config.onChange('');
                    setDropdownOpen(prev => ({ ...prev, [key]: false }));
                  }}
                  className={`w-full px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors ${
                    !config.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  All {key}s
                </button>

                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option: any) => {
                    const optionValue = typeof option === 'string' ? option : option.id;
                    const optionLabel = typeof option === 'string' ? option : option.name;
                    const isSelected = config.value === optionValue;

                    return (
                      <button
                        key={optionValue}
                        onClick={() => {
                          config.onChange(optionValue);
                          setDropdownOpen(prev => ({ ...prev, [key]: false }));
                        }}
                        className={`w-full px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {optionLabel.charAt(0).toUpperCase() + optionLabel.slice(1)}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500 text-center">
                    No {key}s found
                  </div>
                )}

                {/* {config.options.length > 7 && !searchTerm && (
                  <div className="px-3 py-1 text-xs text-gray-400 text-center border-t border-gray-100">
                    Showing top 7 results
                  </div>
                )} */}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate percentage for each item
  const getPercentage = (count: number) => {
    return total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            {getIcon()}
          </div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <div className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
            {total}
          </div>
        </div>
        
        {hasActiveFilters() && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''}
            </span>
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Compact Filters */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {dropdowns.origin && renderCompactDropdown('origin', dropdowns.origin, <MapPin className="w-3 h-3 text-green-500" />)}
        {dropdowns.destination && renderCompactDropdown('destination', dropdowns.destination, <Package className="w-3 h-3 text-purple-500" />)}
        {dropdowns.vehicle && renderCompactDropdown('vehicle', dropdowns.vehicle, <Truck className="w-3 h-3 text-orange-500" />)}
        {dropdowns.customer && renderCompactDropdown('customer', dropdowns.customer, <Users className="w-3 h-3 text-indigo-500" />)}
      </div>

      {/* Data Display */}
<div className="flex flex-col h-80"> {/* set fixed height for section */}
  {isLoading ? (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
      <p className="text-xs text-gray-500 mt-2">Loading data...</p>
    </div>
  ) : data.length > 0 ? (
    <>
      {/* Header Row */}
      <div className="flex justify-between items-center py-2 border-b border-gray-200 bg-gray-50 rounded-lg px-3 mb-2">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          {getDataLabel()}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Count
          </span>
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide w-12 text-right">
            %
          </span>
        </div>
      </div>

      {/* Scrollable Data Rows */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="text-sm text-gray-900 truncate font-medium">
                {item.key || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 min-w-[3rem] text-right">
                {item.count.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 w-12 text-right">
                {getPercentage(item.count)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Total Row */}
      <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-blue-100 bg-blue-50 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-blue-900">Total</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-blue-900">
            {total.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-blue-700 w-12 text-right">
            100%
          </span>
        </div>
      </div>
    </>
  ) : (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <Package className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 font-medium">No data available</p>
      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
    </div>
  )}
</div>
    </div>
  );
};

export default SplitSection;