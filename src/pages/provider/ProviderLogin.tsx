import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from '../../components/auth/LoginForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function ProviderLogin() {
  const { signIn, user, userType, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if already logged in - provider to provider dashboard, admin to admin dashboard
  useEffect(() => {
    if (!isLoading && user && userType === 'provider') {
      navigate('/provider/dashboard', { replace: true });
    } else if (!isLoading && user && userType === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, userType, isLoading, navigate]);

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      throw error;
    }
    setIsRedirecting(true);
  };

  // Redirect once auth state updates after login - route to correct dashboard based on role
  useEffect(() => {
    if (isRedirecting && !isLoading && user && userType) {
      if (userType === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/provider/dashboard', { replace: true });
      }
    }
  }, [isRedirecting, isLoading, user, userType, navigate]);

  // Show loading if checking auth or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <LoadingSpinner size="lg" message={isRedirecting ? "Redirecting to dashboard..." : "Loading..."} />
      </div>
    );
  }

  return (
    <LoginForm
      onSubmit={handleLogin}
      title="Provider Portal"
      subtitle="Sign in to manage your referrals"
      signupLink="/provider/signup"
      signupText="Don't have an account?"
    />
  );
}
