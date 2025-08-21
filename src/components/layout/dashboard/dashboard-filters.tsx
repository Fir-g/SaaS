import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

interface DashboardFiltersProps {
  onDateRangeChange: (from: string, to: string) => void;
  onStatusChange: (statuses: string[]) => void;
}

const STORAGE_KEY = 'dashboard-filters';

interface StoredFilters {
  fromDate: string;
  toDate: string;
  selectedStatuses: string[];
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  onDateRangeChange,
  onStatusChange
}) => {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['published']);

  // Load filters from localStorage or set defaults
  useEffect(() => {
    const loadFilters = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedFilters: StoredFilters = JSON.parse(stored);
          
          // Validate that stored dates are not in the future and are valid
          const today = new Date();
          const storedFromDate = new Date(parsedFilters.fromDate);
          const storedToDate = new Date(parsedFilters.toDate);
          
          if (storedFromDate <= today && storedToDate <= today && 
              parsedFilters.fromDate && parsedFilters.toDate &&
              parsedFilters.selectedStatuses.length > 0) {
            setFromDate(parsedFilters.fromDate);
            setToDate(parsedFilters.toDate);
            setSelectedStatuses(parsedFilters.selectedStatuses);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to load stored filters:', error);
      }
      
      // Set default values if no valid stored data
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      const defaultFromDate = formatDate(thirtyDaysAgo);
      const defaultToDate = formatDate(today);
      const defaultStatuses = ['published'];
      
      setFromDate(defaultFromDate);
      setToDate(defaultToDate);
      setSelectedStatuses(defaultStatuses);
    };

    loadFilters();
  }, []); // Empty dependency array - only run once on mount

  // Separate useEffect to trigger API calls when filters are loaded/changed
  useEffect(() => {
    if (fromDate && toDate && selectedStatuses.length > 0) {
      onDateRangeChange(fromDate, toDate);
      onStatusChange(selectedStatuses);
    }
  }, [fromDate, toDate, selectedStatuses]); // Only depend on the actual filter values

  // Save filters to localStorage whenever they change
  const saveFilters = (from: string, to: string, statuses: string[]) => {
    try {
      const filtersToStore: StoredFilters = {
        fromDate: from,
        toDate: to,
        selectedStatuses: statuses
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtersToStore));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  };

  const statusOptions = [
    { value: 'published', label: 'Published' },
    { value: 'unpublished', label: 'Unpublished' }
  ];

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setFromDate(date);
    if (toDate) {
      onDateRangeChange(date, toDate);
      saveFilters(date, toDate, selectedStatuses);
    }
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setToDate(date);
    if (fromDate) {
      onDateRangeChange(fromDate, date);
      saveFilters(fromDate, date, selectedStatuses);
    }
  };

  const handleStatusChange = (status: string) => {
    let newStatuses: string[];
    if (selectedStatuses.includes(status)) {
      // If trying to deselect the last selected status, prevent it
      if (selectedStatuses.length === 1) {
        return;
      }
      newStatuses = selectedStatuses.filter(s => s !== status);
    } else {
      newStatuses = [...selectedStatuses, status];
    }
    setSelectedStatuses(newStatuses);
    onStatusChange(newStatuses);
    saveFilters(fromDate, toDate, newStatuses);
  };

  // Clear stored filters function (optional - you can expose this via a button)
  const clearStoredFilters = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      
      // Reset to defaults
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      const defaultFromDate = formatDate(thirtyDaysAgo);
      const defaultToDate = formatDate(today);
      const defaultStatuses = ['published'];
      
      setFromDate(defaultFromDate);
      setToDate(defaultToDate);
      setSelectedStatuses(defaultStatuses);
      
      onDateRangeChange(defaultFromDate, defaultToDate);
      onStatusChange(defaultStatuses);
    } catch (error) {
      console.warn('Failed to clear stored filters:', error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 border rounded-lg bg-white">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Date Range Filters */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500" />
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={handleFromDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500" />
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={handleToDateChange}
            min={fromDate}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Status
        </label>
        <div className="flex gap-3">
          {statusOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(option.value)}
                onChange={() => handleStatusChange(option.value)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Optional: Reset button */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 opacity-0">
          Actions
        </label>
        <button
          onClick={clearStoredFilters}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          title="Reset filters to default"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default DashboardFilters;