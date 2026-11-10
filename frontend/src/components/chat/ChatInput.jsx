import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaTrashAlt, FaMicrophone, FaGlobeAmericas, FaKeyboard } from 'react-icons/fa';
import VoiceButton from './VoiceButton';

export default function ChatInput({
  onSendMessage,
  onClearChat,
  isLoading,
  isListening,
  onToggleVoice,
  voiceTranscript = '',
  interimTranscript = '',
  selectedLanguage = 'auto',
  onSelectLanguage,
  placeholder = 'Describe patient symptoms or enter clinical query in Telugu, Hindi, English, or Code-Mixed...',
}) {
  const [text, setText] = useState('');

  // When speech recognition produces text, sync it into the textarea
  useEffect(() => {
    if (voiceTranscript) {
      setText((prev) => (prev ? `${prev} ${voiceTranscript}` : voiceTranscript));
    }
  }, [voiceTranscript]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalQuery = (text || interimTranscript).trim();
    if (!finalQuery || isLoading) return;
    onSendMessage(finalQuery);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const languageOptions = [
    { code: 'auto', label: 'Auto-Detect', badge: '🌐' },
    { code: 'te', label: 'తెలుగు (Telugu)', badge: '🇮🇳' },
    { code: 'hi', label: 'हिन्दी (Hindi)', badge: '🇮🇳' },
    { code: 'en', label: 'English', badge: '🇬🇧' },
  ];

  return (
    <div className="space-y-2.5">
      {/* Live Audio Transcription Banner */}
      {isListening && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold animate-pulse shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <FaMicrophone className="text-rose-600" />
            <span>Voice Ingestion Active: {interimTranscript ? `"${interimTranscript}"` : 'Speak clinical symptoms into microphone...'}</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-rose-100 text-rose-900 px-2 py-0.5 rounded">
            Live Stream
          </span>
        </div>
      )}

      {/* Primary Input Console */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 rounded-2xl shadow-xs p-2.5 flex items-end gap-2.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600 transition-all"
      >
        <textarea
          value={text || (isListening ? interimTranscript : '')}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening to voice stream...' : placeholder}
          rows={1}
          disabled={isLoading}
          className="flex-grow resize-none border-0 bg-transparent py-2 px-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:outline-none text-[13.5px] max-h-32 min-h-[44px] leading-relaxed"
        />

        <div className="flex items-center gap-1.5 flex-shrink-0 mb-0.5">
          <VoiceButton
            isListening={isListening}
            onToggle={onToggleVoice}
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={onClearChat}
            title="Reset Consultation History"
            className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 transition-all"
          >
            <FaTrashAlt className="text-xs" />
          </button>

          <button
            type="submit"
            disabled={(!text.trim() && !interimTranscript.trim()) || isLoading}
            className={`px-4 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 font-semibold text-xs shadow-xs ${
              (!text.trim() && !interimTranscript.trim()) || isLoading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.98]'
            }`}
          >
            <span>Consult</span>
            <FaPaperPlane className="text-[11px]" />
          </button>
        </div>
      </form>

      {/* Downside Language Selector Dock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <FaGlobeAmericas className="text-teal-600 text-xs" />
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Output Language:
          </span>
        </div>

        {/* Segmented Control Options */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-inner">
          {languageOptions.map((lang) => {
            const isActive = (selectedLanguage || 'auto') === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage && onSelectLanguage(lang.code)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-teal-900 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>{lang.badge}</span>
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
