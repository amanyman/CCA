import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { ProviderLogin } from './pages/provider/ProviderLogin';
import { ProviderSignup } from './pages/provider/ProviderSignup';
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ProviderProfile } from './pages/provider/ProviderProfile';
import { ProviderReferrals } from './pages/provider/ProviderReferrals';
import { NewReferral } from './pages/provider/NewReferral';
import { ReferralDetailPage } from './pages/provider/ReferralDetailPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AgenciesPage } from './pages/admin/AgenciesPage';
import { AgencyDetailPage } from './pages/admin/AgencyDetailPage';
import { ReferralsPage } from './pages/admin/ReferralsPage';
import { AdminReferralDetailPage } from './pages/admin/ReferralDetailPage';
import { AdminManagementPage } from './pages/admin/AdminManagementPage';
import { AdminNotificationsPage } from './pages/admin/NotificationsPage';
import { ProviderNotificationsPage } from './pages/provider/NotificationsPage';
import { AdminReferralCostsPage } from './pages/admin/ReferralCostsPage';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Provider Auth Routes */}
          <Route path="/provider/login" element={<ProviderLogin />} />
          <Route path="/provider/signup" element={<ProviderSignup />} />

          {/* Protected Provider Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute allowedUserType="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/profile"
            element={
              <ProtectedRoute allowedUserType="provider">
                <ProviderProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/referrals"
            element={
              <ProtectedRoute allowedUserType="provider">
                <ProviderReferrals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/referrals/new"
            element={
              <ProtectedRoute allowedUserType="provider">
                <NewReferral />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/referrals/:id"
            element={
              <ProtectedRoute allowedUserType="provider">
                <ReferralDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/notifications"
            element={
              <ProtectedRoute allowedUserType="provider">
                <ProviderNotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Auth Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedUserType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agencies"
            element={
              <ProtectedRoute allowedUserType="admin">
                <AgenciesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agencies/:id"
            element={
              <ProtectedRoute allowedUserType="admin">
                <AgencyDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/referrals"
            element={
              <ProtectedRoute allowedUserType="admin">
                <ReferralsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/referrals/:id"
            element={
              <ProtectedRoute allowedUserType="admin">
                <AdminReferralDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admin-management"
            element={
              <ProtectedRoute allowedUserType="admin">
                <AdminManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute allowedUserType="admin">
                <AdminNotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/referral-costs"
            element={
              <ProtectedRoute allowedUserType="admin">
                <AdminReferralCostsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
