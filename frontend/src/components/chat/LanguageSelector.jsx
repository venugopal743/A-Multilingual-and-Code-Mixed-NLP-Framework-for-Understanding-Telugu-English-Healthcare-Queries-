import React from 'react';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';
import { LANGUAGES } from '../../utils/constants';

export default function LanguageSelector({ selectedLanguage, onSelectLanguage }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLang = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <FaGlobe className="text-teal-600" />
        <span>{currentLang.flag} {currentLang.label}</span>
        <FaChevronDown className="text-slate-400 text-xs" />
      </button>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1 divide-y divide-slate-100"
          onMouseLeave={() => setIsOpen(false)}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onSelectLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between hover:bg-teal-50 hover:text-teal-700 transition-colors ${
                selectedLanguage === lang.code ? 'bg-teal-50/70 text-teal-700 font-semibold' : 'text-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
              <span className="text-xs text-slate-400 font-normal">{lang.nativeLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
