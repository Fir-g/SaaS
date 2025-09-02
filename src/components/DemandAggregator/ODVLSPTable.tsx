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
import { Input } from "@/components/ui/input";
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
  Search,
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
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    if (!data?.rows || !searchTerm) return data?.rows || [];

    return data.rows.filter(
      (row) =>
        row.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.lsp_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

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
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              ODV LSP Analysis
            </CardTitle>
            <CardDescription>
              Origin, Destination, Vehicle & LSP breakdown
            </CardDescription>
          </div>

          {data && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-blue-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">Total: {data.total}</span>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search origin, destination, vehicle, or LSP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-500">Loading data...</span>
          </div>
        ) : !data || filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {!data ? "No data available" : "No matching results found"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {!data
                ? "Try adjusting your filters or date range"
                : "Try adjusting your search terms"}
            </p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} results
              {searchTerm && ` for "${searchTerm}"`}
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        Origin
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        Destination
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        Vehicle
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        LSP Name
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Count
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow
                      key={`${row.origin}-${row.destination}-${row.vehicle_name}-${row.lsp_name}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        {row.origin || (
                          <span className="text-gray-400 italic">
                            Not specified
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.destination || (
                          <span className="text-gray-400 italic">
                            Not specified
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-[200px] truncate"
                          title={row.vehicle_name}
                        >
                          {row.vehicle_name || (
                            <span className="text-gray-400 italic">
                              Not specified
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-[150px] truncate"
                          title={row.lsp_name}
                        >
                          {row.lsp_name || (
                            <span className="text-gray-400 italic">
                              Not specified
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-semibold">
                          {row.count}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ODVLSPTable;
