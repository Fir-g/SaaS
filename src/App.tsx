import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Settings from "./pages/settings";
import LoadSyncPage from "./pages/onboarding-flow/load-sync";
import Onboarding from "./pages/auth/loginPage";
import LoadPublisherPage from "./pages/onboarding-flow/load-publisher";
import ConnectQR from "./pages/whatsapp-integration/connect-qr";
import SelectTeamMembersPage from "./pages/whatsapp-integration/select-members";
import SelectGrouptoRead from "./pages/whatsapp-integration/select-group";
import IntegrationcompletePage from "./pages/whatsapp-integration/integration-complete";
import ErrorPage from "./pages/common/error";
import DemandIntegrationPage from "./pages/onboarding-flow/demand-integration";
import CRMLoginPage from "./pages/crm-integration/crm-login";
import UploadMasterDataPage from "./pages/crm-integration/upload-master-data";
import CRMSetupCompletePage from "./pages/crm-integration/complete-setup";
import DashboardPage from "./pages/dashboard";
import IntegrationsPage from "./pages/integrations/index";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import ManageTeamPage from "./pages/user/manage-team";
import { ProtectedRoute } from "./components/layout/auth/protected-route";
import DemandSupplyPage from "./pages/onboarding-flow/demand-and-supply";
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/load-sync" element={<LoadSyncPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/load-publisher" element={<LoadPublisherPage />} />

        <Route
          path="/whatsapp"
          element={
            <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
              <ConnectQR />
            </ProtectedRoute>
          }
        />

        <Route
          path="/whatsapp/team-members"
          element={<SelectTeamMembersPage />}
        />
        <Route path="/whatsapp/group" element={<SelectGrouptoRead />} />
        <Route path="/whatsapp/success" element={<IntegrationcompletePage />} />
        <Route path="/demand-integration" element={<DemandIntegrationPage />} />
        <Route path="/crm" element={<CRMLoginPage />} />
        <Route path="/upload-data" element={<UploadMasterDataPage />} />
        <Route path="/crm-success" element={<CRMSetupCompletePage />} />
        <Route path="/demand-supply" element={<DemandSupplyPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/manage-team" element={<ManageTeamPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}
