/**
 * @file Navbar.jsx
 * @description Professional responsive navigation bar with logo, nav links,
 *              language selector, and mobile hamburger menu.
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaChevronDown, FaGlobeAmericas } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import { LANGUAGES, NAV_LINKS } from '../../utils/constants';

export default function Navbar() {
  const { selectedLanguage, setLanguage } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  /** Track scroll position for navbar background change */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
                </svg>
              </div>
            </div>
            <div>
              <span className="text-lg font-display font-bold text-slate-900">
                Medi<span className="text-primary-500">Lingual</span>
              </span>
              <span className="text-lg font-display font-bold text-teal-500 ml-0.5">AI</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side: Language selector + Mobile toggle */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLangOpen(!isLangOpen);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 
                           hover:text-slate-900 bg-slate-100/60 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FaGlobeAmericas className="w-3.5 h-3.5 text-primary-500" />
                <span className="hidden sm:inline">{currentLang.flag} {currentLang.label}</span>
                <span className="sm:hidden">{currentLang.flag}</span>
                <FaChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200/80 py-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          selectedLanguage === lang.code
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div className="text-left">
                          <div className="font-medium">{lang.label}</div>
                          <div className="text-xs text-slate-400">{lang.nativeLabel}</div>
                        </div>
                        {selectedLanguage === lang.code && (
                          <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-b border-slate-200"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
