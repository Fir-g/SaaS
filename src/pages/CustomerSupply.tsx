import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Users, Building, TrendingUp, Star, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: string;
  name: string;
  type: 'ENTERPRISE' | 'SME' | 'INDIVIDUAL';
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  activeOrders: number;
  rating: number;
  totalValue: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

interface Supplier {
  id: string;
  name: string;
  type: 'FLEET_OWNER' | 'LOGISTICS_PARTNER' | 'VENDOR';
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  vehicleCount: number;
  activeTrips: number;
  rating: number;
  completedTrips: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

const CustomerSupply: React.FC = () => {
  const navigate = useNavigate();
  const { organization } = useOrganization();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Check if current organization is onboarding team
  const teamType = organization?.publicMetadata?.teamType as string;
  const isOnboardingTeam = teamType === "ONBOARDING";

  // Mock data for demonstration
  const mockCustomers: Customer[] = [
    {
      id: 'C001',
      name: 'Reliance Industries',
      type: 'ENTERPRISE',
      contactPerson: 'Rajesh Kumar',
      email: 'rajesh@reliance.com',
      phone: '+91-9876543210',
      city: 'Mumbai',
      totalOrders: 150,
      activeOrders: 12,
      rating: 4.8,
      totalValue: 2500000,
      status: 'ACTIVE'
    },
    {
      id: 'C002',
      name: 'Tata Steel',
      type: 'ENTERPRISE',
      contactPerson: 'Priya Sharma',
      email: 'priya@tatasteel.com',
      phone: '+91-9876543211',
      city: 'Kolkata',
      totalOrders: 98,
      activeOrders: 8,
      rating: 4.6,
      totalValue: 1800000,
      status: 'ACTIVE'
    },
    {
      id: 'C003',
      name: 'Local Trading Co.',
      type: 'SME',
      contactPerson: 'Amit Patel',
      email: 'amit@localtrading.com',
      phone: '+91-9876543212',
      city: 'Ahmedabad',
      totalOrders: 25,
      activeOrders: 3,
      rating: 4.2,
      totalValue: 350000,
      status: 'ACTIVE'
    }
  ];

  const mockSuppliers: Supplier[] = [
    {
      id: 'S001',
      name: 'ABC Transport Solutions',
      type: 'FLEET_OWNER',
      contactPerson: 'Suresh Gupta',
      email: 'suresh@abctransport.com',
      phone: '+91-9876543220',
      city: 'Delhi',
      vehicleCount: 45,
      activeTrips: 15,
      rating: 4.7,
      completedTrips: 2850,
      status: 'ACTIVE'
    },
    {
      id: 'S002',
      name: 'XYZ Logistics',
      type: 'LOGISTICS_PARTNER',
      contactPerson: 'Deepika Singh',
      email: 'deepika@xyzlogistics.com',
      phone: '+91-9876543221',
      city: 'Bangalore',
      vehicleCount: 28,
      activeTrips: 9,
      rating: 4.5,
      completedTrips: 1650,
      status: 'ACTIVE'
    },
    {
      id: 'S003',
      name: 'Quick Move Services',
      type: 'VENDOR',
      contactPerson: 'Rahul Jain',
      email: 'rahul@quickmove.com',
      phone: '+91-9876543222',
      city: 'Pune',
      vehicleCount: 12,
      activeTrips: 4,
      rating: 4.1,
      completedTrips: 890,
      status: 'PENDING'
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCustomers(mockCustomers);
      setSuppliers(mockSuppliers);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'ENTERPRISE':
      case 'FLEET_OWNER': return 'default';
      case 'SME':
      case 'LOGISTICS_PARTNER': return 'secondary';
      case 'INDIVIDUAL':
      case 'VENDOR': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'INACTIVE': return 'secondary';
      case 'PENDING': return 'outline';
      default: return 'outline';
    }
  };

  const getFilteredData = () => {
    const data = activeTab === 'customers' ? customers : suppliers;
    if (!searchTerm.trim()) return data;
    const searchTermLower = searchTerm.toLowerCase().trim();
    return data.filter(item => 
      item.name.toLowerCase().includes(searchTermLower) ||
      item.contactPerson.toLowerCase().includes(searchTermLower) ||
      item.city.toLowerCase().includes(searchTermLower) ||
      item.email.toLowerCase().includes(searchTermLower)
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const totalCustomers = customers.length;
  const totalSuppliers = suppliers.length;
  const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
  const activeSuppliers = suppliers.filter(s => s.status === 'ACTIVE').length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading customer & supply data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer & Supply Management</h1>
          <p className="text-muted-foreground">
            Manage customers and suppliers in your transportation network
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Total Customers</div>
              </div>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <div className="text-sm text-muted-foreground">{activeCustomers} active</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Total Suppliers</div>
              </div>
              <div className="text-2xl font-bold">{totalSuppliers}</div>
              <div className="text-sm text-muted-foreground">{activeSuppliers} active</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Active Orders</div>
              </div>
              <div className="text-2xl font-bold">{customers.reduce((sum, c) => sum + c.activeOrders, 0)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
              <div className="text-2xl font-bold">
                {activeTab === 'customers' 
                  ? (customers.reduce((sum, c) => sum + c.rating, 0) / customers.length).toFixed(1)
                  : (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <Button
            variant={activeTab === 'customers' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('customers')}
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Customers</span>
          </Button>
          <Button
            variant={activeTab === 'suppliers' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('suppliers')}
            className="flex items-center space-x-2"
          >
            <Building className="w-4 h-4" />
            <span>Suppliers</span>
          </Button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-4 space-y-2 md:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          {isOnboardingTeam && (
            <Button
              onClick={() => navigate('/onboarding/new')}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Onboarding</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setFiltersVisible(!filtersVisible)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>{filtersVisible ? 'Hide Filters' : 'Show Filters'}</span>
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>{activeTab === 'customers' ? 'Customers' : 'Suppliers'}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="w-full min-w-[1000px]">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-medium w-36">Name</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-28">Type</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-32">Contact Person</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-24">City</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-32">Phone</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-24">Rating</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-24">
                      {activeTab === 'customers' ? 'Orders' : 'Vehicles'}
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-20">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {getFilteredData().length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                        {searchTerm ? `No matching ${activeTab} found` : `No ${activeTab} available`}
                      </td>
                    </tr>
                  ) : (
                    getFilteredData().map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50">
                        <td className="px-4 py-4 text-sm font-medium truncate max-w-36">{item.name}</td>
                        <td className="px-4 py-4">
                          <Badge variant={getTypeBadgeVariant(item.type)} className="text-xs">
                            {item.type.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm truncate">{item.contactPerson}</td>
                        <td className="px-4 py-4 text-sm truncate">{item.city}</td>
                        <td className="px-4 py-4 text-sm truncate">{item.phone}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-1">
                            {renderStars(item.rating)}
                            <span className="text-xs text-muted-foreground ml-1">
                              {item.rating.toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                          {activeTab === 'customers' 
                            ? `${(item as Customer).activeOrders}/${(item as Customer).totalOrders}`
                            : `${(item as Supplier).activeTrips}/${(item as Supplier).vehicleCount}`
                          }
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs">
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              View
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              Edit
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

export default CustomerSupply;