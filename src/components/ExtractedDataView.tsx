import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useExtractedDataStore } from "../stores/extractedStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as XLSX from "xlsx";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Database,
  Download,
  Edit,
  Copy,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Building2,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { fetchCompaniesFundsAPI, fetchCompaniesFundsDetailedAPI } from "@/utils/api";
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Type definitions for better type safety
interface FundCompanyData {
  fund_name: string;
  companies: string[];
}

interface ExtractedDataEntry {
  value: string;
  reference: string;
  type?: string;
  heading?: string;
  sub_heading?: string;
  section?: string;
  subsection?: string;
}

interface FlattenedDataItem {
  key: string;
  value: string;
  reference: string;
  type: string;
  citation: string;
  heading: string;
  sub_heading: string;
}

export function ExtractedDataView() {
  const { projectId } = useParams();
  const { 
    data, 
    loading, 
    error, 
    fetchData, 
    setError, 
    setLoading 
  } = useExtractedDataStore();
  
  const extractedData = projectId ? (data[projectId] || []) : [];
  const isLoading = projectId ? (loading[projectId] || false) : false;
  const currentError = projectId ? (error[projectId] || null) : null;
  
  // PDF tab states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [headingFilter, setHeadingFilter] = useState("all");
  const [subHeadingFilter, setSubHeadingFilter] = useState("all");
  const [expectedDataSourcesFilter, setExpectedDataSourcesFilter] = useState("all");

  // Excel tab states
  const [selectedFund, setSelectedFund] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [excelData, setExcelData] = useState<FlattenedDataItem[]>([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);

  const [fundsCompanies, setFundsCompanies] = useState<FundCompanyData[]>([]);
  const [availableFunds, setAvailableFunds] = useState<string[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [fundsLoaded, setFundsLoaded] = useState(false);

  const fetchCompaniesFunds = async () => {
    try {
      const data = await fetchCompaniesFundsAPI(projectId);
      console.log("Funds and Companies data:", data);
      if (data?.mapping) {
        const typedFundCompanies = data.mapping as FundCompanyData[];
        setFundsCompanies(typedFundCompanies);
        // Extract unique funds
        const funds = [...new Set(typedFundCompanies.map((fund: FundCompanyData) => fund.fund_name))];
        setAvailableFunds(funds);
        // Extract all unique companies
        const allCompanies = typedFundCompanies.flatMap((fund: FundCompanyData) => fund.companies);
        const uniqueCompanies = [...new Set(allCompanies)];
        setAvailableCompanies(uniqueCompanies);
      } else {
        setAvailableFunds([]);
        setAvailableCompanies([]);
      }
    } catch (error) {
      console.error("Failed to fetch companies/funds:", error);
    } finally {
      setFundsLoaded(true);
    }
  };

  const handleRefresh = async () => {
    if (projectId) {
        await fetchData(projectId, true); // Force refresh
      }
    };

  const handleFundChange = (fundName: string) => {
    setSelectedFund(fundName);
    setSelectedCompany(""); // Reset company selection when fund changes
    
    // Update available companies for the selected fund
    const selectedFundData = fundsCompanies.find(fund => fund.fund_name === fundName);
    if (selectedFundData) {
      setAvailableCompanies(selectedFundData.companies);
    }
  };

  const resetExcelForm = () => {
    setSelectedFund("");
    setSelectedCompany("");
    setExcelData([]);
    setExcelError(null);
  };

  const handleExcelSubmit = async () => {
    if (!selectedCompany || !selectedFund) {
      setExcelError("Please select both company and fund");
        return;
    }

    setExcelLoading(true);
    setExcelError(null);

    try {
      const response = await fetchCompaniesFundsDetailedAPI(projectId, selectedCompany, selectedFund);
      console.log("Excel API Response:", response);

      if (!response || !Array.isArray(response.extracted_data)) {
        throw new Error("No extracted data returned from API");
      }

      // Map FieldData[] envelope → grid rows
      const mapped: FlattenedDataItem[] = response.extracted_data.map((fd: any) => ({
        key: fd.field_name,
        value: fd.value,
        reference: fd.reference,
        type: fd.type || inferTypeFromValue(fd.value),
        citation: fd.reference,
        heading: fd.heading || "",
        sub_heading: fd.sub_heading || "",
      }));

      setExcelData(mapped);
    } catch (error) {
      setExcelError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setExcelLoading(false);
    }
  };


  useEffect(() => {
    if (projectId) {
      fetchData(projectId);
    }
  }, [projectId]);

  // Show errors as non-intrusive toast "cloud" notifications
  useEffect(() => {
    if (excelError) {
      toast({
        title: "Action Required",
        description: excelError,
        variant: "destructive",
      });
      setExcelError(null);
    }
  }, [excelError]);

  const inferTypeFromValue = (value: string): string => {
    if (!value) return "text";
    
    // Check for currency patterns
    if (/^\$[\d,]+(\.\d{2})?$/.test(value) || /^[\d,]+(\.\d{2})?\s*USD$/.test(value)) {
      return "currency";
    }
    
    // Check for percentage patterns
    if (/^[\d.]+%$/.test(value) || /^[\d.]+%\s*per\s*annum$/i.test(value)) {
      return "percentage";
    }
    
    // Check for number patterns
    if (/^[\d,]+(\.\d+)?$/.test(value) || /^[\d,]+$/.test(value)) {
      return "number";
    }
    
    // Check for rating patterns (1-5, 1-10, etc.)
    if (/^[1-5]$/.test(value) || /^[1-9]\/10$/.test(value)) {
      return "rating";
    }
    
    // Default to text
    return "text";
  };

  const getTypeColor = (type: string) => {
    switch ((type || '').toLowerCase()) {
      case "number":
        return "bg-blue-100 text-blue-800";
      case "currency":
        return "bg-green-100 text-green-800";
      case "percentage":
        return "bg-yellow-100 text-yellow-800";
      case "text":
        return "bg-gray-100 text-gray-800";
      case "rating":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatFileName = (source: string) => {
    if (!source) return "Unknown";
    if (source.includes("/")) {
      return source.split("/").pop() || source;
    }
    return source;
  };

  const filteredData = extractedData.filter((item) => {
    const matchesSearch =
      (item.key?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.value?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      (item.type?.toLowerCase() || '') === typeFilter.toLowerCase();
    const matchesSource =
      sourceFilter === "all" || item.source === sourceFilter;
    const matchesHeading =
      headingFilter === "all" || item.heading === headingFilter;
    const matchesSubHeading =
      subHeadingFilter === "all" || item.sub_heading === subHeadingFilter;
    const matchesExpectedDataSources =
      expectedDataSourcesFilter === "all" ||
      (item.expected_data_sources || []).includes(expectedDataSourcesFilter);
    return (
      matchesSearch &&
      matchesType &&
      matchesSource &&
      matchesHeading &&
      matchesSubHeading &&
      matchesExpectedDataSources
    );
  });

  const uniqueSources = [...new Set(extractedData.map((item) => item.source))];
  const uniqueHeadings = [
    ...new Set(extractedData.map((item) => item.heading).filter(Boolean)),
  ];
  const uniqueSubHeadings = [
    ...new Set(extractedData.map((item) => item.sub_heading).filter(Boolean)),
  ];
  const uniqueTypes = [...new Set(extractedData.map((item) => item.type))];
  const uniqueExpectedDataSources = [
    ...new Set(extractedData.flatMap((item) => item.expected_data_sources)),
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openCitation = (citation: string | number) => {
    if (citation && citation.toString().startsWith('http')) {
      window.open(citation.toString(), '_blank', 'noopener,noreferrer');
    }
  };

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      field: 'field_name',
      headerName: 'Field Name',
      width: 250,
      minWidth: 200,
      cellRenderer: (params) => {
        const value = params.value || params.data.key || 'N/A';
        return (
          <div className="w-full break-words font-medium text-gray-900 p-2">
            {value}
          </div>
        );
      }
    },
    {
      field: 'extracted_value',
      headerName: 'Value',
      flex: 2,
      minWidth: 300,
      cellRenderer: (params) => {
        const value = params.value || params.data.value || 'N/A';
        return (
          <div className="w-full break-words font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded text-sm">
            {value}
          </div>
        );
      }
    },
    {
      field: 'expected_data_type',
      headerName: 'Type',
      width: 140,
      minWidth: 120,
      cellRenderer: (params) => {
        const type = params.value || params.data.type || 'text';
        const getTypeColor = (type) => {
          switch ((type || '').toLowerCase()) {
            case "number":
              return "bg-blue-100 text-blue-800 border-blue-200";
            case "text":
              return "bg-gray-100 text-gray-800 border-gray-200";
            case "currency":
              return "bg-green-100 text-green-800 border-green-200";
            case "percentage":
              return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "rating":
              return "bg-purple-100 text-purple-800 border-purple-200";
            default:
              return "bg-gray-100 text-gray-800 border-gray-200";
          }
        };
        return (
          <div className="p-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(type)}`}>
              {type}
            </span>
          </div>
        );
      }
    },
    {
      field: 'reference',
      headerName: 'Page',
      width: 120,
      minWidth: 100,
      cellRenderer: (params) => {
        const extractedValue = params.data.extracted_value || params.data.value;
        const reference = params.value || params.data.citation;
        
        // If value is "N/A", then make the Page "N/A" as well
        if (extractedValue === 'N/A' || extractedValue === null || extractedValue === undefined || extractedValue === '') {
          return (
            <div className="p-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-medium">
                N/A
              </span>
            </div>
          );
        }
        
        return (
          <div className="p-2">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-medium">
              {reference || 'N/A'}
            </span>
          </div>
        );
      }
    },
    // {
    //   field: 'heading',
    //   headerName: 'Section',
    //   width: 150,
    //   cellRenderer: (params) => {
    //     const value = params.value || params.data.section || 'N/A';
    //     return (
    //       <div className="max-w-xs break-words text-gray-600 text-sm">
    //         {value}
    //       </div>
    //     );
    //   }
    // },
    // {
    //   field: 'sub_heading',
    //   headerName: 'Subsection',
    //   width: 150,
    //   cellRenderer: (params) => {
    //     const value = params.value || params.data.subsection || 'N/A';
    //     return (
    //       <div className="max-w-xs break-words text-gray-600 text-sm">
    //         {value}
    //       </div>
    //     );
    //   }
    // },
    {
      field: 'file_name',
      headerName: 'Source',
      width: 200,
      minWidth: 150,
      cellRenderer: (params) => {
        const value = params.value || params.data.source;
        return (
          <div className="w-full break-words text-gray-600 text-sm p-2" title={value}>
            {value || 'N/A'}
          </div>
        );
      }
    },
    {
      field: 'citation',
      headerName: 'Citation',
      width: 120,
      minWidth: 100,
      cellRenderer: (params) => {
        const extractedValue = params.data.extracted_value || params.data.value;
        const citation = params.value || params.data.citation;
        
        // If extracted_value is null, return null for citation as well
        if (extractedValue === null || extractedValue === undefined || extractedValue === '') {
          return null;
        }
        
        if (citation && citation.toString().startsWith('http')) {
          return (
            <div className="p-2">
              <button
                onClick={() => window.open(citation.toString(), '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center px-2 py-1 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200"
                title="Open citation link"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </button>
            </div>
          );
        }
        return (
          <div className="p-2">
            <span className="text-gray-400 text-xs">N/A</span>
          </div>
        );
      }
    }
  ], []);

  // AG Grid default column properties
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: false,
    wrapText: true,
    autoHeight: true,
    cellStyle: {
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      lineHeight: '1.4',
    },
    filterParams: {
      buttons: ['reset', 'apply'],
      closeOnApply: true,
      suppressAndOrCondition: true,
      filterOptions: [
        'contains',
        'notContains',
        'startsWith',
        'endsWith',
        'equals',
        'notEqual',
        'blank',
        'notBlank'
      ],
      defaultOption: 'contains',
      suppressFilterButton: false,
      newRowsAction: 'keep'
    },
  }), []);

  const exportData = (dataToExport: any = filteredData) => {
    // Create worksheet data: header + rows
    const worksheetData = [
      ["Key", "Value", "Type", "Page Number", "Heading", "Sub Heading"],
      ...dataToExport.map((item: any) => [
        item.key || item.field_name,
        item.value || item.extracted_value,
        item.type || item.expected_data_type,
        item.citation?.toString() || item.reference || "",
        item.heading || "",
        item.sub_heading || "",
      ]),
    ];

    // Convert to worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");

    // Write to file
    XLSX.writeFile(workbook, "extracted-data.xlsx");
  };

  const renderDataTable = (data, showExportButton = true) => {
    // Transform API response data if needed
    const processedData = Array.isArray(data) ? data : (data?.specifications || []);

    return (
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full">
        {/* AG Grid */}
        <div className="ag-theme-alpine" style={{ height: '100%', minHeight: '400px' }}>
          <style>{`
            .ag-theme-alpine .ag-header-cell {
              font-size: 14px !important;
              font-weight: 600 !important;
              color: #374151 !important;
              background-color: #f9fafb !important;
              border-bottom: 2px solid #e5e7eb !important;
            }
            .ag-theme-alpine .ag-header-cell-label {
              font-size: 14px !important;
              font-weight: 600 !important;
            }
            
            /* Enhanced Filter Styling */
            .ag-theme-alpine .ag-filter-wrapper {
              background: white !important;
              border: 1px solid #e5e7eb !important;
              border-radius: 8px !important;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
              padding: 16px !important;
              min-width: 280px !important;
            }
            
            .ag-theme-alpine .ag-filter-body-wrapper {
              padding: 0 !important;
            }
            
            .ag-theme-alpine .ag-filter-condition {
              margin-bottom: 12px !important;
            }
            
            .ag-theme-alpine .ag-filter-select {
              width: 100% !important;
              padding: 8px 12px !important;
              border: 1px solid #d1d5db !important;
              border-radius: 6px !important;
              font-size: 14px !important;
              background: white !important;
              color: #374151 !important;
              transition: all 0.2s ease !important;
            }
            
            .ag-theme-alpine .ag-filter-select:focus {
              outline: none !important;
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            }
            
            .ag-theme-alpine .ag-filter-filter {
              width: 100% !important;
              padding: 8px 12px !important;
              border: 1px solid #d1d5db !important;
              border-radius: 6px !important;
              font-size: 14px !important;
              background: white !important;
              color: #374151 !important;
              transition: all 0.2s ease !important;
            }
            
            .ag-theme-alpine .ag-filter-filter:focus {
              outline: none !important;
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            }
            
            .ag-theme-alpine .ag-filter-filter::placeholder {
              color: #9ca3af !important;
              font-style: italic !important;
            }
            
            .ag-theme-alpine .ag-filter-apply-panel {
              display: flex !important;
              gap: 8px !important;
              justify-content: flex-end !important;
              margin-top: 16px !important;
              padding-top: 12px !important;
              border-top: 1px solid #e5e7eb !important;
            }
            
            .ag-theme-alpine .ag-filter-apply-panel button {
              padding: 8px 16px !important;
              border-radius: 6px !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              cursor: pointer !important;
              transition: all 0.2s ease !important;
              border: none !important;
            }
            
            .ag-theme-alpine .ag-filter-apply-panel button[ref="eResetButton"] {
              background: white !important;
              color: #6b7280 !important;
              border: 1px solid #d1d5db !important;
            }
            
            .ag-theme-alpine .ag-filter-apply-panel button[ref="eResetButton"]:hover {
              background: #f9fafb !important;
              color: #374151 !important;
              border-color: #9ca3af !important;
            }
            
            .ag-theme-alpine .ag-filter-apply-panel button[ref="eApplyButton"] {
              background: #3b82f6 !important;
              color: white !important;
            }
            
            .ag-theme-alpine .ag-filter-apply-panel button[ref="eApplyButton"]:hover {
              background: #2563eb !important;
            }
            
            .ag-theme-alpine .ag-filter-apply-panel button:focus {
              outline: none !important;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            }
            
            /* Filter icon styling */
            .ag-theme-alpine .ag-header-cell-menu-button {
              color: #6b7280 !important;
              transition: color 0.2s ease !important;
            }
            
            .ag-theme-alpine .ag-header-cell-menu-button:hover {
              color: #3b82f6 !important;
            }
            
            /* Filter active state */
            .ag-theme-alpine .ag-header-cell-filtered .ag-header-cell-menu-button {
              color: #3b82f6 !important;
            }
          `}</style>
          <AgGridReact
            rowData={processedData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowSelection="multiple"
            pagination={true}
            paginationPageSize={50}
            paginationPageSizeSelector={[25, 50, 100]}
            quickFilterText=""
            suppressMenuHide={true}
            enableRangeSelection={true}
            rowHeight={60}
            headerHeight={50}
            getRowHeight={(params) => {
              // Calculate dynamic row height based on content
              const data = params.data;
              const maxLength = Math.max(
                (data?.field_name || '').length,
                (data?.extracted_value || '').length,
                (data?.file_name || '').length
              );
              // Base height + additional height for longer content
              return Math.max(60, 40 + Math.ceil(maxLength / 50) * 20);
            }}
            sideBar={{
              toolPanels: [
                {
                  id: 'columns',
                  labelDefault: 'Columns',
                  labelKey: 'columns',
                  iconKey: 'columns',
                  toolPanel: 'agColumnsToolPanel',
                },
                {
                  id: 'filters',
                  labelDefault: 'Filters',
                  labelKey: 'filters',
                  iconKey: 'filter',
                  toolPanel: 'agFiltersToolPanel',
                }
              ],
              defaultToolPanel: 'columns',
            }}
            noRowsOverlayComponent={() => (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                <Database className="h-12 w-12 mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h4>
                <p className="text-sm text-gray-500">No extracted data found for this selection.</p>
              </div>
            )}
            getRowId={(params) => `${params.data.field_name || params.data.key}-${Math.random().toString(36).substr(2, 9)}`}
          />
        </div>
      </div>
    );
  };


  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-gray-50/50">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Extracted Data</h1>
                <p className="text-sm text-gray-600 mt-1">
                  View and manage extracted data from processed documents
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="border-0 bg-white/80 backdrop-blur shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-brand-primary mb-2">Loading Data</h3>
                <p className="text-gray-600 max-w-md">
                  Please wait while we fetch the extracted data from your processed documents...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className="h-full flex flex-col bg-gray-50/50">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Extracted Data</h1>
                <p className="text-sm text-gray-600 mt-1">
                  View and manage extracted data from processed documents
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="border-0 bg-white/80 backdrop-blur shadow-sm max-w-md w-full">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                <p className="text-gray-600 mb-6">
                  {currentError}
                </p>
                <Button
                  onClick={handleRefresh}
                  className="bg-brand-primary hover:bg-brand-accent text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Extracted Data</h1>
              <p className="text-sm text-gray-600 mt-1">
                View and manage extracted data from processed documents
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-9"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {filteredData.length > 0 && (
                <Button
                  onClick={() => exportData(filteredData)}
                  size="sm"
                  className="h-9 bg-brand-primary hover:bg-brand-accent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Specifications
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          {/* Tabs */}
          <Tabs defaultValue="pdf" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PDF
          </TabsTrigger>
          <TabsTrigger value="excel" className="flex items-center gap-2" onClick={fetchCompaniesFunds}>
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="flex-grow flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
          {extractedData.length === 0 ? (
            <Card className="border-0 bg-white/60 backdrop-blur shadow-sm flex-grow flex items-center justify-center">
              <CardContent className="p-8 text-center">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Data Available</h3>
                <p className="text-muted-foreground">
                  No extracted data found for this project. Upload and process some
                  files to see data here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col">
              {/* Data Table */}
              <div className="flex-1 min-h-0">
                {renderDataTable(extractedData)}
              </div>
            </div> 
          )}
        </TabsContent>

        <TabsContent value="excel" className="flex-grow flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
          <div className="space-y-6 h-full flex flex-col">
            {/* Excel Data Extraction Form */}
            <Card className="border-0 bg-white/80 backdrop-blur shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  Excel Data Extraction
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Select a fund and company to extract detailed data from Excel files
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Single Row Layout for Fund, Company, and Extract Button */}
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  {/* Fund Selection */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        Select Fund
                      </label>
                      {availableFunds.length === 0 && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          No funds available
                        </span>
                      )}
                    </div>
                    <Select 
                      value={selectedFund} 
                      onValueChange={handleFundChange}
                      disabled={availableFunds.length === 0}
                    >
                      <SelectTrigger className={`h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${availableFunds.length === 0 ? 'cursor-not-allowed opacity-80' : ''}`} title={!fundsLoaded ? 'Loading funds...' : (availableFunds.length === 0 ? 'No funds available' : 'Choose a fund')}>
                        <SelectValue placeholder={!fundsLoaded ? "Loading funds..." : (availableFunds.length === 0 ? "No funds available" : "Choose a fund")} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFunds.map((fund, index) => (
                          <SelectItem key={fund || `fund-${index}`} value={fund}>
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-gray-500" />
                              {fund}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Company Selection */}
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-green-600" />
                      Select Company
                    </label>
                    <Select 
                      value={selectedCompany} 
                      onValueChange={(value) => setSelectedCompany(value)}
                      disabled={availableCompanies.length === 0 || !selectedFund}
                    >
                      <SelectTrigger className={`h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 ${(availableCompanies.length === 0 || !selectedFund) ? 'cursor-not-allowed opacity-80' : ''}`} title={!selectedFund ? 'Select a fund first' : (availableCompanies.length === 0 ? 'No companies for selected fund' : 'Choose a company')}>
                        <SelectValue placeholder={
                          !selectedFund 
                            ? "Select a fund first" 
                            : availableCompanies.length === 0 
                              ? "Loading companies..." 
                              : "Choose a company"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCompanies.map((company, index) => (
                          <SelectItem key={company || `company-${index}`} value={company}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-500" />
                              {company}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* {!selectedFund && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Please select a fund first
                      </p>
                    )} */}
                    {selectedFund && availableCompanies.length === 0 && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        No companies available for this fund
                      </p>
                    )}
                  </div>

                  {/* Extract Data Button */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Button
                      onClick={handleExcelSubmit}
                      disabled={!selectedCompany || !selectedFund || excelLoading}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      title={!selectedCompany || !selectedFund ? 'Select a fund and company to proceed' : 'Extract data'}
                    >
                      {excelLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Extract Data
                        </>
                      )}
                    </Button>
                    {(selectedFund || selectedCompany || excelData.length > 0) && (
                      <Button
                        variant="ghost"
                        onClick={resetExcelForm}
                        className="bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-accent hover:to-brand-primary text-white px-6 py-3 h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        title="Clear selections"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>

                {/* Selections Summary */}
                {(selectedFund || selectedCompany) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-sm text-gray-600">
                    {selectedFund && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1">
                        <Briefcase className="h-3 w-3" /> Fund: {selectedFund}
                      </span>
                    )}
                    {selectedCompany && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1">
                        <Building2 className="h-3 w-3" /> Company: {selectedCompany}
                      </span>
                    )}
                  </div>
                )}

                {/* Errors are shown via toast to avoid layout shifts */}
              </CardContent>
            </Card>

            {/* Excel Data Results */}
            {excelData.length === 0 ? (
              <Card className="border-0 bg-white/60 backdrop-blur shadow-sm flex-grow flex items-center justify-center">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mb-4">
                    <FileSpreadsheet className="h-5 w-5 text-brand-primary" />
                  </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Excel Data Available</h3>
                    <p className="text-gray-600 mb-4 max-w-md">
                      Select a fund and company above, then click "Extract Data" to fetch Excel data.
                    </p>
                    {selectedFund && selectedCompany && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
                          No data found for <span className="font-semibold">{selectedCompany}</span> in <span className="font-semibold">{selectedFund}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 flex-grow flex flex-col min-h-0">
                {/* Results Header */}
                <Card className="border-0 bg-white/80 backdrop-blur shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                          <FileSpreadsheet className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            Extracted Data
                          </h4>
                          <p className="text-sm text-gray-600">
                            {selectedCompany} • {selectedFund}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                          {excelData.length} entries
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportData(excelData)}
                          className="h-8"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Table */}
                <div className="flex-1 min-h-0">
                  {renderDataTable(excelData, false)}
                </div>
              </div>
          )}
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}