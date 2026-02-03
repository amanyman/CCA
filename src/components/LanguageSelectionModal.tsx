import { useEffect, useState } from 'react';

interface LanguageSelectionModalProps {
  onSelectLanguage: (language: 'en' | 'es') => void;
}

export function LanguageSelectionModal({ onSelectLanguage }: LanguageSelectionModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSelectedLanguage = localStorage.getItem('language-selected');
    if (!hasSelectedLanguage) {
      setIsOpen(true);
    }
  }, []);

  const handleLanguageSelect = (language: 'en' | 'es') => {
    localStorage.setItem('language-selected', 'true');
    setIsOpen(false);
    onSelectLanguage(language);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full mx-4 transform transition-all">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <img
              src="/california-care-alliance-logo-clean.png"
              alt="California Care Alliance"
              className="h-20 w-auto"
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            Welcome / Bienvenido
          </h2>
          <p className="text-slate-600">
            Please select your preferred language
            <br />
            Por favor seleccione su idioma preferido
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLanguageSelect('en')}
            className="w-full bg-blue-900 text-white px-8 py-5 rounded-xl hover:bg-blue-950 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Continue in English
          </button>
          <button
            onClick={() => handleLanguageSelect('es')}
            className="w-full bg-rose-700 text-white px-8 py-5 rounded-xl hover:bg-rose-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Continuar en Español
          </button>
        </div>
      </div>
    </div>
  );
}
