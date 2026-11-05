import React from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function VoiceButton({ isListening, onToggle, disabled }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      disabled={disabled}
      title={isListening ? 'Stop recording voice' : 'Speak healthcare query (Whisper STT)'}
      className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center shadow-md ${
        isListening
          ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
          : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isListening ? (
        <FaStop className="text-base" />
      ) : (
        <FaMicrophone className="text-base" />
      )}
    </motion.button>
  );
}
