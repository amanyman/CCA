import { useState } from 'react';
import { CheckCircle, Loader2, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferredContactMethod: string;
  helpType: string;
  whatHappened: string;
  incidentDate: string;
  anyPassengers: boolean | null;
  referredBy: string;
  consentGiven: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const CONTACT_METHODS = ['Phone', 'Email', 'Text'];
const HELP_TYPES = ['Legal Representation', 'Auto Repair', 'Both'];

export function SupportRequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferredContactMethod: '',
    helpType: '',
    whatHappened: '',
    incidentDate: '',
    anyPassengers: null,
    referredBy: '',
    consentGiven: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Zip code is required';
    } else if (!/^\d{5}$/.test(formData.address)) {
      newErrors.address = 'Please enter a valid 5-digit zip code';
    }
    if (!formData.preferredContactMethod) {
      newErrors.preferredContactMethod = 'Please select a contact method';
    }
    if (!formData.helpType) {
      newErrors.helpType = 'Please select the type of help needed';
    }
    if (!formData.whatHappened.trim()) {
      newErrors.whatHappened = 'Please describe what happened';
    }
    if (!formData.incidentDate) {
      newErrors.incidentDate = 'Please enter the incident date';
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.incidentDate)) {
      newErrors.incidentDate = 'Please use MM/DD/YYYY format';
    } else {
      const [month, day, year] = formData.incidentDate.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      if (date.getMonth() !== month - 1 || date.getDate() !== day || date.getFullYear() !== year) {
        newErrors.incidentDate = 'Please enter a valid date';
      } else if (date > new Date()) {
        newErrors.incidentDate = 'Date cannot be in the future';
      }
    }
    if (formData.anyPassengers === null) {
      newErrors.anyPassengers = 'Please select yes or no';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const [month, day, year] = formData.incidentDate.split('/');
      const formattedDate = `${year}-${month}-${day}`;

      const { error } = await supabase.from('support_requests').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        preferred_contact_method: formData.preferredContactMethod,
        help_type: formData.helpType,
        what_happened: formData.whatHappened,
        incident_date: formattedDate,
        any_passengers: formData.anyPassengers,
        referred_by: formData.referredBy || null,
        consent_given: formData.consentGiven
      });

      if (error) throw error;

      try {
        const emailApiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-support-email`;
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

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-blue-900" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{t('success_title')}</h3>
        <p className="text-slate-600">
          {t('support_success')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 overflow-x-hidden" style={{ minWidth: 0 }}>
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t('full_name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={e => {
            setFormData(prev => ({ ...prev, name: e.target.value }));
            if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.name ? 'border-red-300' : 'border-slate-300'}`}
          placeholder={t('full_name_placeholder')}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {language === 'es' ? 'Código Postal' : 'Zip Code'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={e => {
            const value = e.target.value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, address: value }));
            if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
          }}
          maxLength={5}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.address ? 'border-red-300' : 'border-slate-300'}`}
          placeholder={language === 'es' ? 'Ingrese código postal' : 'Enter zip code'}
        />
        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          {t('preferred_contact')} <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-4">
          {CONTACT_METHODS.map(method => (
            <label key={method} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contactMethod"
                value={method}
                checked={formData.preferredContactMethod === method}
                onChange={e => {
                  setFormData(prev => ({ ...prev, preferredContactMethod: e.target.value }));
                  if (errors.preferredContactMethod) setErrors(prev => ({ ...prev, preferredContactMethod: '' }));
                }}
                className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-700">{t(`contact_${method.toLowerCase()}`)}</span>
            </label>
          ))}
        </div>
        {errors.preferredContactMethod && <p className="mt-1 text-sm text-red-500">{errors.preferredContactMethod}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          {t('help_type')} <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-4">
          {HELP_TYPES.map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="helpType"
                value={type}
                checked={formData.helpType === type}
                onChange={e => {
                  setFormData(prev => ({ ...prev, helpType: e.target.value }));
                  if (errors.helpType) setErrors(prev => ({ ...prev, helpType: '' }));
                }}
                className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-700">{type}</span>
            </label>
          ))}
        </div>
        {errors.helpType && <p className="mt-1 text-sm text-red-500">{errors.helpType}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t('what_happened')} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.whatHappened}
          onChange={e => {
            setFormData(prev => ({ ...prev, whatHappened: e.target.value }));
            if (errors.whatHappened) setErrors(prev => ({ ...prev, whatHappened: '' }));
          }}
          rows={3}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none ${errors.whatHappened ? 'border-red-300' : 'border-slate-300'}`}
          placeholder={t('what_happened_placeholder')}
        />
        {errors.whatHappened && <p className="mt-1 text-sm text-red-500">{errors.whatHappened}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t('incident_date')} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.incidentDate}
            onChange={e => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
              }
              if (value.length >= 5) {
                value = value.slice(0, 5) + '/' + value.slice(5, 9);
              }
              setFormData(prev => ({ ...prev, incidentDate: value }));
              if (errors.incidentDate) setErrors(prev => ({ ...prev, incidentDate: '' }));
            }}
            maxLength={10}
            className={`w-full pl-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.incidentDate ? 'border-red-300' : 'border-slate-300'}`}
            placeholder="MM/DD/YYYY"
          />
          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
        {errors.incidentDate && <p className="mt-1 text-sm text-red-500">{errors.incidentDate}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          {t('any_passengers')} <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="anyPassengers"
              value="yes"
              checked={formData.anyPassengers === true}
              onChange={() => {
                setFormData(prev => ({ ...prev, anyPassengers: true }));
                if (errors.anyPassengers) setErrors(prev => ({ ...prev, anyPassengers: '' }));
              }}
              className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-blue-500"
            />
            <span className="text-slate-700">{t('yes')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="anyPassengers"
              value="no"
              checked={formData.anyPassengers === false}
              onChange={() => {
                setFormData(prev => ({ ...prev, anyPassengers: false }));
                if (errors.anyPassengers) setErrors(prev => ({ ...prev, anyPassengers: '' }));
              }}
              className="w-4 h-4 text-blue-900 border-slate-300 focus:ring-blue-500"
            />
            <span className="text-slate-700">{t('no')}</span>
          </label>
        </div>
        {errors.anyPassengers && <p className="mt-1 text-sm text-red-500">{errors.anyPassengers}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {t('who_referred')}
        </label>
        <input
          type="text"
          value={formData.referredBy}
          onChange={e => {
            setFormData(prev => ({ ...prev, referredBy: e.target.value }));
          }}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder={t('who_referred_placeholder')}
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
