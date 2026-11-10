/**
 * @file Navbar.jsx
 * @description Clinical-grade navigation bar with logo, nav links,
 *              system health indicator, and language selector.
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaChevronDown, FaSun, FaMoon, FaGlobeAmericas, FaShieldAlt, FaCircle } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import { LANGUAGES, NAV_LINKS } from '../../utils/constants';

export default function Navbar() {
  const { selectedLanguage, setLanguage, theme, setTheme, toggleTheme } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const location = useLocation();

  /** Close mobile menu on route change */
  useEffect(() => {
    setIsOpen(false);
    setIsLangOpen(false);
  }, [location.pathname]);

  /** Close language dropdown on outside click */
  useEffect(() => {
    if (!isLangOpen) return;
    const close = () => setIsLangOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [isLangOpen]);

  const currentLang = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[3];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-700 to-slate-900 flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  Medi<span className="text-teal-600">Lingual</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200/60">
                  Clinical
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Healthcare Multilingual NLP
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'text-teal-800 dark:text-teal-300 bg-white dark:bg-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: Clinical Status & Language selector */}
          <div className="flex items-center gap-3">
            {/* Live Operational Status Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/70 rounded-full text-[11px] font-semibold text-emerald-800">
              <FaCircle className="w-2 h-2 text-emerald-500 animate-pulse" />
              <span>Pipeline Online</span>
            </div>

                        {/* White / Black Theme Toggle Button */}
            <button
              type="button"
              onClick={() => (toggleTheme ? toggleTheme() : setTheme(theme === 'dark' ? 'light' : 'dark'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs hover:shadow-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300 dark:border-slate-700"
              title={theme === 'dark' ? 'Switch to White (Light) Theme' : 'Switch to Black (Dark) Theme'}
            >
              {theme === 'dark' ? (
                <>
                  <FaSun className="text-amber-400 text-sm" />
                  <span className="hidden sm:inline font-bold text-slate-200">Light</span>
                </>
              ) : (
                <>
                  <FaMoon className="text-slate-600 text-sm" />
                  <span className="hidden sm:inline font-bold text-slate-700">Dark</span>
                </>
              )}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLangOpen(!isLangOpen);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 
                           hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
              >
                <FaGlobeAmericas className="w-3.5 h-3.5 text-teal-600" />
                <span>{currentLang.label}</span>
                <FaChevronDown
                  className={`w-2.5 h-2.5 text-slate-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs"
                  >
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                      Select Working Language
                    </div>
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 transition-colors ${
                          selectedLanguage === lang.code
                            ? 'bg-teal-50 text-teal-900 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                        {selectedLanguage === lang.code && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.path
                    ? 'bg-teal-50 text-teal-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
