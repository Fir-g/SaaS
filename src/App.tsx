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
import IntegrationsPage from "./pages/Integration";
import WhatsappIntegrationLanding from "./pages/whatsapp-integration";
import ConnectQR from "./pages/whatsapp-integration/connect-qr";
import SelectTeamMembersPage from "./pages/whatsapp-integration/select-members";
import GmailIntegrationPage from "./pages/gmail-integration";
import GoogleSheetsIntegrationPage from "./pages/google-sheets-integration";
import SelectGrouptoRead from "./pages/whatsapp-integration/select-group";
import IntegrationcompletePage from "./pages/whatsapp-integration/integration-complete";
import CRMLoginPage from "./pages/crm-integration/crm-login";
import UploadMasterDataPage from "./pages/crm-integration/upload-master-data";
import CRMSetupCompletePage from "./pages/crm-integration/complete-setup";

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
              <Route
                path="/shipments"
                element={
                  <div className="p-8 text-center text-muted-foreground">
                    Shipments page coming soon...
                  </div>
                }
              />
              <Route
                path="/tracking"
                element={
                  <div className="p-8 text-center text-muted-foreground">
                    Tracking page coming soon...
                  </div>
                }
              />
              <Route
                path="/analytics"
                element={
                  <div className="p-8 text-center text-muted-foreground">
                    Analytics page coming soon...
                  </div>
                }
              />
              <Route
                path="/documents"
                element={
                  <div className="p-8 text-center text-muted-foreground">
                    Documents page coming soon...
                  </div>
                }
              />

              {/* Demand Aggregator: accept sub-routes so page can control per-tab URLs */}
              <Route
                path="/demand-aggregator/*"
                element={<DemandAggregator />}
              />
              <Route
                path="/demand-aggregator/spreadsheet"
                element={<SpreadsheetPage />}
              />

              <Route path="/integrations" element={<IntegrationsPage />} />
              {/* New prefixed integration routes */}
              <Route
                path="/integrations/gmail-integration"
                element={<GmailIntegrationPage />}
              />
              <Route
                path="/integrations/whatsapp-integration"
                element={<WhatsappIntegrationLanding />}
              />
              <Route path="/integrations/whatsapp" element={<ConnectQR />} />
              <Route
                path="/integrations/whatsapp/team-members"
                element={<SelectTeamMembersPage />}
              />
              <Route
                path="/integrations/whatsapp/group"
                element={<SelectGrouptoRead />}
              />
              <Route
                path="/integrations/google-sheets-integration"
                element={<GoogleSheetsIntegrationPage />}
              />
              <Route
                path="/integrations/whatsapp/success"
                element={<IntegrationcompletePage />}
              />
              <Route path="/integrations/crm" element={<CRMLoginPage />} />
              <Route
                path="/integrations/upload-data"
                element={<UploadMasterDataPage />}
              />
              <Route
                path="/integrations/crm-success"
                element={<CRMSetupCompletePage />}
              />

              {/* Redirect old routes to new prefixed routes for backward compatibility */}
              <Route
                path="/gmail-integration"
                element={<Navigate to="/integrations/gmail-integration" replace />}
              />
              <Route
                path="/whatsapp-integration"
                element={<Navigate to="/integrations/whatsapp-integration" replace />}
              />
              <Route
                path="/whatsapp"
                element={<Navigate to="/integrations/whatsapp" replace />}
              />
              <Route
                path="/whatsapp/team-members"
                element={<Navigate to="/integrations/whatsapp/team-members" replace />}
              />
              <Route
                path="/whatsapp/group"
                element={<Navigate to="/integrations/whatsapp/group" replace />}
              />
              <Route
                path="/google-sheets-integration"
                element={<Navigate to="/integrations/google-sheets-integration" replace />}
              />
              <Route
                path="/whatsapp/success"
                element={<Navigate to="/integrations/whatsapp/success" replace />}
              />
              <Route
                path="/crm"
                element={<Navigate to="/integrations/crm" replace />}
              />
              <Route
                path="/upload-data"
                element={<Navigate to="/integrations/upload-data" replace />}
              />
              <Route
                path="/crm-success"
                element={<Navigate to="/integrations/crm-success" replace />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </SignedIn>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
