/**
 * @file StatCard.jsx
 * @description Animated stat counter card with number increment animation.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  FaFileAlt,
  FaGlobeAmericas,
  FaTag,
  FaCubes,
} from 'react-icons/fa';

const iconMap = {
  records: FaFileAlt,
  languages: FaGlobeAmericas,
  intents: FaTag,
  entities: FaCubes,
};

const colorMap = {
  records: { bg: 'bg-primary-100', text: 'text-primary-600' },
  languages: { bg: 'bg-teal-100', text: 'text-teal-600' },
  intents: { bg: 'bg-accent-100', text: 'text-accent-600' },
  entities: { bg: 'bg-amber-100', text: 'text-amber-600' },
};

/**
 * StatCard renders an animated counter that counts up when scrolled into view.
 * @param {Object} props
 * @param {string} props.label - Stat label.
 * @param {number} props.value - Target value for the counter.
 * @param {string} props.suffix - Suffix string (e.g., '+').
 * @param {string} props.icon - Icon key from iconMap.
 * @param {number} props.index - Animation delay index.
 */
export default function StatCard({ label, value, suffix = '', icon = 'records', index = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const IconComponent = iconMap[icon] || FaFileAlt;
  const colors = colorMap[icon] || colorMap.records;

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card text-center group"
    >
      <div
        className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-4
                    group-hover:scale-110 transition-transform duration-300`}
      >
        <IconComponent className={`w-6 h-6 ${colors.text}`} />
      </div>
      <div className="text-4xl font-display font-bold text-slate-900 mb-1">
        {count.toLocaleString()}
        <span className="text-primary-500">{suffix}</span>
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
    </motion.div>
  );
}
