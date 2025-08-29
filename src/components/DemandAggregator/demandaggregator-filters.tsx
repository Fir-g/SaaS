import React, { useState, useEffect } from 'react';
import { Calendar, Filter, RotateCcw, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface DemandAggregatorProps {
  onDateRangeChange: (from: string, to: string) => void;
  onStatusChange: (statuses: string[], statusParam: string) => void;
}

const STORAGE_KEY = 'DemandAggregator-filters';

interface StoredFilters {
  fromDate: string;
  toDate: string;
  selectedStatuses: string[];
}

const DemandAggregator: React.FC<DemandAggregatorProps> = ({
  onDateRangeChange,
  onStatusChange
}) => {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['published']);
  const [showFromCalendar, setShowFromCalendar] = useState<boolean>(false);
  const [showToCalendar, setShowToCalendar] = useState<boolean>(false);
  const [fromCalendarMonth, setFromCalendarMonth] = useState<Date>(new Date());
  const [toCalendarMonth, setToCalendarMonth] = useState<Date>(new Date());

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
  }, []);

  // Separate useEffect to trigger API calls when filters are loaded/changed
  useEffect(() => {
    if (fromDate && toDate && selectedStatuses.length > 0) {
      const statusParam = getStatusParam(selectedStatuses);
      onDateRangeChange(fromDate, toDate);
      onStatusChange(selectedStatuses, statusParam);
    }
  }, [fromDate, toDate, selectedStatuses]);

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
    { value: 'published', label: 'Published', icon: CheckCircle, color: 'text-green-600' },
    { value: 'unpublished', label: 'Unpublished', icon: XCircle, color: 'text-red-600' }
  ];

  // Quick date range options
  const quickDateRanges = [
    {
      label: 'Past 7 days',
      days: 7,
      icon: Clock,
      gradient: 'from-blue-500 to-blue-500'
    },
    {
      label: 'Past 30 days',
      days: 30,
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-500'
    },
    {
      label: 'Past 90 days',
      days: 90,
      icon: Calendar,
      gradient: 'from-indigo-500 to-indigo-500'
    }
  ];

  // Convert selected statuses to API status parameter
  const getStatusParam = (statuses: string[]): string => {
    if (statuses.length === 2) {
      return "";
    } else if (statuses.includes('published')) {
      return "PUBLISHED,COMPLETE";
    } else if (statuses.includes('unpublished')) {
      return "HUMAN_REVIEW,INCOMPLETE";
    }
    return "PUBLISHED,COMPLETE";
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const handleQuickDateRange = (days: number) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
    
    const fromDateStr = formatDate(pastDate);
    const toDateStr = formatDate(today);
    
    setFromDate(fromDateStr);
    setToDate(toDateStr);
    
    const statusParam = getStatusParam(selectedStatuses);
    onDateRangeChange(fromDateStr, toDateStr);
    onStatusChange(selectedStatuses, statusParam);
    saveFilters(fromDateStr, toDateStr, selectedStatuses);
    
    // Close any open calendars
    setShowFromCalendar(false);
    setShowToCalendar(false);
  };

  const handleFromDateChange = (dateStr: string) => {
    setFromDate(dateStr);
    setShowFromCalendar(false);
    if (toDate) {
      const statusParam = getStatusParam(selectedStatuses);
      onDateRangeChange(dateStr, toDate);
      onStatusChange(selectedStatuses, statusParam);
      saveFilters(dateStr, toDate, selectedStatuses);
    }
  };

  const handleToDateChange = (dateStr: string) => {
    setToDate(dateStr);
    setShowToCalendar(false);
    if (fromDate) {
      const statusParam = getStatusParam(selectedStatuses);
      onDateRangeChange(fromDate, dateStr);
      onStatusChange(selectedStatuses, statusParam);
      saveFilters(fromDate, dateStr, selectedStatuses);
    }
  };

  const handleStatusChange = (status: string) => {
    let newStatuses: string[];
    if (selectedStatuses.includes(status)) {
      if (selectedStatuses.length === 1) {
        return;
      }
      newStatuses = selectedStatuses.filter(s => s !== status);
    } else {
      newStatuses = [...selectedStatuses, status];
    }
    setSelectedStatuses(newStatuses);
    const statusParam = getStatusParam(newStatuses);
    onStatusChange(newStatuses, statusParam);
    saveFilters(fromDate, toDate, newStatuses);
  };

  const clearStoredFilters = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const defaultFromDate = formatDate(thirtyDaysAgo);
      const defaultToDate = formatDate(today);
      const defaultStatuses = ['published'];
      
      setFromDate(defaultFromDate);
      setToDate(defaultToDate);
      setSelectedStatuses(defaultStatuses);
      
      const statusParam = getStatusParam(defaultStatuses);
      onDateRangeChange(defaultFromDate, defaultToDate);
      onStatusChange(defaultStatuses, statusParam);
      
      setShowFromCalendar(false);
      setShowToCalendar(false);
    } catch (error) {
      console.warn('Failed to clear stored filters:', error);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Calendar component
  const CustomCalendar: React.FC<{
    selectedDate: string;
    onDateSelect: (date: string) => void;
    currentMonth: Date;
    onMonthChange: (month: Date) => void;
    minDate?: string;
    maxDate?: string;
  }> = ({ selectedDate, onDateSelect, currentMonth, onMonthChange, minDate, maxDate }) => {
    const [showYearPicker, setShowYearPicker] = useState<boolean>(false);
    const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
    
    const today = new Date();
    const currentYear = currentMonth.getFullYear();
    const currentMonthIndex = currentMonth.getMonth();
    
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate year options (current year - 10 to current year)
    const yearOptions = [];
    const todayYear = today.getFullYear();
    for (let year = todayYear - 10; year <= todayYear; year++) {
      yearOptions.push(year);
    }

    // Month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const navigateMonth = (direction: 'prev' | 'next') => {
      const newMonth = new Date(currentMonth);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      onMonthChange(newMonth);
    };

    const navigateYear = (direction: 'prev' | 'next') => {
      const newMonth = new Date(currentMonth);
      if (direction === 'prev') {
        newMonth.setFullYear(newMonth.getFullYear() - 1);
      } else {
        newMonth.setFullYear(newMonth.getFullYear() + 1);
      }
      onMonthChange(newMonth);
    };

    const selectYear = (year: number) => {
      const newMonth = new Date(currentMonth);
      newMonth.setFullYear(year);
      onMonthChange(newMonth);
      setShowYearPicker(false);
    };

    const selectMonth = (monthIndex: number) => {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(monthIndex);
      onMonthChange(newMonth);
      setShowMonthPicker(false);
    };

    const isDateDisabled = (date: Date) => {
      const dateStr = formatDate(date);
      if (minDate && dateStr < minDate) return true;
      if (maxDate && dateStr > maxDate) return true;
      return date > today;
    };

    const isSelectedDate = (date: Date) => {
      return formatDate(date) === selectedDate;
    };

    const isToday = (date: Date) => {
      return formatDate(date) === formatDate(today);
    };

    return (
      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 min-w-80">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {/* Year Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateYear('prev')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous Year"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => setShowYearPicker(!showYearPicker)}
              className="px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors relative"
            >
              {currentYear}
              {showYearPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {yearOptions.map((year) => (
                    <button
                      key={year}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectYear(year);
                      }}
                      className={`
                        block w-full px-4 py-2 text-sm text-left hover:bg-blue-50 hover:text-blue-600 transition-colors
                        ${year === currentYear ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'}
                      `}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </button>
            
            <button
              onClick={() => navigateYear('next')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next Year"
              disabled={currentYear >= today.getFullYear()}
            >
              <ChevronRight className={`w-3 h-3 ${currentYear >= today.getFullYear() ? 'text-gray-300' : ''}`} />
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors relative min-w-24"
            >
              {monthNames[currentMonthIndex].substring(0, 3)}
              {showMonthPicker && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 grid grid-cols-3 gap-1 p-2 min-w-48">
                  {monthNames.map((month, index) => (
                    <button
                      key={month}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectMonth(index);
                      }}
                      className={`
                        px-2 py-1.5 text-xs rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors
                        ${index === currentMonthIndex ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700'}
                      `}
                    >
                      {month.substring(0, 3)}
                    </button>
                  ))}
                </div>
              )}
            </button>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const disabled = isDateDisabled(date);
            const selected = isSelectedDate(date);
            const todayDate = isToday(date);

            return (
              <button
                key={index}
                onClick={() => !disabled && onDateSelect(formatDate(date))}
                disabled={disabled}
                className={`
                  h-10 flex items-center justify-center text-sm rounded-lg transition-all duration-200
                  ${!isCurrentMonth 
                    ? 'text-gray-300' 
                    : disabled 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : selected
                        ? 'bg-blue-500 text-white shadow-md'
                        : todayDate
                          ? 'bg-blue-50 text-blue-600 font-semibold border-2 border-blue-200'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => onDateSelect(formatDate(today))}
            className="flex-1 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            Today
          </button>
          <button
            onClick={() => {
              const thisMonth = new Date();
              onMonthChange(thisMonth);
            }}
            className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            This Month
          </button>
        </div>
        
        {/* Close dropdowns when clicking outside calendar content */}
        {(showYearPicker || showMonthPicker) && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => {
              setShowYearPicker(false);
              setShowMonthPicker(false);
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm mb-6 max-w-7xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
        
        <button
          onClick={clearStoredFilters}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
          title="Reset filters to default"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Filter Content */}
      <div className="px-6 py-5">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Date Range Section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Date Range</span>
            </div>

            {/* Quick Date Range Buttons */}
            <div className="mb-6">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">Quick Select</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {quickDateRanges.map((range) => {
                  const Icon = range.icon;
                  return (
                    <button
                      key={range.days}
                      onClick={() => handleQuickDateRange(range.days)}
                      className={`
                        group relative p-4 bg-gradient-to-r ${range.gradient} text-white rounded-xl 
                        hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200
                        overflow-hidden
                      `}
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                      <div className="relative flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium text-sm">{range.label}</div>
                          {/* <div className="text-xs opacity-90">{range.days} days</div> */}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* From Date */}
              <div className="space-y-2 relative">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  From Date
                </label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowFromCalendar(!showFromCalendar);
                      setShowToCalendar(false);
                      setFromCalendarMonth(fromDate ? new Date(fromDate) : new Date());
                    }}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-left hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className={fromDate ? 'text-gray-900' : 'text-gray-400'}>
                        {fromDate ? formatDateForDisplay(fromDate) : 'Select start date'}
                      </span>
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                  
                  {showFromCalendar && (
                    <CustomCalendar
                      selectedDate={fromDate}
                      onDateSelect={handleFromDateChange}
                      currentMonth={fromCalendarMonth}
                      onMonthChange={setFromCalendarMonth}
                      maxDate={toDate || formatDate(new Date())}
                    />
                  )}
                </div>
              </div>
              
              {/* To Date */}
              <div className="space-y-2 relative">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  To Date
                </label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowToCalendar(!showToCalendar);
                      setShowFromCalendar(false);
                      setToCalendarMonth(toDate ? new Date(toDate) : new Date());
                    }}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-left hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className={toDate ? 'text-gray-900' : 'text-gray-400'}>
                        {toDate ? formatDateForDisplay(toDate) : 'Select end date'}
                      </span>
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                  
                  {showToCalendar && (
                    <CustomCalendar
                      selectedDate={toDate}
                      onDateSelect={handleToDateChange}
                      currentMonth={toCalendarMonth}
                      onMonthChange={setToCalendarMonth}
                      minDate={fromDate}
                      maxDate={formatDate(new Date())}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Date Range Summary */}
            {/* {fromDate && toDate && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 text-m">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">
                      {formatDateForDisplay(fromDate)} - {formatDateForDisplay(toDate)}
                    </div>
                    <div className="text-blue-700 text-s mt-1">
                      {Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days selected
                    </div>
                  </div>
                </div>
              </div>
            )} */}
          </div>

          {/* Status Filter Section */}
          <div className="xl:w-80">
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-6">
      <CheckCircle className="w-5 h-5 text-gray-500" /> {/* Increased size */}
      <span className="text-base font-medium text-gray-700">Status Filter</span>
    </div>
    
    <div className="grid grid-cols-1 gap-3">
      {statusOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedStatuses.includes(option.value);
        
        return (
          <label 
            key={option.value} 
            className={`
              group flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
              ${isSelected 
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-50 shadow-sm' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }
            `}
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleStatusChange(option.value)}
                className="sr-only"
              />
              <div className={`
                w-9 h-9 rounded-md border-2 flex items-center justify-center transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500 shadow-sm' 
                  : 'border-gray-300 bg-white group-hover:border-gray-400'
                }
              `}>
                {isSelected && (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            
            <div className={`p-2 rounded-lg ${isSelected ? 'bg-white' : 'bg-gray-50 group-hover:bg-gray-100'} transition-colors duration-200`}>
              <Icon className={`w-7 h-7 ${option.color}`} /> {/* Slightly bigger icon */}
            </div>
            
            <div className="flex-1">
              <span className={`text-base font-medium transition-colors duration-200 ${isSelected ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                {option.label}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  </div>
</div>

        </div>
      </div>

      {/* Click outside to close calendars */}
      {(showFromCalendar || showToCalendar) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowFromCalendar(false);
            setShowToCalendar(false);
          }}
        />
      )}
    </div>
  );
};

export default DemandAggregator;