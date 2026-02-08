import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { isRateLimited } from '../../lib/validation';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  title: string;
  subtitle?: string;
  signupLink?: string;
  signupText?: string;
}

export function LoginForm({ onSubmit, title, subtitle, signupLink, signupText }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Rate limit: max 10 login attempts per 15 minutes
    if (isRateLimited('login', 10, 15 * 60 * 1000)) {
      setError('Too many login attempts. Please wait a few minutes and try again.');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(email, password);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <img
                src="/california-care-alliance-logo-clean.png"
                alt="California Care Alliance"
                className="h-12 w-auto mx-auto"
              />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            {subtitle && <p className="text-slate-600 mt-2">{subtitle}</p>}
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-950 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center mt-3">
              <Link to="/forgot-password" className="text-sm text-blue-900 hover:text-blue-950 font-medium">
                Forgot your password?
              </Link>
            </div>
          </form>

          {signupLink && signupText && (
            <p className="mt-6 text-center text-sm text-slate-600">
              {signupText}{' '}
              <Link to={signupLink} className="text-blue-900 hover:text-blue-950 font-semibold">
                Sign up here
              </Link>
            </p>
          )}

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
