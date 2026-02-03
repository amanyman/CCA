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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />

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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
