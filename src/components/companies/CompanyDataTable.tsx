import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Building2
} from 'lucide-react';
import { Company, CompanySearchCriteria } from '@/types/company';
import { cn } from '@/lib/utils';

interface CompanyDataTableProps {
  companies: Company[];
  loading: boolean;
  criteria: CompanySearchCriteria;
  onCriteriaChange: (criteria: CompanySearchCriteria) => void;
  onCompanySelect?: (company: Company) => void;
  onCompanyEdit?: (company: Company) => void;
  onCompanyDelete?: (company: Company) => void;
  onCompanyRestore?: (company: Company) => void;
}

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  criteria: CompanySearchCriteria;
  onSort: (sortBy: string, direction: 'asc' | 'desc') => void;
}

function SortableHeader({ label, sortKey, criteria, onSort }: SortableHeaderProps) {
  const isActive = criteria.sortBy === sortKey;
  const direction = criteria.sortDirection || 'asc';

  const handleSort = () => {
    if (isActive) {
      onSort(sortKey, direction === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(sortKey, 'asc');
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSort}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      {label}
      {isActive ? (
        direction === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
}

function ScoreCardBadge({ scoreCard, score }: { scoreCard?: string; score?: number }) {
  if (!scoreCard) return <span className="text-muted-foreground">—</span>;

  const getScoreCardColor = (card: string) => {
    switch (card) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'GOLD': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SILVER': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'RED': return 'bg-red-100 text-red-800 border-red-200';
      case 'BLACK': return 'bg-gray-900 text-white border-gray-700';
      case 'NEW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Badge variant="outline" className={cn("text-xs", getScoreCardColor(scoreCard))}>
        {scoreCard}
      </Badge>
      {score !== undefined && (
        <span className="text-xs text-muted-foreground">{score.toFixed(1)}</span>
      )}
    </div>
  );
}

export function CompanyDataTable({
  companies,
  loading,
  criteria,
  onCriteriaChange,
  onCompanySelect,
  onCompanyEdit,
  onCompanyDelete,
  onCompanyRestore
}: CompanyDataTableProps) {
  const handleSort = (sortBy: string, direction: 'asc' | 'desc') => {
    onCriteriaChange({
      ...criteria,
      sortBy,
      sortDirection: direction
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No companies found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search criteria.
            </p>
            {import.meta.env.DEV && (
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                <p className="font-medium mb-1">Development Info:</p>
                <p>Make sure the backend server is running on {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}</p>
                <p>Check the browser console for API errors.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Companies ({companies.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader
                    label="FTEID"
                    sortKey="fteid"
                    criteria={criteria}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Name"
                    sortKey="name"
                    criteria={criteria}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead>CRM Types</TableHead>
                <TableHead>
                  <SortableHeader
                    label="Status"
                    sortKey="isActive"
                    criteria={criteria}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead>Supplier Score</TableHead>
                <TableHead>Transporter Score</TableHead>
                <TableHead>
                  <SortableHeader
                    label="Created"
                    sortKey="createdAt"
                    criteria={criteria}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id} className={company.isDeleted ? 'opacity-60' : ''}>
                  <TableCell className="font-mono text-sm">
                    {company.fteid}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{company.name}</span>
                      {company.phoneNumber && (
                        <span className="text-sm text-muted-foreground">
                          {company.phoneNumber}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {company.crmType.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant={company.isActive ? "default" : "secondary"}
                        className="w-fit"
                      >
                        {company.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {company.isDeleted && (
                        <Badge variant="destructive" className="w-fit text-xs">
                          Deleted
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ScoreCardBadge 
                      scoreCard={company.supplierScoreCard} 
                      score={company.supplierScore} 
                    />
                  </TableCell>
                  <TableCell>
                    <ScoreCardBadge 
                      scoreCard={company.transporterScoreCard} 
                      score={company.transporterScore} 
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {onCompanySelect && (
                          <DropdownMenuItem onClick={() => onCompanySelect(company)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onCompanyEdit && !company.isDeleted && (
                          <DropdownMenuItem onClick={() => onCompanyEdit(company)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {company.isDeleted ? (
                          onCompanyRestore && (
                            <DropdownMenuItem 
                              onClick={() => onCompanyRestore(company)}
                              className="text-green-600"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Restore
                            </DropdownMenuItem>
                          )
                        ) : (
                          onCompanyDelete && (
                            <DropdownMenuItem 
                              onClick={() => onCompanyDelete(company)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
