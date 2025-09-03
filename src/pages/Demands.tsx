import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, TrendingUp, Calendar, MapPin, Package2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface DemandItem {
  id: string;
  customerName: string;
  origin: string;
  destination: string;
  vehicleType: string;
  quantity: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  requestedDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'COMPLETED';
  estimatedCost: number;
}

const Demands: React.FC = () => {
  const [demands, setDemands] = useState<DemandItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Mock data for demonstration
  const mockDemands: DemandItem[] = [
    {
      id: 'D001',
      customerName: 'Reliance Industries',
      origin: 'Mumbai',
      destination: 'Delhi',
      vehicleType: 'Truck 32FT SXL',
      quantity: 25,
      priority: 'HIGH',
      requestedDate: '2024-01-15',
      status: 'PENDING',
      estimatedCost: 125000
    },
    {
      id: 'D002',
      customerName: 'Tata Steel',
      origin: 'Kolkata',
      destination: 'Chennai',
      vehicleType: 'Truck 20FT',
      quantity: 15,
      priority: 'MEDIUM',
      requestedDate: '2024-01-16',
      status: 'CONFIRMED',
      estimatedCost: 85000
    },
    {
      id: 'D003',
      customerName: 'ITC Limited',
      origin: 'Bangalore',
      destination: 'Hyderabad',
      vehicleType: 'Truck 14FT',
      quantity: 10,
      priority: 'LOW',
      requestedDate: '2024-01-17',
      status: 'ASSIGNED',
      estimatedCost: 45000
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDemands(mockDemands);
      setLoading(false);
    }, 1000);
  }, []);

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'outline';
      case 'CONFIRMED': return 'default';
      case 'ASSIGNED': return 'secondary';
      case 'COMPLETED': return 'default';
      default: return 'outline';
    }
  };

  const getFilteredDemands = () => {
    if (!searchTerm.trim()) return demands;
    const searchTermLower = searchTerm.toLowerCase().trim();
    return demands.filter(demand => 
      demand.customerName.toLowerCase().includes(searchTermLower) ||
      demand.origin.toLowerCase().includes(searchTermLower) ||
      demand.destination.toLowerCase().includes(searchTermLower) ||
      demand.vehicleType.toLowerCase().includes(searchTermLower)
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const totalDemands = demands.length;
  const pendingDemands = demands.filter(d => d.status === 'PENDING').length;
  const totalValue = demands.reduce((sum, d) => sum + d.estimatedCost, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading demands data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demands Dashboard</h1>
          <p className="text-muted-foreground">
            Manage customer transportation demands and requirements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package2 className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Total Demands</div>
              </div>
              <div className="text-2xl font-bold">{totalDemands}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-2xl font-bold">{pendingDemands}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Active Routes</div>
              </div>
              <div className="text-2xl font-bold">{new Set(demands.map(d => `${d.origin}-${d.destination}`)).size}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search demands by customer, route, or vehicle type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setFiltersVisible(!filtersVisible)}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>{filtersVisible ? 'Hide Filters' : 'Show Filters'}</span>
        </Button>
      </div>

      {/* Demands Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Demands</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="w-full min-w-[1200px]">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-medium w-24">Demand ID</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-36">Customer</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-40">Route</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-32">Vehicle Type</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-20">Quantity</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-20">Priority</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-24">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-28">Requested Date</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-24">Est. Cost</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-24">Actions</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-border">
                {getFilteredDemands().length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                      {searchTerm ? 'No matching demands found' : 'No demands available'}
                    </td>
                  </tr>
                ) : (
                  getFilteredDemands().map((demand) => (
                    <tr key={demand.id} className="hover:bg-muted/50">
                      <td className="px-4 py-4 text-sm font-mono">{demand.id}</td>
                      <td className="px-4 py-4 text-sm font-medium truncate max-w-36">{demand.customerName}</td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="truncate">{demand.origin}</span>
                          <span className="text-muted-foreground shrink-0">→</span>
                          <span className="truncate">{demand.destination}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm truncate">{demand.vehicleType}</td>
                      <td className="px-4 py-4 text-sm whitespace-nowrap">{demand.quantity} tons</td>
                      <td className="px-4 py-4">
                        <Badge variant={getPriorityBadgeVariant(demand.priority)} className="text-xs">
                          {demand.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={getStatusBadgeVariant(demand.status)} className="text-xs">
                          {demand.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm whitespace-nowrap">{formatDate(demand.requestedDate)}</td>
                      <td className="px-4 py-4 text-sm whitespace-nowrap">{formatCurrency(demand.estimatedCost)}</td>
                      <td className="px-4 py-4">
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            View
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            Assign
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Demands;