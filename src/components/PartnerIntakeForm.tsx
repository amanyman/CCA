import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface FormData {
  partnerType: string;
  agencyName: string;
  contactName: string;
  phone: string;
  email: string;
  insuranceProducts: string[];
  otherProducts: string;
  customerRange: string;
  referredBy: string;
  website: string;
  consentGiven: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const INSURANCE_PRODUCTS = [
  'Auto',
  'Home',
  'Commercial',
  'Life',
  'Health',
  'Workers\' Comp',
  'Other'
];

const CUSTOMER_RANGES = [
  '0-100',
  '101-500',
  '501-2,000',
  '2,001-10,000',
  '10,000+'
];

export function PartnerIntakeForm({ onSuccess }: { onSuccess?: () => void }) {
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    partnerType: '',
    agencyName: '',
    contactName: '',
    phone: '',
    email: '',
    insuranceProducts: [],
    otherProducts: '',
    customerRange: '',
    referredBy: '',
    website: '',
    consentGiven: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.partnerType) {
      newErrors.partnerType = 'Please select a partner type';
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
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.insuranceProducts.length === 0) {
      newErrors.insuranceProducts = 'Please select at least one product';
    }
    if (formData.insuranceProducts.includes('Other') && !formData.otherProducts.trim()) {
      newErrors.otherProducts = 'Please specify other products';
    }
    if (!formData.customerRange) {
      newErrors.customerRange = 'Please select a customer range';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('partner_submissions').insert({
        partner_type: formData.partnerType,
        agency_name: formData.agencyName,
        contact_name: formData.contactName,
        phone: formData.phone,
        email: formData.email,
        insurance_products: formData.insuranceProducts,
        other_products: formData.otherProducts || null,
        customer_range: formData.customerRange,
        referred_by: formData.referredBy || null,
        website: formData.website || null,
        consent_given: formData.consentGiven
      });

      if (error) throw error;

      try {
        const emailApiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-partner-email`;
        const response = await fetch(emailApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          console.error('Failed to send email notification');
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }

      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      console.error('Error submitting form:', err);
      setErrors({ submit: t('error_message') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductChange = (product: string) => {
    setFormData(prev => ({
      ...prev,
      insuranceProducts: prev.insuranceProducts.includes(product)
        ? prev.insuranceProducts.filter(p => p !== product)
        : [...prev.insuranceProducts, product]
    }));
    if (errors.insuranceProducts) {
      setErrors(prev => ({ ...prev, insuranceProducts: '' }));
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-blue-900" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{t('success_title')}</h3>
        <p className="text-slate-600">
          {t('partner_success')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" style={{ minWidth: 0 }}>
      <div className="flex items-center justify-center gap-3 pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${language === 'en' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          {t('language_english')}
        </button>
        <button
          type="button"
          onClick={() => setLanguage('es')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${language === 'es' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          {t('language_spanish')}
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          {t('partner_type')} <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-4">
          {['Broker', 'Agency'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="partnerType"
                value={type}
                checked={formData.partnerType === type}
                onChange={e => {
                  setFormData(prev => ({ ...prev, partnerType: e.target.value }));
                  if (errors.partnerType) setErrors(prev => ({ ...prev, partnerType: '' }));
                }}
                className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-700">{type}</span>
            </label>
          ))}
        </div>
        {errors.partnerType && <p className="mt-1 text-sm text-red-500">{errors.partnerType}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t('agency_name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.agencyName}
          onChange={e => {
            setFormData(prev => ({ ...prev, agencyName: e.target.value }));
            if (errors.agencyName) setErrors(prev => ({ ...prev, agencyName: '' }));
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.agencyName ? 'border-red-300' : 'border-slate-300'}`}
          placeholder={t('agency_name_placeholder')}
        />
        {errors.agencyName && <p className="mt-1 text-sm text-red-500">{errors.agencyName}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t('contact_name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.contactName}
          onChange={e => {
            setFormData(prev => ({ ...prev, contactName: e.target.value }));
            if (errors.contactName) setErrors(prev => ({ ...prev, contactName: '' }));
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.contactName ? 'border-red-300' : 'border-slate-300'}`}
          placeholder={t('contact_name_placeholder')}
        />
        {errors.contactName && <p className="mt-1 text-sm text-red-500">{errors.contactName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t('phone')} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => {
              setFormData(prev => ({ ...prev, phone: e.target.value }));
              if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.phone ? 'border-red-300' : 'border-slate-300'}`}
            placeholder={t('phone_placeholder')}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t('email')} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={e => {
              setFormData(prev => ({ ...prev, email: e.target.value }));
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.email ? 'border-red-300' : 'border-slate-300'}`}
            placeholder={t('email_placeholder')}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t('website')}
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder={t('website_placeholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          {t('insurance_products')} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {INSURANCE_PRODUCTS.map(product => (
            <label key={product} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.insuranceProducts.includes(product)}
                onChange={() => handleProductChange(product)}
                className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-slate-700 text-sm">{product}</span>
            </label>
          ))}
        </div>
        {errors.insuranceProducts && <p className="mt-1 text-sm text-red-500">{errors.insuranceProducts}</p>}
      </div>

      {formData.insuranceProducts.includes('Other') && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t('other_products')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.otherProducts}
            onChange={e => {
              setFormData(prev => ({ ...prev, otherProducts: e.target.value }));
              if (errors.otherProducts) setErrors(prev => ({ ...prev, otherProducts: '' }));
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.otherProducts ? 'border-red-300' : 'border-slate-300'}`}
            placeholder={t('other_products_placeholder')}
          />
          {errors.otherProducts && <p className="mt-1 text-sm text-red-500">{errors.otherProducts}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t('customer_range')} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.customerRange}
          onChange={e => {
            setFormData(prev => ({ ...prev, customerRange: e.target.value }));
            if (errors.customerRange) setErrors(prev => ({ ...prev, customerRange: '' }));
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.customerRange ? 'border-red-300' : 'border-slate-300'}`}
        >
          <option value="">{t('customer_range_placeholder')}</option>
          {CUSTOMER_RANGES.map(range => (
            <option key={range} value={range}>{range}</option>
          ))}
        </select>
        {errors.customerRange && <p className="mt-1 text-sm text-red-500">{errors.customerRange}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t('referred_by')}
        </label>
        <input
          type="text"
          value={formData.referredBy}
          onChange={e => setFormData(prev => ({ ...prev, referredBy: e.target.value }))}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder={t('referred_by_placeholder')}
        />
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-950 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </button>
    </form>
  );
}
