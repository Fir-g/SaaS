import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import Inventory from "./pages/Inventory";
import Demands from "./pages/Demands";
import CustomerSupply from "./pages/CustomerSupply";
import NewOnboarding from "./pages/NewOnboarding";
import SpreadsheetPage from "./pages/spreadsheet";
import DemandAggregator from "./pages/DemandAggregator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SignedOut>
          <AuthPage />
        </SignedOut>
        <SignedIn>
          <DashboardLayout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/team" element={<Team />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/demands" element={<Demands />} />
              <Route path="/customer-supply" element={<CustomerSupply />} />
              <Route path="/onboarding/new" element={<NewOnboarding />} />
              <Route path="/shipments" element={<div className="p-8 text-center text-muted-foreground">Shipments page coming soon...</div>} />
              <Route path="/tracking" element={<div className="p-8 text-center text-muted-foreground">Tracking page coming soon...</div>} />
              <Route path="/analytics" element={<div className="p-8 text-center text-muted-foreground">Analytics page coming soon...</div>} />
              <Route path="/documents" element={<div className="p-8 text-center text-muted-foreground">Documents page coming soon...</div>} />
              <Route path="/demand-aggregator" element={<DemandAggregator />} />
              <Route path="/demand-aggregator" element={<div className="p-8 text-center text-muted-foreground">Demand-aggregator page coming soon...</div>} />
              <Route path="/demand-aggregator/spreadsheet" element={<SpreadsheetPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </SignedIn>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
