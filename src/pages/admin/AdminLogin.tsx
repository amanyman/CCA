import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from '../../components/auth/LoginForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AdminLogin() {
  const { signIn, user, userType, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!isLoading && user && userType === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, userType, isLoading, navigate]);

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      throw error;
    }
    navigate('/admin/dashboard', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <LoadingSpinner size="lg" message="Loading..." />
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
