import React, { useState, useEffect } from "react";
import {
  Calendar,
  Filter,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DemandAggregatorProps {
  onDateRangeChange: (from: string, to: string) => void;
  onStatusChange: (statuses: string[], statusParam: string) => void;
}

const STORAGE_KEY = "DemandAggregator-filters";

interface StoredFilters {
  fromDate: string;
  toDate: string;
  selectedStatuses: string[];
}

const DemandAggregator: React.FC<DemandAggregatorProps> = ({
  onDateRangeChange,
  onStatusChange,
}) => {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "published",
  ]);
  const [showFromCalendar, setShowFromCalendar] = useState<boolean>(false);
  const [showToCalendar, setShowToCalendar] = useState<boolean>(false);
  const [showRangeCalendar, setShowRangeCalendar] = useState<boolean>(false);
  const [activeRangePane, setActiveRangePane] = useState<
    "from" | "to" | "both"
  >("both");
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

          if (
            storedFromDate <= today &&
            storedToDate <= today &&
            parsedFilters.fromDate &&
            parsedFilters.toDate &&
            parsedFilters.selectedStatuses.length > 0
          ) {
            setFromDate(parsedFilters.fromDate);
            setToDate(parsedFilters.toDate);
            setSelectedStatuses(parsedFilters.selectedStatuses);
            return;
          }
        }
      } catch (error) {
        console.warn("Failed to load stored filters:", error);
      }

      // Set default values if no valid stored data
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const formatDate = (date: Date) => date.toISOString().split("T")[0];
      const defaultFromDate = formatDate(thirtyDaysAgo);
      const defaultToDate = formatDate(today);
      const defaultStatuses = ["published"];

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
        selectedStatuses: statuses,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtersToStore));
    } catch (error) {
      console.warn("Failed to save filters to localStorage:", error);
    }
  };

  const statusOptions = [
    {
      value: "published",
      label: "Published",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      value: "unpublished",
      label: "Unpublished",
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  // Quick date range options
  const quickDateRanges = [
    {
      label: "Past 7 days",
      days: 7,
      icon: Clock,
      gradient: "from-blue-500 to-blue-500",
    },
    {
      label: "Past 30 days",
      days: 30,
      icon: Calendar,
      gradient: "from-purple-500 to-purple-500",
    },
    {
      label: "Past 90 days",
      days: 90,
      icon: Calendar,
      gradient: "from-indigo-500 to-indigo-500",
    },
  ];

  // Convert selected statuses to API status parameter
  const getStatusParam = (statuses: string[]): string => {
    if (statuses.length === 2) {
      return "";
    } else if (statuses.includes("published")) {
      return "PUBLISHED,COMPLETE";
    } else if (statuses.includes("unpublished")) {
      return "HUMAN_REVIEW,INCOMPLETE";
    }
    return "PUBLISHED,COMPLETE";
  };

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

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
    setShowRangeCalendar(false);
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
    // If using merged range calendar, close it when both dates present
    if (showRangeCalendar && dateStr && toDate) setShowRangeCalendar(false);
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
    // If using merged range calendar, close it when both dates present
    if (showRangeCalendar && fromDate && dateStr) setShowRangeCalendar(false);
  };

  const handleStatusChange = (status: string) => {
    let newStatuses: string[];
    if (selectedStatuses.includes(status)) {
      if (selectedStatuses.length === 1) {
        return;
      }
      newStatuses = selectedStatuses.filter((s) => s !== status);
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
      const defaultStatuses = ["published"];

      setFromDate(defaultFromDate);
      setToDate(defaultToDate);
      setSelectedStatuses(defaultStatuses);

      const statusParam = getStatusParam(defaultStatuses);
      onDateRangeChange(defaultFromDate, defaultToDate);
      onStatusChange(defaultStatuses, statusParam);

      setShowFromCalendar(false);
      setShowToCalendar(false);
    } catch (error) {
      console.warn("Failed to clear stored filters:", error);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
  }> = ({
    selectedDate,
    onDateSelect,
    currentMonth,
    onMonthChange,
    minDate,
    maxDate,
  }) => {
    const [showYearPicker, setShowYearPicker] = useState<boolean>(false);
    const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);

    const today = new Date();
    const currentYear = currentMonth.getFullYear();
    const currentMonthIndex = currentMonth.getMonth();

    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const lastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
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
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const navigateMonth = (direction: "prev" | "next") => {
      const newMonth = new Date(currentMonth);
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      onMonthChange(newMonth);
    };

    const navigateYear = (direction: "prev" | "next") => {
      const newMonth = new Date(currentMonth);
      if (direction === "prev") {
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
              onClick={() => navigateYear("prev")}
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
                        ${
                          year === currentYear
                            ? "bg-blue-100 text-blue-600 font-medium"
                            : "text-gray-700"
                        }
                      `}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </button>

            <button
              onClick={() => navigateYear("next")}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next Year"
              disabled={currentYear >= today.getFullYear()}
            >
              <ChevronRight
                className={`w-3 h-3 ${
                  currentYear >= today.getFullYear() ? "text-gray-300" : ""
                }`}
              />
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth("prev")}
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
                        ${
                          index === currentMonthIndex
                            ? "bg-blue-100 text-blue-600 font-medium"
                            : "text-gray-700"
                        }
                      `}
                    >
                      {month.substring(0, 3)}
                    </button>
                  ))}
                </div>
              )}
            </button>

            <button
              onClick={() => navigateMonth("next")}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
            >
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
                  ${
                    !isCurrentMonth
                      ? "text-gray-300"
                      : disabled
                      ? "text-gray-300 cursor-not-allowed"
                      : selected
                      ? "bg-blue-500 text-white shadow-md"
                      : todayDate
                      ? "bg-blue-50 text-blue-600 font-semibold border-2 border-blue-200"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
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
    <div className="w-full bg-gradient-to-r from-muted/30 to-background border border-border rounded-xl shadow-sm mb-6 lg:mb-8">
      {/* Merged Header + Filters (single section) */}
      <div className="flex items-center justify-between gap-2 px-2 py-1 border-b border-border">
        {/* All filters on the left */}
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <Filter className="w-4 h-4 text-muted-foreground" />

          {/* Quick Date Range Buttons */}
          <div className="flex items-center gap-2">
            {quickDateRanges.map((range) => {
              const Icon = range.icon;
              return (
                <button
                  key={range.days}
                  onClick={() => handleQuickDateRange(range.days)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs text-white rounded-md bg-gradient-to-r ${range.gradient} hover:opacity-90 transition-colors`}
                  title={range.label}
                >
                  <Icon className="w-3 h-3" />
                  <span className="whitespace-nowrap">
                    {range.label.replace("Past ", "")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* From/To compact controls (with merged range calendar) */}
          <div className="relative">
            <div className="flex items-center gap-2">
              {/* Start button */}
              <button
                onClick={() => {
                  setShowRangeCalendar(true);
                  setActiveRangePane("from");
                  setShowFromCalendar(false);
                  setShowToCalendar(false);
                  setFromCalendarMonth(
                    fromDate ? new Date(fromDate) : new Date()
                  );
                }}
                className={`px-2 py-1 bg-background border border-input rounded-md text-xs hover:shadow-sm transition-all ${
                  showRangeCalendar && activeRangePane === "from"
                    ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50 text-blue-700"
                    : ""
                }`}
                title={fromDate ? formatDateForDisplay(fromDate) : "Start date"}
                aria-expanded={showRangeCalendar && activeRangePane === "from"}
              >
                {fromDate ? formatDateForDisplay(fromDate) : "Start"}
              </button>

              <span className="text-xs text-muted-foreground">—</span>

              {/* End button */}
              <button
                onClick={() => {
                  setShowRangeCalendar(true);
                  setActiveRangePane("to");
                  setShowFromCalendar(false);
                  setShowToCalendar(false);
                  setToCalendarMonth(toDate ? new Date(toDate) : new Date());
                }}
                className={`px-2 py-1 bg-background border border-input rounded-md text-xs hover:shadow-sm transition-all ${
                  showRangeCalendar && activeRangePane === "to"
                    ? "ring-2 ring-purple-500 border-purple-500 bg-purple-50 text-purple-700"
                    : ""
                }`}
                title={toDate ? formatDateForDisplay(toDate) : "End date"}
                aria-expanded={showRangeCalendar && activeRangePane === "to"}
              >
                {toDate ? formatDateForDisplay(toDate) : "End"}
              </button>
            </div>

            {/* Popover positioned under the active trigger */}
            {showRangeCalendar && (
              <div
                className={`absolute mt-1 z-50 ${
                  activeRangePane === "from" ? "left-0" : "right-0"
                }`}
              >
                {/* Arrow indicator */}
                <div
                  className={`absolute -top-1.5 w-3 h-3 rotate-45 bg-white border border-gray-200 ${
                    activeRangePane === "from" ? "left-6" : "right-6"
                  }`}
                />

                {/* Popover container; border/ring indicate which pane is active */}
                <div
                  className={`flex gap-2 bg-white p-1 rounded-lg shadow-lg border transition-all ${
                    activeRangePane === "from"
                      ? "border-blue-400 ring-1 ring-blue-300"
                      : "border-purple-400 ring-1 ring-purple-300"
                  }`}
                >
                  {/* Start calendar */}
                  <div
                    className={`${
                      activeRangePane === "to" ? "opacity-70" : ""
                    }`}
                  >
                    <CustomCalendar
                      selectedDate={fromDate}
                      onDateSelect={(d) => {
                        handleFromDateChange(d);
                        setActiveRangePane("to");
                      }}
                      currentMonth={fromCalendarMonth}
                      onMonthChange={setFromCalendarMonth}
                      maxDate={toDate || formatDate(new Date())}
                    />
                  </div>

                  {/* End calendar */}
                  <div
                    className={`${
                      activeRangePane === "from" ? "opacity-70" : ""
                    }`}
                  >
                    <CustomCalendar
                      selectedDate={toDate}
                      onDateSelect={handleToDateChange}
                      currentMonth={toCalendarMonth}
                      onMonthChange={setToCalendarMonth}
                      minDate={fromDate}
                      maxDate={formatDate(new Date())}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Filter (inline pills) */}
          <div className="flex items-center gap-2">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedStatuses.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`flex items-center gap-2 px-2 py-1 text-xs rounded-md border transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-muted/50"
                  }`}
                  title={option.label}
                  aria-pressed={isSelected}
                >
                  <Icon className={`w-4 h-4 ${option.color}`} />
                  <span className="whitespace-nowrap">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset button on the right */}
        <button
          onClick={clearStoredFilters}
          className="flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          title="Reset filters to default"
          aria-label="Reset filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
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
      {showRangeCalendar && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowRangeCalendar(false);
            setActiveRangePane("both");
          }}
        />
      )}
    </div>
  );
};

export default DemandAggregator;
