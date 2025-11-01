"use client";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FiGlobe, FiChevronDown } from "react-icons/fi";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", name: "English", native: "EN" },
    { code: "am", name: "Amharic", native: "አማ" },
    { code: "om", name: "Afan Oromo", native: "OM" },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      {/* Compact Language Selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-sm hover:cursor-pointer"
      >
        <FiGlobe className="w-3 h-3 text-gray-600" />
        <span className="font-medium text-gray-700">
          {currentLanguage.native}
        </span>
        <FiChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Compact Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-fade-in">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 ${
                i18n.language === language.code 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700'
              }`}
            >
              {language.native}
            </button>
          ))}
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}