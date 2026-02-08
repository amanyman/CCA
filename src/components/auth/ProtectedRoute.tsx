import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { UserType } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserType: UserType;
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedUserType, redirectTo }: ProtectedRouteProps) {
  const { user, userType, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    const loginPath = allowedUserType === 'admin' ? '/admin/login' : '/provider/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // User exists but userType is still being determined - show loading
  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  // Wrong user type - redirect to correct dashboard
  if (userType !== allowedUserType) {
    const fallbackPath = redirectTo || (userType === 'admin' ? '/admin/dashboard' : '/provider/dashboard');
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
