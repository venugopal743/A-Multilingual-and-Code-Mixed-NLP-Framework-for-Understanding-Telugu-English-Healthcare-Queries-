import React from 'react';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaUserMd,
  FaVolumeUp,
  FaCheckCircle,
  FaNotesMedical,
  FaPause,
  FaPlay,
  FaStop,
} from 'react-icons/fa';

export default function ChatMessage({
  message,
  speechState = {},
  onSpeak,
  onPause,
  onResume,
  onStop,
}) {
  const isUser = message.role === 'user';
  const { isSpeaking = false, isPaused = false, activeId = null } = speechState;
  const isCurrentAudio = Boolean(activeId && activeId === message.id);

  /** Direct hardware stop for instantaneous silence */
  const handleDirectStop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Immediately kill HTML5 Audio
    if (typeof window !== 'undefined' && window.__MEDILINGUAL_AUDIO__) {
      try {
        window.__MEDILINGUAL_AUDIO__.pause();
        window.__MEDILINGUAL_AUDIO__.currentTime = 0;
        window.__MEDILINGUAL_AUDIO__.src = '';
      } catch (_) {}
    }

    // 2. Immediately cancel Web Speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    if (typeof window !== 'undefined') {
      window.__IS_MEDILINGUAL_PAUSED__ = false;
      window.__MEDILINGUAL_RESUME__ = null;
    }

    // 3. Update React state
    if (onStop) onStop();
  };

  /** Direct hardware pause / resume toggle */
  const handleDirectPauseResume = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPaused) {
      // RESUME
      if (typeof window !== 'undefined') {
        window.__IS_MEDILINGUAL_PAUSED__ = false;
        if (
          window.__MEDILINGUAL_AUDIO__ &&
          window.__MEDILINGUAL_AUDIO__.src &&
          window.__MEDILINGUAL_AUDIO__.src !== window.location.href &&
          !window.__MEDILINGUAL_AUDIO__.ended
        ) {
          try {
            window.__MEDILINGUAL_AUDIO__.play().catch(() => {});
          } catch (_) {}
        }
        if ('speechSynthesis' in window && window.speechSynthesis.paused) {
          try {
            window.speechSynthesis.resume();
          } catch (_) {}
        }
      }
      if (onResume) onResume();
    } else {
      // PAUSE
      if (typeof window !== 'undefined') {
        window.__IS_MEDILINGUAL_PAUSED__ = true;
        if (window.__MEDILINGUAL_AUDIO__) {
          try {
            window.__MEDILINGUAL_AUDIO__.pause();
          } catch (_) {}
        }
        if ('speechSynthesis' in window) {
          try {
            window.speechSynthesis.pause();
          } catch (_) {}
        }
      }
      if (onPause) onPause();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3.5 my-4.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs border ${
          isUser
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-teal-700 border-teal-800 text-white'
        }`}
      >
        {isUser ? <FaUser className="text-xs" /> : <FaUserMd className="text-base" />}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-[88%] md:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Header Metadata */}
        <div className="flex items-center gap-2 mb-1.5 px-0.5 text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {isUser ? 'Patient Query' : 'Clinical Consultation Assistant'}
          </span>
          {!isUser && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200/60 px-1.5 py-0.5 rounded">
              <FaCheckCircle className="text-[9px] text-teal-600" /> Verified Triage
            </span>
          )}
          {message.language && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-600">
              {message.language}
            </span>
          )}
          <span className="text-[11px] text-slate-400">
            {message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Message Bubble */}
        <div
          className={`p-4 sm:p-5 rounded-2xl text-[13.5px] leading-relaxed relative ${
            isUser
              ? 'bg-slate-900 text-slate-50 shadow-sm rounded-tr-xs'
              : 'bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700 shadow-xs rounded-tl-xs'
          }`}
        >
          <p className="whitespace-pre-line font-normal tracking-normal">{message.content}</p>

          {/* Dedicated Voice Output Controls: Listen, Pause/Resume, Stop */}
          {!isUser && onSpeak && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Play / Listen Voice Guidance Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSpeak(message.content, message.language || 'en', message.id);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all text-xs shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer ${
                    isCurrentAudio && isSpeaking
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-teal-50/90 hover:bg-teal-100 dark:bg-teal-900/60 dark:hover:bg-teal-800 text-teal-800 dark:text-teal-200 border border-teal-200/70 dark:border-teal-700'
                  }`}
                  title="Listen to Clinical Voice Guidance"
                >
                  <FaVolumeUp className={isCurrentAudio && isSpeaking ? 'text-white text-xs' : 'text-teal-700 text-xs'} />
                  <span>{isCurrentAudio && isSpeaking ? 'Playing Voice...' : 'Listen Voice Guidance'}</span>
                </button>

                {/* 2. Pause / Resume Button — Guaranteed Responsive */}
                <button
                  type="button"
                  onClick={handleDirectPauseResume}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all text-xs border cursor-pointer active:scale-95 ${
                    isPaused
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                      : isSpeaking
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 shadow-2xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200/90'
                  }`}
                  title={isPaused ? 'Resume Voice Guidance' : 'Pause Voice Guidance'}
                >
                  {isPaused ? (
                    <>
                      <FaPlay className="text-[9px]" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <FaPause className="text-[10px] text-amber-700" />
                      <span>Pause</span>
                    </>
                  )}
                </button>

                {/* 3. Stop Button — Guaranteed Instant Hardware Cutoff */}
                <button
                  type="button"
                  onClick={handleDirectStop}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all text-xs border cursor-pointer active:scale-95 bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200/90 shadow-2xs hover:shadow-xs"
                  title="Stop Voice Playback"
                >
                  <FaStop className="text-[9px] text-rose-600" />
                  <span>Stop</span>
                </button>

                {/* Animated Waveform Indicator when actively speaking */}
                {isCurrentAudio && isSpeaking && (
                  <div className="flex items-center gap-0.5 ml-1 px-2 py-1 bg-teal-50 rounded-md border border-teal-200/60">
                    <span className="w-1 h-3 bg-teal-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-1 h-4 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:0.3s]" />
                    <span className="text-[10px] font-bold text-teal-800 ml-1">Speaking</span>
                  </div>
                )}
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <FaNotesMedical className="text-slate-400 text-[10px]" />
                <span>Validated against FAISS Knowledge Base</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
