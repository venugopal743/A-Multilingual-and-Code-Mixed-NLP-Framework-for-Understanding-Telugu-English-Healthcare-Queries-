import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHeartbeat,
  FaLanguage,
  FaMicrophone,
  FaDatabase,
  FaBrain,
  FaShieldAlt,
  FaArrowRight,
  FaStethoscope,
  FaCheckCircle,
  FaFileMedicalAlt
} from 'react-icons/fa';
import { STATS, CODE_MIXED_EXAMPLES } from '../utils/constants';

export default function HomePage() {
  const pipelineSteps = [
    { title: '1. Patient Query', desc: 'Text or Voice input in Telugu, Hindi, English or Code-Mixed', icon: FaMicrophone },
    { title: '2. Language Detection', desc: 'FastText + Script analysis detects language & code-mixing', icon: FaLanguage },
    { title: '3. Indic NLP Preprocessing', desc: 'Normalization, script cleaning, and transliteration', icon: FaBrain },
    { title: '4. Medical NER & Symptoms', desc: 'Fine-tuned XLM-RoBERTa & MuRIL extract symptoms & entities', icon: FaStethoscope },
    { title: '5. Intent Classification', desc: 'Identifies query category (symptoms, drugs, triage, booking)', icon: FaHeartbeat },
    { title: '6. FAISS RAG Retrieval', desc: 'multilingual-e5-base retrieves trusted medical knowledge', icon: FaDatabase },
    { title: '7. Grounded LLM Response', desc: 'Qwen2.5 / Indic-TTS generates explainable response in user language', icon: FaShieldAlt },
  ];

  const features = [
    {
      title: 'Multilingual & Code-Mixed NLP',
      desc: 'Seamlessly understands Telugu, Hindi, English, and Romanized code-mixed expressions (e.g., "Naaku 2 days nunchi fever undi").',
      icon: FaLanguage,
      color: 'teal',
    },
    {
      title: 'Clinical Named Entity Recognition',
      desc: 'Extracts symptoms, diagnoses, medications, anatomical regions, and symptom durations using XLM-RoBERTa.',
      icon: FaStethoscope,
      color: 'sky',
    },
    {
      title: 'MuRIL Intent Classification',
      desc: 'Accurately categorizes queries into 8 clinical intents with confidence scores to direct patient queries effectively.',
      icon: FaBrain,
      color: 'indigo',
    },
    {
      title: 'RAG Medical Knowledge Base',
      desc: 'Grounds responses on verified clinical datasets and guidelines indexed in FAISS with dense multilingual embeddings.',
      icon: FaDatabase,
      color: 'teal',
    },
    {
      title: 'Multimodal Voice I/O',
      desc: 'Enables patients to speak via Whisper speech-to-text and listen to responses via AI4Bharat Indic-TTS.',
      icon: FaMicrophone,
      color: 'rose',
    },
    {
      title: 'Explainable AI & Patient Safety',
      desc: 'Provides transparent entity highlights, confidence metrics, clinical source citations, and safe triage disclaimers.',
      icon: FaShieldAlt,
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-sky-50/30 to-white pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs sm:text-sm font-medium mb-6"
          >
            <FaHeartbeat className="text-teal-600 animate-pulse" />
            <span>Multilingual Healthcare NLP Framework (Telugu • Hindi • English)</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Breaking Language Barriers in{' '}
            <span className="bg-gradient-to-r from-teal-600 to-sky-600 bg-clip-text text-transparent">
              Healthcare Queries
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            A state-of-the-art multilingual NLP system powered by FastText, MuRIL, XLM-RoBERTa, FAISS RAG, and Whisper
            for understanding native and code-mixed medical inquiries.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/chat"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-teal-600/20 hover:shadow-xl transition-all"
            >
              <span>Launch Healthcare Assistant</span>
              <FaArrowRight className="text-xs" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm sm:text-base shadow-sm transition-all"
            >
              <span>Explore Architecture</span>
            </Link>
          </motion.div>
        </div>

        {/* Decorative background blur blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none -z-0" />
      </section>

      {/* Stats Counter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-teal-600 font-mono">
                {stat.value}{stat.suffix}
              </div>
              <div className="mt-2 text-xs md:text-sm font-medium text-slate-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Core Capabilities</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Engineered for Real-World Indian Healthcare
          </h3>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">
            From rural clinics to telemedicine portals, patients describe symptoms in mixed vernacular and English.
            Our framework solves dialectal ambiguity and colloquial phrasing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <feat.icon className="text-xl" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">{feat.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Languages & Code-Mixed Showcase */}
      <section className="bg-slate-100/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Language Diversity</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Native & Code-Mixed Query Support</h3>
            <p className="mt-3 text-sm text-slate-600">
              Patients speak naturally. Here are real examples processed with token-level language identification:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {CODE_MIXED_EXAMPLES.slice(0, 4).map((ex, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                    {ex.language}
                  </span>
                  <FaCheckCircle className="text-teal-500 text-xs" />
                </div>
                <p className="text-sm font-semibold text-slate-800 italic mb-2">"{ex.text}"</p>
                <p className="text-xs text-slate-500">
                  <strong className="text-slate-700 font-medium">English Translation:</strong> {ex.translation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NLP Pipeline Architecture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Architecture Pipeline</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            How MediLingual Processes Queries
          </h3>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">
            Each query passes through 7 specialized neural modules for safe, explainable healthcare guidance.
          </p>
        </div>

        <div className="relative border-l-2 border-teal-200 ml-4 md:ml-32 space-y-8 pl-6 md:pl-10">
          {pipelineSteps.map((step, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-[35px] md:-left-[51px] top-1.5 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs shadow-md group-hover:scale-110 transition-transform">
                <step.icon />
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm max-w-2xl">
                <h4 className="font-bold text-slate-800 text-base">{step.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-sky-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to test the Multilingual Healthcare AI?</h3>
            <p className="mt-3 text-teal-100 text-sm sm:text-base leading-relaxed">
              Ask questions in Telugu, Hindi, English, or Code-mixed Roman script. View instant symptom extraction,
              medical NER, and FAISS RAG knowledge citations.
            </p>
          </div>
          <Link
            to="/chat"
            className="flex-shrink-0 px-8 py-4 rounded-xl bg-white text-teal-800 hover:bg-teal-50 font-bold text-base shadow-lg transition-transform hover:scale-105"
          >
            Start Live Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
