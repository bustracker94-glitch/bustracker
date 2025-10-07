import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const handleLangChange = (lang: string) => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      >
        <Globe className="h-4 w-4" />
  <span>{language}</span>
      </button>
      {isLangMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
          <div className="py-1">
            <a
              href="#"
              onClick={() => handleLangChange('English')}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              English
            </a>
            <a
              href="#"
              onClick={() => handleLangChange('Tamil')}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Tamil
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
