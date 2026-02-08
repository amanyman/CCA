import { useState, useEffect } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProviderFormData } from '../../types/provider';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface FormErrors {
  [key: string]: string;
}

export function ProfileForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<ProviderFormData>({
    agency_name: '',
    address: '',
    phone: '',
    email: '',
    main_contact_name: '',
    main_contact_phone: '',
    main_contact_email: '',
    secondary_contact_name: '',
    secondary_contact_phone: '',
    secondary_contact_email: '',
  });

  useEffect(() => {
    const fetchProvider = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching provider:', error);
      } else if (data) {
        setFormData({
          agency_name: data.agency_name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          main_contact_name: data.main_contact_name || '',
          main_contact_phone: data.main_contact_phone || '',
          main_contact_email: data.main_contact_email || '',
          secondary_contact_name: data.secondary_contact_name || '',
          secondary_contact_phone: data.secondary_contact_phone || '',
          secondary_contact_email: data.secondary_contact_email || '',
        });
      }

      setIsLoading(false);
    };

    fetchProvider();
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.agency_name.trim()) {
      newErrors.agency_name = 'Agency name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.main_contact_name.trim()) {
      newErrors.main_contact_name = 'Main contact name is required';
    }
    if (!formData.main_contact_phone.trim()) {
      newErrors.main_contact_phone = 'Main contact phone is required';
    } else if (!/^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(formData.main_contact_phone.trim())) {
      newErrors.main_contact_phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.main_contact_email.trim()) {
      newErrors.main_contact_email = 'Main contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.main_contact_email)) {
      newErrors.main_contact_email = 'Please enter a valid email';
    }
    // Validate optional secondary contact fields if provided
    if (formData.secondary_contact_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.secondary_contact_email)) {
      newErrors.secondary_contact_email = 'Please enter a valid email';
    }
    if (formData.secondary_contact_phone.trim() && !/^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(formData.secondary_contact_phone.trim())) {
      newErrors.secondary_contact_phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const { error } = await supabase
        .from('providers')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch {
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ProviderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Agency Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Agency Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Agency Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.agency_name}
              onChange={(e) => handleChange('agency_name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.agency_name ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.agency_name && <p className="mt-1 text-sm text-red-500">{errors.agency_name}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.address ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.phone ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.email ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* Main Contact */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Main Contact</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.main_contact_name}
              onChange={(e) => handleChange('main_contact_name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.main_contact_name ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.main_contact_name && <p className="mt-1 text-sm text-red-500">{errors.main_contact_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.main_contact_phone}
              onChange={(e) => handleChange('main_contact_phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.main_contact_phone ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.main_contact_phone && <p className="mt-1 text-sm text-red-500">{errors.main_contact_phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.main_contact_email}
              onChange={(e) => handleChange('main_contact_email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.main_contact_email ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.main_contact_email && <p className="mt-1 text-sm text-red-500">{errors.main_contact_email}</p>}
          </div>
        </div>
      </div>

      {/* Secondary Contact */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Secondary Contact (Optional)</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.secondary_contact_name}
              onChange={(e) => handleChange('secondary_contact_name', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.secondary_contact_phone}
              onChange={(e) => handleChange('secondary_contact_phone', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.secondary_contact_email}
              onChange={(e) => handleChange('secondary_contact_email', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-600">Profile updated successfully!</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-950 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}
