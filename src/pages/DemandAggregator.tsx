import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Package, BarChart3 } from "lucide-react";
import DemandAggregatorHub from "@/components/DemandAggregator/DemandAggregatorHub";
import ODVLSPAnalysis from "@/components/DemandAggregator/ODVLSPAnalysis";
import RootCauseAnalysis from "@/components/DemandAggregator/RootCauseAnalysis";
import { useLocation, useNavigate } from "react-router-dom";

export default function DemandAggregatorPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive tab from URL path, default to 'hub'
  const pathTab = (() => {
    const parts = location.pathname.split("/").filter(Boolean);
    // expected: [..., 'demand-aggregator', '<tab>']
    const last = parts[parts.length - 1];
    if (last === "odvlsp" || last === "rca" || last === "hub") return last;
    return "hub";
  })();

  const [activeTab, setActiveTab] = useState(pathTab);

  // Keep local state in sync when URL changes (e.g. refresh / direct link)
  useEffect(() => {
    if (pathTab !== activeTab) setActiveTab(pathTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen bg-background overflow-x-hidden justifyContent: center occupyFullWidth">
      {/* Fluid layout: full-width inside dashboard; at smaller sizes keep padding */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-2 lg:py-2 space-y-2 lg:space-y-2">
        {/* Responsive Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v);
            // navigate to the corresponding sub-route so links and refresh work
            navigate(`/demand-aggregator/${v}`, { replace: false });
          }}
          className="w-full space-y-2 lg:space-y-2"
        >
          {/* Tabs navigation with its own horizontal scroll (only when needed) */}
          <div className="w-full max-w-full overflow-x-auto">
            <TabsList
              className="
                inline-flex h-12 lg:h-14 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground
                w-max whitespace-nowrap
              "
            >
              <TabsTrigger
                value="hub"
                className="
                  flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-medium
                  data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                "
              >
                <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline">Demand Aggregator Hub</span>
                <span className="sm:hidden">Hub</span>
              </TabsTrigger>

              <TabsTrigger
                value="odvlsp"
                className="
                  flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-medium
                  data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                "
              >
                <Package className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline">ODV LSP Analysis</span>
                <span className="sm:hidden">ODV LSP</span>
              </TabsTrigger>

              <TabsTrigger
                value="rca"
                className="
                  flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-medium
                  data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                "
              >
                <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline">Root Cause Analysis</span>
                <span className="sm:hidden">RCA</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content with proper responsive spacing */}
          <div className="w-full overflow-x-hidden">
            <TabsContent
              value="hub"
              className="mt-2 lg:mt-4 space-y-2 lg:space-y-4"
            >
              <DemandAggregatorHub />
            </TabsContent>

            <TabsContent
              value="odvlsp"
              className="mt-2 lg:mt-2 space-y-2 lg:space-y-2"
            >
              <ODVLSPAnalysis />
            </TabsContent>

            <TabsContent
              value="rca"
              className="mt-2 lg:mt-2 space-y-2 lg:space-y-2"
            >
              <RootCauseAnalysis />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
