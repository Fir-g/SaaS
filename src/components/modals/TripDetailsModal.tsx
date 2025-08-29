import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface InventoryItem {
  id: string;
  tripId: string;
  fleetOwner: string;
  vehicleNo: string;
  vehicleType: string;
  originCluster: string;
  destinationCluster: string;
  foNumber: string;
}

interface TripLocationDetails {
  tripId: string;
  vehicleNumber: string;
  truckType: string;
  originCluster: string;
  destinationCluster: string;
  currentState?: string;
  currentRegion?: string;
  foName: string;
  foNumber: string;
  availabilityDate?: number;
  tripShareUrl?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

// Mock API service for demo
const mockApiService = {
  fetchTripLocationDetails: async (tripId: string): Promise<TripLocationDetails> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      tripId,
      vehicleNumber: 'MH12AB1234',
      truckType: 'Truck 32FT SXL',
      originCluster: 'Mumbai Zone',
      destinationCluster: 'Delhi Zone',
      currentState: 'Maharashtra',
      currentRegion: 'Pune',
      foName: 'ABC Transport',
      foNumber: '+91-9876543210',
      availabilityDate: Date.now() - 300000, // 5 minutes ago
      tripShareUrl: 'https://track.example.com/trip/123'
    };
  }
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start justify-between py-3">
    <span className="text-sm text-muted-foreground whitespace-nowrap">{label}</span>
    <span className="text-sm font-medium text-right break-words max-w-[60%]">
      {value || <span className="text-muted-foreground">N/A</span>}
    </span>
  </div>
);

export const TripDetailsModal: React.FC<Props> = ({ open, onClose, item }) => {
  const [details, setDetails] = useState<TripLocationDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && item?.tripId) {
      const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        setDetails(null);
        try {
          const data = await mockApiService.fetchTripLocationDetails(item.tripId);
          setDetails(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [open, item]);

  const formatTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="mt-4 text-muted-foreground">Fetching latest trip data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Unable to Fetch Details</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      );
    }

    const data = details || item;
    const currentLocation = details ? 
      `${details.currentState || 'N/A'}, ${details.currentRegion || 'N/A'}` 
      : '...';

    return (
      <div className="space-y-0 divide-y divide-border">
        <DetailRow label="Trip ID" value={data?.tripId} />
        <DetailRow label="Vehicle Number" value={details?.vehicleNumber || item?.vehicleNo} />
        <DetailRow label="Vehicle Type" value={details?.truckType || item?.vehicleType} />
        <DetailRow label="Origin Cluster" value={details?.originCluster || item?.originCluster} />
        <DetailRow label="Destination Cluster" value={details?.destinationCluster || item?.destinationCluster} />
        <DetailRow label="Current Location" value={currentLocation} />
        <DetailRow label="Fleet Owner" value={details?.foName || item?.fleetOwner} />
        <DetailRow label="FO Number" value={details?.foNumber || item?.foNumber} />
        {/* <DetailRow label="Last Refreshed" value={formatTimestamp(details?.availabilityDate)} /> */}
      </div>
    );
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Live Trip Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {renderContent()}

          {details?.tripShareUrl && (
            <>
              <Separator />
              <Button 
                asChild 
                className="w-full"
                size="lg"
              >
                <a
                  href={details.tripShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  Live Track Vehicle
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};