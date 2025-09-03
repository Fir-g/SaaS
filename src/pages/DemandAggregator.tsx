import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Package, BarChart3 } from 'lucide-react';
import DemandAggregatorHub from '@/components/DemandAggregator/DemandAggregatorHub';
import ODVLSPAnalysis from '@/components/DemandAggregator/ODVLSPAnalysis';
import RootCauseAnalysis from '@/components/DemandAggregator/RootCauseAnalysis';

export default function DemandAggregatorPage() {
  const [activeTab, setActiveTab] = useState('hub');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Demand Aggregator</h1>
        <p className="text-muted-foreground">
          Comprehensive demand analysis and aggregation platform
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="hub" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Demand Aggregator Hub
          </TabsTrigger>
          <TabsTrigger value="odvlsp" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            ODV LSP Analysis
          </TabsTrigger>
          <TabsTrigger value="rca" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Root Cause Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hub" className="space-y-6">
          <DemandAggregatorHub />
        </TabsContent>

        <TabsContent value="odvlsp" className="space-y-6">
          <ODVLSPAnalysis />
        </TabsContent>

        <TabsContent value="rca" className="space-y-6">
          <RootCauseAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}