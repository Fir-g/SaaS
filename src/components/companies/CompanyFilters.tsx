import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';
import { CompanySearchCriteria, ScoreCard, CrmType } from '@/types/company';

interface CompanyFiltersProps {
  criteria: CompanySearchCriteria;
  onCriteriaChange: (criteria: CompanySearchCriteria) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const SCORE_CARDS: ScoreCard[] = ['PLATINUM', 'GOLD', 'SILVER', 'RED', 'BLACK', 'NEW'];
const CRM_TYPES: CrmType[] = ['TRANSPORTER', 'SUPPLIER', 'SHIPPER'];

export function CompanyFilters({ criteria, onCriteriaChange, onApplyFilters, onResetFilters }: CompanyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateCriteria = (updates: Partial<CompanySearchCriteria>) => {
    onCriteriaChange({ ...criteria, ...updates });
  };

  const toggleCrmType = (crmType: string) => {
    const currentTypes = criteria.crmTypes || [];
    const newTypes = currentTypes.includes(crmType)
      ? currentTypes.filter(t => t !== crmType)
      : [...currentTypes, crmType];
    updateCriteria({ crmTypes: newTypes });
  };

  const removeCrmType = (crmType: string) => {
    const newTypes = (criteria.crmTypes || []).filter(t => t !== crmType);
    updateCriteria({ crmTypes: newTypes });
  };

  const hasActiveFilters = () => {
    return !!(
      criteria.searchTerm ||
      criteria.isActive !== undefined ||
      criteria.crmTypes?.length ||
      criteria.supplierScoreCard ||
      criteria.transporterScoreCard ||
      criteria.supplierScoreMin ||
      criteria.supplierScoreMax ||
      criteria.transporterScoreMin ||
      criteria.transporterScoreMax ||
      criteria.createdAtFrom ||
      criteria.createdAtTo
    );
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
            {hasActiveFilters() && (
              <Button variant="outline" size="sm" onClick={onResetFilters}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search companies..."
              value={criteria.searchTerm || ''}
              onChange={(e) => updateCriteria({ searchTerm: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={criteria.isActive === undefined ? 'all' : criteria.isActive ? 'active' : 'inactive'}
              onValueChange={(value) => 
                updateCriteria({ 
                  isActive: value === 'all' ? undefined : value === 'active' 
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Supplier Score Card</Label>
            <Select
              value={criteria.supplierScoreCard || 'all'}
              onValueChange={(value) => 
                updateCriteria({ supplierScoreCard: value === 'all' ? undefined : value as ScoreCard })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select score card" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {SCORE_CARDS.map(card => (
                  <SelectItem key={card} value={card}>{card}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* CRM Types */}
        <div className="space-y-2">
          <Label>CRM Types</Label>
          <div className="flex flex-wrap gap-2">
            {CRM_TYPES.map(type => (
              <Button
                key={type}
                variant={criteria.crmTypes?.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCrmType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
          {criteria.crmTypes && criteria.crmTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {criteria.crmTypes.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => removeCrmType(type)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transporter Score Card</Label>
                <Select
                  value={criteria.transporterScoreCard || 'all'}
                  onValueChange={(value) => 
                    updateCriteria({ transporterScoreCard: value === 'all' ? undefined : value as ScoreCard })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select score card" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {SCORE_CARDS.map(card => (
                      <SelectItem key={card} value={card}>{card}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierScoreMin">Supplier Score Min</Label>
                <Input
                  id="supplierScoreMin"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={criteria.supplierScoreMin || ''}
                  onChange={(e) => updateCriteria({ 
                    supplierScoreMin: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierScoreMax">Supplier Score Max</Label>
                <Input
                  id="supplierScoreMax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={criteria.supplierScoreMax || ''}
                  onChange={(e) => updateCriteria({ 
                    supplierScoreMax: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transporterScoreMin">Transporter Score Min</Label>
                <Input
                  id="transporterScoreMin"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={criteria.transporterScoreMin || ''}
                  onChange={(e) => updateCriteria({ 
                    transporterScoreMin: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transporterScoreMax">Transporter Score Max</Label>
                <Input
                  id="transporterScoreMax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={criteria.transporterScoreMax || ''}
                  onChange={(e) => updateCriteria({ 
                    transporterScoreMax: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="createdAtFrom">Created From</Label>
                <Input
                  id="createdAtFrom"
                  type="date"
                  value={criteria.createdAtFrom || ''}
                  onChange={(e) => updateCriteria({ createdAtFrom: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="createdAtTo">Created To</Label>
                <Input
                  id="createdAtTo"
                  type="date"
                  value={criteria.createdAtTo || ''}
                  onChange={(e) => updateCriteria({ createdAtTo: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
