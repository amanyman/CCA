import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from '../../components/auth/LoginForm';

export function ProviderLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      throw error;
    }
    navigate('/provider/dashboard');
  };

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
