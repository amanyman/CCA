import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ReferralFormData, AtFaultStatus } from '../../types/referral';

interface FormErrors {
  [key: string]: string;
}

export function ReferralForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<ReferralFormData>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    accident_date: '',
    people_involved: '',
    at_fault_status: null,
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }
    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Customer phone is required';
    } else if (!/^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(formData.customer_phone.trim())) {
      newErrors.customer_phone = 'Please enter a valid 10-digit phone number';
    }
    if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Please enter a valid email';
    }
    if (formData.people_involved && isNaN(parseInt(formData.people_involved))) {
      newErrors.people_involved = 'Please enter a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setIsSubmitting(true);

    try {
      // First get the provider ID
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (providerError || !providerData) {
        throw new Error('Could not find provider');
      }

      const { error } = await supabase.from('referrals').insert({
        provider_id: providerData.id,
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_email: formData.customer_email.trim() || null,
        accident_date: formData.accident_date || null,
        people_involved: formData.people_involved ? parseInt(formData.people_involved) : null,
        at_fault_status: formData.at_fault_status,
        status: 'pending',
      });

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/provider/referrals');
      }, 1500);
    } catch {
      setErrors({ submit: 'Failed to create referral. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ReferralFormData, value: string | AtFaultStatus) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Referral Submitted!</h3>
        <p className="text-slate-600">Redirecting to your referrals...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Customer Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => handleChange('customer_name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.customer_name ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Enter customer's full name"
            />
            {errors.customer_name && <p className="mt-1 text-sm text-red-500">{errors.customer_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => handleChange('customer_phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.customer_phone ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="(555) 555-5555"
            />
            {errors.customer_phone && <p className="mt-1 text-sm text-red-500">{errors.customer_phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.customer_email}
              onChange={(e) => handleChange('customer_email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.customer_email ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="customer@email.com"
            />
            {errors.customer_email && <p className="mt-1 text-sm text-red-500">{errors.customer_email}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Accident Details (Optional)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date of Accident
            </label>
            <input
              type="date"
              value={formData.accident_date}
              onChange={(e) => handleChange('accident_date', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of People Involved
            </label>
            <input
              type="number"
              min="1"
              value={formData.people_involved}
              onChange={(e) => handleChange('people_involved', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.people_involved ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Enter number"
            />
            {errors.people_involved && <p className="mt-1 text-sm text-red-500">{errors.people_involved}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              At-Fault Status
            </label>
            <div className="flex flex-wrap gap-4">
              {[
                { value: 'not_at_fault', label: 'Not At Fault' },
                { value: 'at_fault', label: 'At Fault' },
                { value: 'unknown', label: 'Unknown' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="at_fault_status"
                    value={option.value}
                    checked={formData.at_fault_status === option.value}
                    onChange={(e) => handleChange('at_fault_status', e.target.value as AtFaultStatus)}
                    className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => navigate('/provider/referrals')}
          className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-950 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Referral'
          )}
        </button>
      </div>
    </form>
  );
}
