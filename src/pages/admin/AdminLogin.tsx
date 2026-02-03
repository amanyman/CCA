import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from '../../components/auth/LoginForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AdminLogin() {
  const { signIn, user, userType, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!isLoading && user && userType === 'admin') {
      window.location.href = '/admin/dashboard';
    }
  }, [user, userType, isLoading]);

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      throw error;
    }
    // Set redirecting state and use window.location for clean navigation
    setIsRedirecting(true);
    setTimeout(() => {
      window.location.href = '/admin/dashboard';
    }, 500);
  };

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
      title="Admin Portal"
      subtitle="Sign in to manage the platform"
    />
  );
}
