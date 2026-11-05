import React from 'react';
import { motion } from 'framer-motion';
import {
  FaBrain,
  FaLanguage,
  FaHeartbeat,
  FaPills,
  FaHospital,
  FaInfoCircle,
  FaShieldAlt,
  FaDatabase,
  FaClock
} from 'react-icons/fa';

export default function AnalysisPanel({ analysis, isProcessing }) {
  if (isProcessing) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center min-h-[350px] text-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h4 className="text-sm font-semibold text-slate-800">Processing Healthcare Query</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Running Multilingual Language Detection, Indic NLP Preprocessing, MuRIL NER, and FAISS RAG Retrieval...
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center min-h-[350px] flex flex-col items-center justify-center text-slate-400">
        <FaBrain className="text-4xl text-teal-200 mb-3" />
        <h4 className="text-sm font-semibold text-slate-700">Live NLP Analysis Panel</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Ask a question or enter symptoms to see real-time multilingual language detection, medical NER, intent, and RAG knowledge retrieval.
        </p>
      </div>
    );
  }

  const {
    language_detection = {},
    ner = {},
    intent = {},
    rag = {},
    processing_time = 0,
    explanation = '',
  } = analysis;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5 text-slate-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <FaBrain className="text-sm" />
          </div>
          <h3 className="font-semibold text-sm text-slate-800">Query Intelligence</h3>
        </div>
        {processing_time > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
            <FaClock className="text-[10px]" /> {processing_time}ms
          </span>
        )}
      </div>

      {/* 1. Language Detection */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            <FaLanguage className="text-teal-600 text-sm" />
            Language Detection (FastText)
          </span>
          {language_detection.is_code_mixed && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              Code-Mixed
            </span>
          )}
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-xs border border-slate-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-600 font-medium">Detected Language:</span>
            <span className="font-bold text-slate-800 capitalize">
              {language_detection.detected_language || 'Unknown'}
            </span>
          </div>
          {language_detection.normalized_text && (
            <div className="mt-2 pt-2 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-500 block mb-0.5">Indic NLP Normalized:</span>
              <p className="font-mono text-slate-700 text-[11px] bg-white p-1.5 rounded border border-slate-200/50 break-words">
                {language_detection.normalized_text}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Intent Classification */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            <FaInfoCircle className="text-sky-600 text-sm" />
            Intent Classification (MuRIL)
          </span>
          {intent.confidence && (
            <span className="text-[11px] font-mono text-slate-500">
              {(intent.confidence * 100).toFixed(0)}% Conf
            </span>
          )}
        </div>
        <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-sky-900 capitalize">
            {intent.intent ? intent.intent.replace(/_/g, ' ') : 'General Healthcare'}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
        </div>
      </div>

      {/* 3. Extracted Medical Entities (NER) */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            <FaHeartbeat className="text-rose-500 text-sm" />
            Medical Entities (XLM-R / MuRIL)
          </span>
        </div>
        <div className="space-y-2">
          {/* Symptoms */}
          {ner.symptoms?.length > 0 && (
            <div>
              <span className="text-[11px] font-medium text-slate-500 block mb-1">Symptoms:</span>
              <div className="flex flex-wrap gap-1.5">
                {ner.symptoms.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium"
                  >
                    {typeof s === 'string' ? s : s.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Diseases */}
          {ner.diseases?.length > 0 && (
            <div>
              <span className="text-[11px] font-medium text-slate-500 block mb-1">Diseases / Conditions:</span>
              <div className="flex flex-wrap gap-1.5">
                {ner.diseases.map((d, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg font-medium"
                  >
                    {typeof d === 'string' ? d : d.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medicines / Treatments */}
          {ner.medicines?.length > 0 && (
            <div>
              <span className="text-[11px] font-medium text-slate-500 block mb-1">Medicines / Treatments:</span>
              <div className="flex flex-wrap gap-1.5">
                {ner.medicines.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs rounded-lg font-medium"
                  >
                    {typeof m === 'string' ? m : m.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Duration */}
          {ner.durations?.length > 0 && (
            <div>
              <span className="text-[11px] font-medium text-slate-500 block mb-1">Duration:</span>
              <div className="flex flex-wrap gap-1.5">
                {ner.durations.map((dur, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-sky-50 border border-sky-200 text-sky-700 text-xs rounded-lg font-medium"
                  >
                    {typeof dur === 'string' ? dur : dur.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Empty fallback */}
          {(!ner.symptoms?.length && !ner.diseases?.length && !ner.medicines?.length && !ner.durations?.length) && (
            <p className="text-xs text-slate-400 italic">No specific medical entities recognized in this query.</p>
          )}
        </div>
      </div>

      {/* 4. Knowledge Retrieval (RAG & FAISS) */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            <FaDatabase className="text-teal-600 text-sm" />
            Medical Knowledge Base (FAISS RAG)
          </span>
          {rag.retrieved_docs?.length > 0 && (
            <span className="text-[11px] font-mono text-teal-600 font-semibold">
              {rag.retrieved_docs.length} Matched
            </span>
          )}
        </div>
        <div className="space-y-2">
          {rag.retrieved_docs?.slice(0, 2).map((doc, idx) => (
            <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                <span className="font-medium text-slate-600 truncate">{doc.title || `Source #${idx + 1}`}</span>
                {doc.score !== undefined && (
                  <span className="font-mono text-teal-700 font-bold">{(doc.score * 100).toFixed(0)}% match</span>
                )}
              </div>
              <p className="text-slate-600 line-clamp-2 text-[11px]">{doc.text || doc.snippet}</p>
            </div>
          ))}
          {(!rag.retrieved_docs || rag.retrieved_docs.length === 0) && (
            <p className="text-xs text-slate-400 italic">No direct knowledge base documents retrieved.</p>
          )}
        </div>
      </div>

      {/* 5. Explainability Notes */}
      {explanation && (
        <div className="p-3 bg-teal-50/70 border border-teal-200/60 rounded-xl text-xs text-teal-900">
          <div className="flex items-center gap-1.5 font-semibold mb-1 text-teal-950">
            <FaShieldAlt className="text-teal-700" />
            <span>AI Reasoning & Explainability</span>
          </div>
          <p className="text-[11px] leading-relaxed text-teal-900/90">{explanation}</p>
        </div>
      )}
    </motion.div>
  );
}
