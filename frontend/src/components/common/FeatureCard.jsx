/**
 * @file FeatureCard.jsx
 * @description Reusable animated feature card component for the homepage.
 */

import { motion } from 'framer-motion';
import {
  FaLanguage,
  FaStethoscope,
  FaHeartbeat,
  FaBrain,
  FaDatabase,
  FaMicrophone,
} from 'react-icons/fa';

/** Icon lookup map */
const iconMap = {
  FaLanguage,
  FaStethoscope,
  FaHeartbeat,
  FaBrain,
  FaDatabase,
  FaMicrophone,
};

/** Color scheme map */
const colorMap = {
  primary: {
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    hoverBorder: 'hover:border-primary-300',
    glow: 'hover:shadow-glow',
  },
  teal: {
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    hoverBorder: 'hover:border-teal-300',
    glow: 'hover:shadow-glow-teal',
  },
  accent: {
    iconBg: 'bg-accent-100',
    iconColor: 'text-accent-600',
    hoverBorder: 'hover:border-accent-300',
    glow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
  },
};

/**
 * FeatureCard renders a single feature with icon, title, and description.
 * @param {Object} props
 * @param {string} props.title - Feature title.
 * @param {string} props.description - Feature description.
 * @param {string} props.icon - Icon key from iconMap.
 * @param {string} props.color - Color scheme key ('primary'|'teal'|'accent').
 * @param {number} props.index - Animation delay index.
 */
export default function FeatureCard({ title, description, icon, color = 'primary', index = 0 }) {
  const IconComponent = iconMap[icon] || FaBrain;
  const colors = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`card group cursor-default ${colors.hoverBorder} ${colors.glow}`}
    >
      <div
        className={`w-14 h-14 ${colors.iconBg} rounded-2xl flex items-center justify-center mb-5 
                    group-hover:scale-110 transition-transform duration-300`}
      >
        <IconComponent className={`w-6 h-6 ${colors.iconColor}`} />
      </div>
      <h3 className="text-lg font-display font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}
