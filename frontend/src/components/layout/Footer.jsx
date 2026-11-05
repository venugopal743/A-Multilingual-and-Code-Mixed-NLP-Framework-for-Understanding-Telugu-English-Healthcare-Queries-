/**
 * @file Footer.jsx
 * @description Application footer with project info, tech stack, and social links.
 */

import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaEnvelope, FaHeart } from 'react-icons/fa';
import { SiReact, SiTailwindcss, SiPython, SiPytorch } from 'react-icons/si';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'AI Assistant', to: '/chat' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'About', to: '/about' },
    ],
  },
  {
    title: 'Technology',
    links: [
      { label: 'NLP Pipeline', to: '/about' },
      { label: 'RAG System', to: '/about' },
      { label: 'Voice I/O', to: '/about' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/about' },
      { label: 'API Reference', to: '/about' },
      { label: 'Research Paper', to: '/about' },
    ],
  },
];

const techIcons = [
  { Icon: SiReact, label: 'React', color: '#61DAFB' },
  { Icon: SiTailwindcss, label: 'Tailwind', color: '#06B6D4' },
  { Icon: SiPython, label: 'Python', color: '#3776AB' },
  { Icon: SiPytorch, label: 'PyTorch', color: '#EE4C2C' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
                </svg>
              </div>
              <span className="text-lg font-display font-bold text-white">
                Medi<span className="text-primary-400">Lingual</span>{' '}
                <span className="text-teal-400">AI</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-sm">
              A Multilingual and Code-Mixed NLP Framework for Understanding Healthcare Queries
              — bridging the language gap in healthcare with AI.
            </p>

            {/* Tech stack icons */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Built with</span>
              <div className="flex items-center gap-3">
                {techIcons.map(({ Icon, label, color }) => (
                  <div key={label} title={label} className="group">
                    <Icon
                      className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors cursor-pointer"
                      style={{ '--hover-color': color }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 
                           hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 
                           hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@medilingual.ai"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 
                           hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="Email"
              >
                <FaEnvelope className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} MediLingual AI. Built for research and educational purposes.
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              Made with <FaHeart className="w-3 h-3 text-red-500" /> for accessible healthcare
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
