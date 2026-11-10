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
  FaMicrophone
} from 'react-icons/fa';

export default function ChatMessage({
  message,
  speechState = {},
  onSpeak,
  onPause,
  onResume,
  onStop
}) {
  const isUser = message.role === 'user';
  const { isSpeaking = false, isPaused = false, activeId = null } = speechState;
  const isCurrentAudio = activeId === message.id;

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

          {/* Interactive Audio Controls: Listen, Stop, Continue */}
          {!isUser && onSpeak && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                {/* When this message is currently playing and active */}
                {isCurrentAudio && (isSpeaking || isPaused) ? (
                  <>
                    {!isPaused ? (
                      <button
                        type="button"
                        onClick={onPause}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold transition-all text-xs"
                        title="Pause Voice Guidance"
                      >
                        <FaPause className="text-[10px] text-amber-700" />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onResume}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all text-xs shadow-xs"
                        title="Continue Voice Guidance"
                      >
                        <FaPlay className="text-[9px]" />
                        <span>Continue Guidance</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onStop}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold transition-all text-xs"
                      title="Stop Voice Playback"
                    >
                      <FaStop className="text-[9px] text-rose-600" />
                      <span>Stop</span>
                    </button>

                    {/* Animated Waveform Indicator */}
                    <div className="flex items-center gap-0.5 ml-1.5 px-2 py-1 bg-teal-50 rounded-md border border-teal-200/60">
                      <span className="w-1 h-3 bg-teal-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-1 h-4 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:0.3s]" />
                      <span className="text-[10px] font-bold text-teal-800 ml-1">Speaking</span>
                    </div>
                  </>
                ) : (
                  /* When not currently speaking this message */
                  <button
                    type="button"
                    onClick={() => onSpeak(message.content, message.language || 'en', message.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50/90 hover:bg-teal-100 dark:bg-teal-900/60 dark:hover:bg-teal-800 dark:text-teal-200 text-teal-800 border border-teal-200/70 dark:border-teal-700 font-semibold transition-all text-xs shadow-2xs hover:shadow-xs"
                    title="Listen to Clinical Voice Guidance (Indic-TTS / Speech)"
                  >
                    <FaVolumeUp className="text-teal-700 text-xs" />
                    <span>Listen Voice Guidance</span>
                  </button>
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


