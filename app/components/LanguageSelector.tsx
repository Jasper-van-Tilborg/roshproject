'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer"
      >
        <span className="text-white font-medium">{language.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
            <button
              onClick={() => {
                setLanguage('nl');
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                language === 'nl'
                  ? 'bg-purple-500 text-white'
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              Nederlands
            </button>
            <button
              onClick={() => {
                setLanguage('en');
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                language === 'en'
                  ? 'bg-purple-500 text-white'
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              English
            </button>
          </div>
        </>
      )}
    </div>
  );
}

