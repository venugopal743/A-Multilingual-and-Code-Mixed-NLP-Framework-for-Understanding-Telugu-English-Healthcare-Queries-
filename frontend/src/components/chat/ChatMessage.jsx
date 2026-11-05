import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaRobot, FaVolumeUp, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function ChatMessage({ message, onSpeak }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 my-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
          isUser
            ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white'
            : 'bg-gradient-to-tr from-teal-500 to-emerald-600 text-white'
        }`}
      >
        {isUser ? <FaUser className="text-sm" /> : <FaRobot className="text-sm" />}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 text-xs text-slate-400">
          <span className="font-medium text-slate-600">{isUser ? 'Patient' : 'MediLingual AI'}</span>
          {message.language && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] uppercase">
              {message.language}
            </span>
          )}
          <span>{message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Message Bubble */}
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
            isUser
              ? 'bg-sky-600 text-white rounded-tr-none'
              : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
          }`}
        >
          <p className="whitespace-pre-line">{message.content}</p>

          {/* Assistant Action Bar (Voice TTS playback) */}
          {!isUser && onSpeak && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => onSpeak(message.content, message.language || 'en')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-colors"
                title="Play Audio (Indic-TTS / Speech)"
              >
                <FaVolumeUp className="text-teal-600" />
                <span>Listen Audio</span>
              </button>

              {message.analysis?.rag_sources?.length > 0 && (
                <span className="text-[11px] text-slate-400">
                  {message.analysis.rag_sources.length} clinical sources cited
                </span>
              )}
            </div>
          )}
        </div>

        {/* Medical disclaimer pill on AI messages */}
        {!isUser && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600/90 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
            <FaExclamationTriangle className="text-[10px]" />
            <span>AI informational guidance. Consult a medical professional for diagnosis.</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
