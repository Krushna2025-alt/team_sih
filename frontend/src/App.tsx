import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerListings from './pages/farmer/FarmerListings';
import FarmerListingNew from './pages/farmer/FarmerListingNew';
import FarmerListingVoice from './pages/farmer/FarmerListingVoice';
import FarmerListingDetail from './pages/farmer/FarmerListingDetail';
import FarmerOrders from './pages/farmer/FarmerOrders';
import FarmerEarnings from './pages/farmer/FarmerEarnings';
import FarmerDemands from './pages/farmer/FarmerDemands';
import FarmerBulkDeals from './pages/farmer/FarmerBulkDeals';
import MonthlyDiscussion from './pages/shared/MonthlyDiscussion';

import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerProducts from './pages/buyer/BuyerProducts';
import BuyerCart from './pages/buyer/BuyerCart';
import BuyerOrders from './pages/buyer/BuyerOrders';
import BuyerDemands from './pages/buyer/BuyerDemands';
import BuyerProcurement from './pages/buyer/BuyerProcurement';
import BuyerBulkDeals from './pages/buyer/BuyerBulkDeals';
import BuyerProductDetail from './pages/buyer/BuyerProductDetail';
import VerificationReportView from './pages/VerificationReportView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route element={<ProtectedRoute role="farmer" />}>
                      <Route path="/farmer/profile" element={<ProfilePage />} />
                      <Route path="/farmer/notifications" element={<NotificationsPage />} />
                      
                      <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
                      <Route path="/farmer/listings" element={<FarmerListings />} />
                      <Route path="/farmer/listings/new" element={<FarmerListingNew />} />
                      <Route path="/farmer/listings/voice" element={<FarmerListingVoice />} />
                      <Route path="/farmer/listings/:id" element={<FarmerListingDetail />} />
                      <Route path="/farmer/orders" element={<FarmerOrders />} />
                      <Route path="/farmer/earnings" element={<FarmerEarnings />} />
                      <Route path="/farmer/demands" element={<FarmerDemands />} />
                      <Route path="/farmer/bulk-deals" element={<FarmerBulkDeals />} />
                      <Route path="/farmer/monthly-discussion" element={<MonthlyDiscussion />} />
                    </Route>

                    <Route element={<ProtectedRoute role="buyer" />}>
                      <Route path="/buyer/profile" element={<ProfilePage />} />
                      <Route path="/buyer/notifications" element={<NotificationsPage />} />
                      
                      <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                      <Route path="/buyer/products" element={<BuyerProducts />} />
                      <Route path="/buyer/products/:id" element={<BuyerProductDetail />} />
                      <Route path="/buyer/cart" element={<BuyerCart />} />
                      <Route path="/buyer/orders" element={<BuyerOrders />} />
                      <Route path="/buyer/demands" element={<BuyerDemands />} />
                      <Route path="/buyer/procurement" element={<BuyerProcurement />} />
                      <Route path="/buyer/bulk-deals" element={<BuyerBulkDeals />} />
                    </Route>
                  </Route>
                </Route>

                {/* Public or shared verification view */}
                <Route path="/verifications/:id" element={<VerificationReportView />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
