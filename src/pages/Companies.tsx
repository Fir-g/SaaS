import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { CompanyFilters } from '@/components/companies/CompanyFilters';
import { CompanyDataTable } from '@/components/companies/CompanyDataTable';
import { BulkUploadDialog } from '@/components/companies/BulkUploadDialog';
import { companyService } from '@/services/companyService';
import { Company, CompanySearchCriteria, CompanyPage } from '@/types/company';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/clerk-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const DEFAULT_CRITERIA: CompanySearchCriteria = {
  page: 0,
  size: 20,
  sortBy: 'createdAt',
  sortDirection: 'desc'
};

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState<CompanySearchCriteria>(DEFAULT_CRITERIA);
  const [pageInfo, setPageInfo] = useState<CompanyPage | null>(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const { toast } = useToast();
  const { getToken } = useAuth();

  const fetchCompanies = useCallback(async (searchCriteria: CompanySearchCriteria) => {
    setLoading(true);
    try {
      const clerkToken = await getToken();
      const result = await companyService.getCompanies(searchCriteria, clerkToken);
      setCompanies(result.content);
      setPageInfo(result);
    } catch (error) {
      console.error('Error fetching companies:', error);
      
      // Show a more user-friendly error message
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      
      toast({
        title: "Error fetching companies",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Set empty state when API fails
      setCompanies([]);
      setPageInfo(null);
    } finally {
      setLoading(false);
    }
  }, [toast, getToken]);

  useEffect(() => {
    fetchCompanies(criteria);
  }, [fetchCompanies, criteria]);

  const handleCriteriaChange = (newCriteria: CompanySearchCriteria) => {
    setCriteria({ ...newCriteria, page: 0 }); // Reset to first page when criteria changes
  };

  const handleApplyFilters = () => {
    fetchCompanies(criteria);
  };

  const handleResetFilters = () => {
    setCriteria(DEFAULT_CRITERIA);
  };

  const handlePageChange = (newPage: number) => {
    setCriteria(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: string) => {
    setCriteria(prev => ({ ...prev, size: parseInt(newSize), page: 0 }));
  };

  const handleRefresh = () => {
    fetchCompanies(criteria);
  };

  const handleUploadComplete = () => {
    setBulkUploadOpen(false);
    fetchCompanies(criteria);
  };

  const handleCompanyDelete = async (company: Company) => {
    try {
      const clerkToken = await getToken();
      await companyService.softDeleteCompany(company.id, clerkToken);
      toast({
        title: "Company deleted",
        description: `${company.name} has been deleted successfully`
      });
      fetchCompanies(criteria);
    } catch (error) {
      toast({
        title: "Error deleting company",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleCompanyRestore = async (company: Company) => {
    try {
      const clerkToken = await getToken();
      await companyService.restoreCompany(company.id, clerkToken);
      toast({
        title: "Company restored",
        description: `${company.name} has been restored successfully`
      });
      fetchCompanies(criteria);
    } catch (error) {
      toast({
        title: "Error restoring company",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const exportCompanies = async () => {
    try {
      const exportCriteria = { ...criteria, size: 1000 }; // Export more records
      const result = await companyService.getCompanies(exportCriteria);
      
      // Convert to CSV
      const headers = [
        'FTEID', 'Name', 'Phone', 'Address', 'CRM Types', 'Status',
        'Supplier Score Card', 'Supplier Score', 'Transporter Score Card', 'Transporter Score',
        'Created At'
      ];
      
      const csvContent = [
        headers.join(','),
        ...result.content.map(company => [
          company.fteid,
          `"${company.name}"`,
          company.phoneNumber || '',
          `"${company.address || ''}"`,
          `"${company.crmType.join(', ')}"`,
          company.isActive ? 'Active' : 'Inactive',
          company.supplierScoreCard || '',
          company.supplierScore || '',
          company.transporterScoreCard || '',
          company.transporterScore || '',
          new Date(company.createdAt).toISOString()
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `companies_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Exported ${result.content.length} companies`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">
            Manage your suppliers, transporters, and shippers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportCompanies}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setBulkUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {/* Filters */}
      <CompanyFilters
        criteria={criteria}
        onCriteriaChange={handleCriteriaChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Data Table */}
      <CompanyDataTable
        companies={companies}
        loading={loading}
        criteria={criteria}
        onCriteriaChange={setCriteria}
        onCompanyDelete={handleCompanyDelete}
        onCompanyRestore={handleCompanyRestore}
      />

      {/* Pagination */}
      {pageInfo && pageInfo.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {pageInfo.number * pageInfo.size + 1} to{' '}
                  {Math.min((pageInfo.number + 1) * pageInfo.size, pageInfo.totalElements)} of{' '}
                  {pageInfo.totalElements} results
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Rows per page:</span>
                  <Select
                    value={criteria.size?.toString() || '20'}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(0)}
                    disabled={pageInfo.first}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pageInfo.number - 1)}
                    disabled={pageInfo.first}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm px-3">
                    Page {pageInfo.number + 1} of {pageInfo.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pageInfo.number + 1)}
                    disabled={pageInfo.last}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pageInfo.totalPages - 1)}
                    disabled={pageInfo.last}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        onUploadComplete={handleUploadComplete}
      />
      </div>
    </ErrorBoundary>
  );
}
