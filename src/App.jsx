import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Shell from './components/layout/Shell';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Campaigns from './pages/Campaigns';
import CampaignNew from './pages/CampaignNew';
import CampaignDetail from './pages/CampaignDetail';
import AIStudio from './pages/AIStudio';
import Analytics from './pages/Analytics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public landing page — no Shell */}
          <Route path="/" element={<Landing />} />

          {/* App Shell — pathless layout route, wraps all app pages */}
          {/* Dashboard moves to /dashboard; all other routes stay the same */}
          <Route element={<Shell />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/new" element={<CampaignNew />} />
            <Route path="campaigns/:id" element={<CampaignDetail />} />
            <Route path="ai" element={<AIStudio />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1C1C1C',
            color: '#FFFFFF',
            border: '1px solid #333333',
            borderRadius: '10px',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#1C1C1C' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#1C1C1C' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
