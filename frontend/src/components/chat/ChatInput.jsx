import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaTrashAlt, FaMicrophone } from 'react-icons/fa';
import VoiceButton from './VoiceButton';

export default function ChatInput({
  onSendMessage,
  onClearChat,
  isLoading,
  isListening,
  onToggleVoice,
  voiceTranscript = '',
  interimTranscript = '',
  placeholder = 'Type healthcare query in Telugu, Hindi, English or Code-Mixed...',
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

  return (
    <div className="space-y-1.5">
      {/* Visual Live Transcription Banner */}
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium animate-pulse">
          <FaMicrophone className="text-rose-500" />
          <span>Listening... {interimTranscript ? `"${interimTranscript}"` : 'Speak into your microphone now'}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative bg-white border border-slate-200 rounded-2xl shadow-sm p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all">
        <textarea
          value={text || (isListening ? interimTranscript : '')}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening to speech...' : placeholder}
          rows={1}
          disabled={isLoading}
          className="flex-grow resize-none border-0 bg-transparent py-2.5 px-3 text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none text-sm max-h-32 min-h-[44px]"
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
            title="Clear Conversation"
            className="p-3 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <FaTrashAlt className="text-sm" />
          </button>

          <button
            type="submit"
            disabled={(!text.trim() && !interimTranscript.trim()) || isLoading}
            className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center font-medium shadow-sm ${
              (!text.trim() && !interimTranscript.trim()) || isLoading
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95'
            }`}
          >
            <FaPaperPlane className="text-sm" />
          </button>
        </div>
      </form>
    </div>
  );
}
