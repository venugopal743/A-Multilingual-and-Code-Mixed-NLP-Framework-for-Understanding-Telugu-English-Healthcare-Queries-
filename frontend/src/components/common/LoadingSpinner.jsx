/**
 * @file LoadingSpinner.jsx
 * @description Loading spinner and typing indicator components.
 */

import { motion } from 'framer-motion';

/**
 * TypingDots renders an animated three-dot typing indicator (used in chat).
 */
export function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-5 py-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-primary-400 rounded-full"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

/**
 * LoadingSpinner renders a centered spinning loader.
 * @param {Object} props
 * @param {string} props.size - Size class ('sm'|'md'|'lg').
 * @param {string} props.message - Optional loading message.
 */
export default function LoadingSpinner({ size = 'md', message }) {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeMap[size]} border-primary-200 border-t-primary-500 rounded-full animate-spin`}
      />
      {message && <p className="text-sm text-slate-500 animate-pulse">{message}</p>}
    </div>
  );
}
