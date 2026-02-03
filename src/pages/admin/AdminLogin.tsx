import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from '../../components/auth/LoginForm';

export function AdminLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      throw error;
    }
    navigate('/admin/dashboard');
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      title="Admin Portal"
      subtitle="Sign in to manage the platform"
    />
  );
}
