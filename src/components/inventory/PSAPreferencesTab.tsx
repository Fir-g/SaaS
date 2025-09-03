import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Save, X, ChevronLeft, ChevronRight, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { useOrganization } from '@clerk/clerk-react';
import { useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PSAPreference {
  id: string;
  psaAgentId: string;
  psaAgentName: string;
  psaAgentEmail: string;
  origins: string[];
  destinations: string[];
}

interface PSAAgent {
  id: string;
  email: string;
  name: string;
}

interface PSAPreferencesTabProps {
  originClusterOptions: Array<{ value: string; text: string }>;
  destinationClusterOptions: Array<{ value: string; text: string }>;
  token: string;
}

const PSAPreferencesTab: React.FC<PSAPreferencesTabProps> = ({ 
  originClusterOptions, 
  destinationClusterOptions,
  token 
}) => {
  const [preferences, setPreferences] = useState<PSAPreference[]>([]);
  const [psaAgents, setPsaAgents] = useState<PSAAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();

  // New preference form state
  const [newPreference, setNewPreference] = useState({
    psaAgentId: '',
    origins: [] as string[],
    destinations: [] as string[],
  });

  // Search states for origin and destination
  const [originSearchTerm, setOriginSearchTerm] = useState('');
  const [originSearchOptions, setOriginSearchOptions] = useState<Array<{ value: string; text: string }>>([]);
  const [destinationSearchTerm, setDestinationSearchTerm] = useState('');
  const [destinationSearchOptions, setDestinationSearchOptions] = useState<Array<{ value: string; text: string }>>([]);
  const [agentSearchTerm, setAgentSearchTerm] = useState('');

  const { memberships } = useOrganization({ 
    memberships: { 
      infinite: true,
      pageSize: 100 // Increase page size to get more members
    } 
  });

  // Function to call PSA inventory details API with current filters
  const callPsaInventoryDetailsApi = useCallback(async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      // Get all current PSA preferences to build filter parameters
      const allOrigins = preferences.flatMap(p => p.origins);
      const allDestinations = preferences.flatMap(p => p.destinations);
      
      const filters = {
        psaFteid: undefined, // Will be set by individual PSA agents
        originCluster: allOrigins.length > 0 ? allOrigins.join(',') : undefined,
        destinationCluster: allDestinations.length > 0 ? allDestinations.join(',') : undefined,
        inventorySourceType: undefined, // Not applicable for PSA preferences
        fleetOwners: undefined, // Not applicable for PSA preferences
        vehicleType: undefined, // Not applicable for PSA preferences
      };

      
      
      // Call the API for each PSA agent that has preferences
      for (const preference of preferences) {
        const agentFilters = {
          ...filters,
          psaFteid: preference.psaAgentId,
        };
        
        await apiService.fetchPsaInventoryDetails(month, year, token, agentFilters);
      }
      
      
    } catch (error) {
      
    }
  }, [preferences, token]);

  // Fetch PSA agents and preferences on component mount and when memberships change
  useEffect(() => {
    const loadData = async () => {
      await fetchPSAAgents();
      await fetchPreferences();
    };
    loadData();
  }, [memberships?.data?.length]);

  // Fetch preferences when psaAgents changes
  useEffect(() => {
    if (psaAgents.length > 0) {
      fetchPreferences();
    }
  }, [psaAgents.length]);

  const fetchPSAAgents = async () => {
    try {
      // Ensure all membership pages are loaded when infinite pagination is used
      try {
        const memAny: any = memberships as any;
        let safetyCounter = 0;
        while (memAny && memAny.hasNextPage && typeof memAny.fetchNext === 'function' && safetyCounter < 20) {
          // eslint-disable-next-line no-await-in-loop
          await memAny.fetchNext();
          safetyCounter += 1;
        }
      } catch (_) {}

      const dedupByEmail = new Map<string, PSAAgent>();
      (memberships?.data || []).forEach((m: any) => {
        const id = m.publicUserData?.userId;
        const email = m.publicUserData?.identifier;
        const name = `${m.publicUserData?.firstName || ''} ${m.publicUserData?.lastName || ''}`.trim() || email;
        if (id && email) {
          dedupByEmail.set(email, { id, email, name });
        }
      });
      setPsaAgents(Array.from(dedupByEmail.values()));
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to load organization members.",
        variant: "destructive",
      });
    }
  };

  // Sorted and filtered agents for the Select (by email, type-to-search)
  const sortedFilteredAgents = useMemo(() => {
    const sorted = [...psaAgents].sort((a, b) => (a.email || '').toLowerCase().localeCompare((b.email || '').toLowerCase()));
    const term = agentSearchTerm.trim().toLowerCase();
    if (!term) return sorted;
    return sorted.filter(a => (a.email || '').toLowerCase().includes(term) || (a.name || '').toLowerCase().includes(term));
  }, [psaAgents, agentSearchTerm]);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      // Fetch all PSA cluster mappings at once
      const response = await apiService.getAllPsaClusterMappings(token);
      
      if (response.success && response.value && Array.isArray(response.value)) {
        const fetchedPreferences: PSAPreference[] = [];
        
        // Process each mapping from the API response
        response.value.forEach((mapping: any) => {
          const origins = mapping.originClusters || [];
          const destinations = mapping.destinationClusters || [];
          
          if (origins.length > 0 || destinations.length > 0) {
            // Find the corresponding PSA agent for this mapping
            const agent = psaAgents.find(a => a.email === mapping.email);
            fetchedPreferences.push({
              id: mapping.id?.toString() || `${mapping.email}-${Math.random().toString(36).slice(2)}`,
              psaAgentId: agent?.id || mapping.email,
              psaAgentName: agent?.name || mapping.email,
              psaAgentEmail: agent?.email || mapping.email,
              origins: origins,
              destinations: destinations,
            });
          }
        });
        
        setPreferences(fetchedPreferences);
        setTotalItems(fetchedPreferences.length);
        setTotalPages(Math.ceil(fetchedPreferences.length / 20));
      } else {
        setPreferences([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load PSA preferences.",
        variant: "destructive",
      });
      setPreferences([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle origin search
  const handleOriginSearch = async (searchTerm: string) => {
    if (searchTerm.length >= 2) {
      const filteredOptions = originClusterOptions.filter(option =>
        option.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setOriginSearchOptions(filteredOptions);
    } else {
      setOriginSearchOptions([]);
    }
  };

  // Handle destination search
  const handleDestinationSearch = async (searchTerm: string) => {
    if (searchTerm.length >= 2) {
      const filteredOptions = destinationClusterOptions.filter(option =>
        option.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDestinationSearchOptions(filteredOptions);
    } else {
      setDestinationSearchOptions([]);
    }
  };

  const handleAddPreference = async () => {
    if (!newPreference.psaAgentId || newPreference.origins.length === 0 || newPreference.destinations.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a PSA agent and at least one origin and destination.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedAgent = psaAgents.find(agent => agent.id === newPreference.psaAgentId);
      if (!selectedAgent) return;

      // Call API to create PSA cluster mapping
      const response = await apiService.createPsaClusterMapping(
        selectedAgent.email,
        newPreference.origins,
        newPreference.destinations,
        token
      );

      if (response.success) {
        // Check if preference already exists for this agent (one preference per email)
        setPreferences(prev => {
          const existingIndex = prev.findIndex(p => p.psaAgentEmail === selectedAgent.email);
          if (existingIndex !== -1) {
            const existing = prev[existingIndex];
            const mergedOrigins = Array.from(new Set([...existing.origins, ...newPreference.origins]));
            const mergedDestinations = Array.from(new Set([...existing.destinations, ...newPreference.destinations]));
            const updated: PSAPreference = {
              ...existing,
              origins: mergedOrigins,
              destinations: mergedDestinations,
            };
            const clone = [...prev];
            clone[existingIndex] = updated;
            return clone;
          }
          const newPref: PSAPreference = {
            id: Date.now().toString(),
            psaAgentId: newPreference.psaAgentId,
            psaAgentName: selectedAgent.name,
            psaAgentEmail: selectedAgent.email,
            origins: [...newPreference.origins],
            destinations: [...newPreference.destinations],
          };
          return [...prev, newPref];
        });
        
        // Reset form
        setNewPreference({
          psaAgentId: '',
          origins: [],
          destinations: [],
        });
        setOriginSearchTerm('');
        setDestinationSearchTerm('');

        toast({
          title: "Success",
          description: "PSA preference added successfully.",
        });
        
        // Call PSA inventory details API after adding preference
        await callPsaInventoryDetailsApi();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add PSA preference.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding preference:', error);
      toast({
        title: "Error",
        description: "Failed to add PSA preference.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCluster = async (email: string, cluster: string, clusterType: 'origin' | 'destination') => {
    try {
      // Call API to delete specific cluster from PSA mapping
      const response = await apiService.deleteClustersFromPsaMapping(
        email,
        cluster,
        clusterType,
        token
      );

      if (response.success) {
        // Update local state only after successful API call
        setPreferences(prev => prev.map(pref => {
          if (pref.psaAgentEmail === email) {
            if (clusterType === 'origin') {
              return {
                ...pref,
                origins: pref.origins.filter(o => o !== cluster)
              };
            } else {
              return {
                ...pref,
                destinations: pref.destinations.filter(d => d !== cluster)
              };
            }
          }
          return pref;
        }));
        
        toast({
          title: "Success",
          description: `${clusterType} cluster "${cluster}" deleted successfully.`,
        });
        
        // Call PSA inventory details API after deleting cluster
        await callPsaInventoryDetailsApi();
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to delete ${clusterType} cluster.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting cluster:', error);
      toast({
        title: "Error",
        description: `Failed to delete ${clusterType} cluster.`,
        variant: "destructive",
      });
    }
  };

  const handleDeletePreference = async (id: string) => {
    try {
      // Find the preference to get the email for API call
      const preferenceToDelete = preferences.find(pref => pref.id === id);
      if (!preferenceToDelete) {
        toast({
          title: "Error",
          description: "Preference not found.",
          variant: "destructive",
        });
        return;
      }

      // For now, we'll delete all clusters by deleting each one
      // This could be optimized if there's a bulk delete API
      const allClusters = [
        ...preferenceToDelete.origins.map(o => ({ cluster: o, type: 'origin' as const })),
        ...preferenceToDelete.destinations.map(d => ({ cluster: d, type: 'destination' as const }))
      ];

      let successCount = 0;
      for (const { cluster, type } of allClusters) {
        const response = await apiService.deleteClustersFromPsaMapping(
          preferenceToDelete.psaAgentEmail,
          cluster,
          type,
          token
        );
        if (response.success) {
          successCount++;
        }
      }

      if (successCount === allClusters.length) {
        // All clusters deleted successfully, remove the entire preference
        setPreferences(prev => prev.filter(pref => pref.id !== id));
        
        toast({
          title: "Success",
          description: "PSA preference deleted successfully.",
        });
        
        // Call PSA inventory details API after deleting preference
        await callPsaInventoryDetailsApi();
      } else {
        toast({
          title: "Partial Success",
          description: `Deleted ${successCount} of ${allClusters.length} clusters.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting preference:', error);
      toast({
        title: "Error",
        description: "Failed to delete PSA preference.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">PSA Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Manage PSA agent preferences for origins and destinations
          </p>
        </div>
      </div>

      {/* Add New Preference Form */}
      <Card>
       
        <CardContent className='p-4'>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
            {/* PSA Agent Selection (searchable by name/email) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">PSA Agent</label>
              <div className="relative">
                <Select 
                  value={newPreference.psaAgentId} 
                  onValueChange={(value) => setNewPreference(prev => ({ ...prev, psaAgentId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PSA Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Search by name or email..."
                        value={agentSearchTerm}
                        onChange={(e) => setAgentSearchTerm(e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                    {sortedFilteredAgents
                      .map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{agent.name}</span>
                            <span className="text-xs text-muted-foreground">{agent.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {newPreference.psaAgentId && (
                  <button
                    onClick={() => setNewPreference(prev => ({ ...prev, psaAgentId: '' }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    title="Clear agent"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Origin Selection - searchable multi-select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Origin</label>
              <div className="relative">
                <Select
                  value={'all'}
                  onValueChange={(value) => {
                    if (value === 'all') {
                      setNewPreference(prev => ({ ...prev, origins: [] }));
                      return;
                    }
                    setNewPreference(prev => (
                      prev.origins.includes(value)
                        ? prev
                        : { ...prev, origins: [...prev.origins, value] }
                    ));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={newPreference.origins.length > 0 ? `${newPreference.origins.length} selected` : 'Search origin...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Search origins..."
                        value={originSearchTerm}
                        onChange={(e) => setOriginSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="h-7 text-xs"
                      />
                    </div>
                    <SelectItem value="all">All Origins</SelectItem>
                    {originClusterOptions
                      .filter(o => originSearchTerm === '' || o.text.toLowerCase().includes(originSearchTerm.toLowerCase()))
                      .map(o => (
                        <SelectItem key={o.value} value={o.text}>{o.text}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {newPreference.origins.length > 0 && (
                  <button
                    onClick={() => { setNewPreference(prev => ({ ...prev, origins: [] })); setOriginSearchTerm(''); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    title="Clear all origins"
                  >
                    ×
                  </button>
                )}
              </div>
              {newPreference.origins.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newPreference.origins.map((o) => (
                    <Badge key={o} variant="secondary" className="text-xs px-2 py-1 h-6 flex items-center gap-1">
                      <span className="truncate max-w-[140px]">{o}</span>
                      <button
                        className="ml-1 hover:text-destructive text-xs font-medium"
                        onClick={() =>
                          setNewPreference(prev => ({
                            ...prev,
                            origins: prev.origins.filter(x => x !== o),
                          }))
                        }
                        aria-label={`Remove ${o}`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Selection - searchable multi-select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <div className="relative">
                <Select
                  value={'all'}
                  onValueChange={(value) => {
                    if (value === 'all') {
                      setNewPreference(prev => ({ ...prev, destinations: [] }));
                      return;
                    }
                    setNewPreference(prev => (
                      prev.destinations.includes(value)
                        ? prev
                        : { ...prev, destinations: [...prev.destinations, value] }
                    ));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={newPreference.destinations.length > 0 ? `${newPreference.destinations.length} selected` : 'Search destination...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Search destinations..."
                        value={destinationSearchTerm}
                        onChange={(e) => setDestinationSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="h-7 text-xs"
                      />
                    </div>
                    <SelectItem value="all">All Destinations</SelectItem>
                    {destinationClusterOptions
                      .filter(o => destinationSearchTerm === '' || o.text.toLowerCase().includes(destinationSearchTerm.toLowerCase()))
                      .map(o => (
                        <SelectItem key={o.value} value={o.text}>{o.text}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {newPreference.destinations.length > 0 && (
                  <button
                    onClick={() => { setNewPreference(prev => ({ ...prev, destinations: [] })); setDestinationSearchTerm(''); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    title="Clear all destinations"
                  >
                    ×
                  </button>
                )}
              </div>
              {newPreference.destinations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newPreference.destinations.map((d) => (
                    <Badge key={d} variant="secondary" className="text-xs px-2 py-1 h-6 flex items-center gap-1">
                      <span className="truncate max-w-[140px]">{d}</span>
                      <button
                        className="ml-1 hover:text-destructive text-xs font-medium"
                        onClick={() =>
                          setNewPreference(prev => ({
                            ...prev,
                            destinations: prev.destinations.filter(x => x !== d),
                          }))
                        }
                        aria-label={`Remove ${d}`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleAddPreference} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Add Preference
            </Button>
          </div>

         
        </CardContent>
      </Card>

      {/* Preferences Table */}
      <div className="rounded-md border">
          <Table>
          <TableHeader className="bg-background border-b">
            <TableRow className="border-b">
              <TableHead className="w-[25%] text-left font-bold text-base">PSA Agent</TableHead>
                <TableHead className="w-[30%] text-left font-bold text-base">Origins</TableHead>
                <TableHead className="w-[30%] text-left font-bold text-base">Destinations</TableHead>
                <TableHead className="w-[15%] text-left font-bold text-base">Actions</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        
        <div className="relative h-[400px] overflow-auto">
          <Table>
            <TableHeader className="sr-only">
              <TableRow>
                <TableHead className="w-[25%]">PSA Agent</TableHead>
                <TableHead className="w-[30%]">Origins</TableHead>
                <TableHead className="w-[30%]">Destinations</TableHead>
                <TableHead className="w-[15%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : preferences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No PSA preferences found. Add your first preference above.
                  </TableCell>
                </TableRow>
              ) : (
                preferences.map((preference) => (
                  <TableRow key={preference.id} className="hover:bg-muted/50">
                    <TableCell className="w-[25%]">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{preference.psaAgentName}</p>
                          <p className="text-xs text-muted-foreground">{preference.psaAgentEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[30%]">
                      <div className="flex flex-wrap gap-1">
                        {preference.origins.map((o) => (
                          <Badge 
                            key={o} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                            onClick={() => handleDeleteCluster(preference.psaAgentEmail, o, 'origin')}
                            title={`Click to delete origin: ${o}`}
                          >
                            {o}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="w-[30%]">
                      <div className="flex flex-wrap gap-1">
                        {preference.destinations.map((d) => (
                          <Badge 
                            key={d} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                            onClick={() => handleDeleteCluster(preference.psaAgentEmail, d, 'destination')}
                            title={`Click to delete destination: ${d}`}
                          >
                            {d}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="w-[15%]">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete preference"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete preference?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the preference for {preference.psaAgentEmail}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePreference(preference.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {preferences.length} of {totalItems} preferences
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage + 1} of {Math.max(1, totalPages)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PSAPreferencesTab;
