import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const Index = lazy(() => import('./pages/Index'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workspace = lazy(() => import('./pages/Workspace'));
const SplitManagerPage = lazy(() => import('./pages/SplitManagerPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner text="Loading..." />
          </div>
        }>
          <Routes>
            <Route path={ROUTES.HOME} element={<Index />} />
            <Route path={ROUTES.AUTH} element={<Auth />} />
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            {/* Workspace sectioned routes */}
            <Route path={ROUTES.WORKSPACE} element={<Workspace />} />
            {/* Redirect /workspace/:projectId to files section */}
            <Route path={`${ROUTES.WORKSPACE}/:projectId`} element={<Navigate to={ROUTES.WORKSPACE_FILES + '/:projectId'} replace />} />
            <Route path={`${ROUTES.WORKSPACE_FILES}/:projectId`} element={<Workspace />} />
            <Route path={`${ROUTES.WORKSPACE_DATA}/:projectId`} element={<Workspace />} />
            <Route path={`${ROUTES.WORKSPACE_CHAT}/:projectId`} element={<Workspace />} />
            <Route path={`/workspace/files/:projectId/splitmanager`} element={<SplitManagerPage />} />
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
            <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;