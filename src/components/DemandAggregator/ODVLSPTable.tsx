import React, { useState, useEffect } from "react";
import { useAuth } from '@clerk/clerk-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  Users,
  Truck,
  TrendingUp,
} from "lucide-react";
import { getODVLSPData } from "@/services/demandAggregatorService";
import { ODVLSPEntry, ODVLSPResponse } from "@/types/demand";

interface ODVLSPTableProps {
  dateRange: { from: string; to: string };
  statusParam: string;
  filters: {
    origins: string[];
    destinations: string[];
    lsp_names: string[];
    vehicle_ids: string[];
  };
}

const ODVLSPTable: React.FC<ODVLSPTableProps> = ({
  dateRange,
  statusParam,
  filters,
}) => {
  const { getToken } = useAuth();
  const [data, setData] = useState<ODVLSPResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch data when filters or date range changes
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchData();
    }
  }, [dateRange, statusParam, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const template = import.meta.env.VITE_CLERK_TOKEN_TEMPLATE as string | undefined;
      const token = await getToken({ template, skipCache: true });
      const response = await getODVLSPData(
        "FT", // tenant_id
        "demand", // entity
        dateRange.from,
        dateRange.to,
        statusParam,
        // Send empty string when no specific filters are selected (meaning "All")
        filters.origins.length > 0 ? filters.origins.join(",") : "",
        filters.destinations.length > 0 ? filters.destinations.join(",") : "",
        filters.lsp_names.length > 0 ? filters.lsp_names.join(",") : "",
        filters.vehicle_ids.length > 0 ? filters.vehicle_ids.join(",") : "",
        token
      );
      setData(response);
      setCurrentPage(1); // Reset to first page when data changes
    } catch (error) {
      console.error("Error fetching ODV LSP data:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Use all data rows (search removed)
  const filteredData = React.useMemo(() => {
    return data?.rows || [];
  }, [data]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (!dateRange.from || !dateRange.to) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            ODV LSP Analysis
          </CardTitle>
          <CardDescription>
            Origin, Destination, Vehicle & LSP breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              Select date range to view data
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Choose from and to dates in the filters above
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {statusParam && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <Badge variant="outline">Status: {statusParam}</Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Results Summary and Total in one line */}
        <div className="mb-4 text-sm text-gray-600 flex items-center justify-between">
          <div>
            Showing {filteredData.length === 0 ? 0 : startIndex + 1}-
            {filteredData.length === 0
              ? 0
              : Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex items-center gap-1 text-blue-600">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold">Total: {data?.total ?? 0}</span>
          </div>
        </div>

        {/* Table always rendered so headers remain visible */}
        <div className="border rounded-lg overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold sticky top-0 z-10 bg-gray-50 w-1/5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    Origin
                  </div>
                </TableHead>
                <TableHead className="font-semibold sticky top-0 z-10 bg-gray-50 w-1/5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    Destination
                  </div>
                </TableHead>
                <TableHead className="font-semibold sticky top-0 z-10 bg-gray-50 w-1/5">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    Vehicle
                  </div>
                </TableHead>
                <TableHead className="font-semibold sticky top-0 z-10 bg-gray-50 w-1/5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    LSP Name
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-right sticky top-0 z-10 bg-gray-50 w-20">
                  Count
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-8">
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-500">Loading data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (!data || filteredData.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        {!data ? "No data available" : "No rows for selected filters"}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your filters or date range
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow
                    key={`${row.origin}-${row.destination}-${row.vehicle_name}-${row.lsp_name}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-medium w-1/5">
                      {row.origin || (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="w-1/5">
                      {row.destination || (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="w-1/5">
                      <div
                        className="whitespace-normal break-words"
                        title={row.vehicle_name}
                      >
                        {row.vehicle_name || (
                          <span className="text-gray-400 italic">
                            Not specified
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-1/5">
                      <div
                        className="whitespace-normal break-words"
                        title={row.lsp_name}
                      >
                        {row.lsp_name || (
                          <span className="text-gray-400 italic">
                            Not specified
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right w-20">
                      <Badge variant="secondary" className="font-semibold">
                        {row.count}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={
                        currentPage === pageNum ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ODVLSPTable;
