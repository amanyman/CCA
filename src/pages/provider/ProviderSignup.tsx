import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail, Lock, AlertCircle, Building2, User, Phone, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  agencyName: string;
  contactName: string;
  phone: string;
}

interface FormErrors {
  [key: string]: string;
}

export function ProviderSignup() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    agencyName: '',
    contactName: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agencyName.trim()) {
      newErrors.agencyName = 'Agency name is required';
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Step 1: Sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already')) {
          setErrors({ submit: 'An account with this email already exists. Please sign in instead.' });
        } else {
          setErrors({ submit: signUpError.message });
        }
        setIsLoading(false);
        return;
      }

      // Step 2: Sign in to get session
      let userId = signUpData?.user?.id;

      if (!signUpData?.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          setErrors({ submit: 'Account created! Please go to the login page to sign in.' });
          setIsLoading(false);
          return;
        }
        userId = signInData?.user?.id;
      }

      if (!userId) {
        setErrors({ submit: 'Account created! Please go to the login page to sign in.' });
        setIsLoading(false);
        return;
      }

      // Step 3: Create provider record
      const { error: providerError } = await supabase.from('providers').insert({
        user_id: userId,
        agency_name: formData.agencyName,
        email: formData.email,
        phone: formData.phone,
        main_contact_name: formData.contactName,
        main_contact_phone: formData.phone,
        main_contact_email: formData.email,
        address: '',
      });

      if (providerError && providerError.code !== '23505') {
        setErrors({ submit: 'Account created but profile setup failed. Please contact support.' });
        setIsLoading(false);
        return;
      }

      // Success!
      setIsLoading(false);
      setIsSuccess(true);
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Account Created!</h1>
            <p className="text-slate-600 mb-6">
              Welcome to California Care Alliance, {formData.contactName}!
            </p>
            <Link
              to="/provider/dashboard"
              className="block w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-950 transition-colors font-semibold text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-4 py-8">
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
            <h1 className="text-2xl font-bold text-slate-800">Create Provider Account</h1>
            <p className="text-slate-600 mt-2">Join our network of insurance partners</p>
          </div>

          {errors.submit && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Agency Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.agencyName}
                  onChange={(e) => handleChange('agencyName', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.agencyName ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Your agency name"
                />
              </div>
              {errors.agencyName && <p className="mt-1 text-sm text-red-500">{errors.agencyName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.contactName ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Your name"
                />
              </div>
              {errors.contactName && <p className="mt-1 text-sm text-red-500">{errors.contactName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.phone ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="(555) 555-5555"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.email ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="you@agency.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.password ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Min. 6 characters"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    errors.confirmPassword ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-950 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/provider/login" className="text-blue-900 hover:text-blue-950 font-semibold">
              Sign in here
            </Link>
          </p>

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
