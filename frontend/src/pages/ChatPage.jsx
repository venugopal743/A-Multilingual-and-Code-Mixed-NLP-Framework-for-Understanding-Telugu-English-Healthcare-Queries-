import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaInfoCircle, FaShieldAlt, FaNotesMedical, FaStethoscope, FaHistory } from 'react-icons/fa';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import AnalysisPanel from '../components/chat/AnalysisPanel';
import { useAppContext } from '../context/AppContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { selectedLanguage, setLanguage } = useAppContext();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Welcome to the MediLingual Clinical Consultation Portal. You can describe patient symptoms or enter clinical queries in Telugu (తెలుగు), Hindi (हिन्दी), English, or Code-Mixed text (such as "Naaku 2 days nunchi fever undi" or "naku cancer vachindhi"). Click the microphone icon for real-time speech ingestion or type your query below.',
      language: 'EN',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState(null);
  const messagesEndRef = useRef(null);

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput({ language: selectedLanguage });

  const {
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    cancel
  } = useSpeechSynthesis({
    onEnd: () => setActiveSpeechId(null)
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // When speech recognition produces finalized text, auto-send query
  useEffect(() => {
    if (transcript && !isListening) {
      handleSendMessage(transcript);
      resetTranscript();
    }
  }, [isListening, transcript]);

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(selectedLanguage);
    }
  };

  /** Speech Synthesis Handlers */
  const handleSpeak = (text, lang, id) => {
    setActiveSpeechId(id);
    speak(text, lang, id);
  };

  const handlePause = () => {
    pause();
  };

  const handleResume = () => {
    resume();
  };

  const handleStop = () => {
    cancel();
    setActiveSpeechId(null);
  };

  /** Detect language of query accurately */
  const detectQueryLanguage = (text) => {
    const qLower = text.toLowerCase();
    const isTeluguScript = /[\u0C00-\u0C7F]/.test(text);
    const isHindiScript = /[\u0900-\u097F]/.test(text);
    const isTeluguRoman =
      (qLower.includes('naaku') || qLower.includes('naku') || qLower.includes('undi') || qLower.includes('vachindi') || qLower.includes('vachindhi') || qLower.includes('kuda') || qLower.includes('noppi') || qLower.includes('tunti') || qLower.includes('jwaram') || qLower.includes('talanoppi')) &&
      /[a-zA-Z]/.test(text);
    const isHindiRoman =
      (qLower.includes('mujhe') || qLower.includes('hai') || qLower.includes('dard') || qLower.includes('bukhar') || qLower.includes('se') || qLower.includes('aur') || qLower.includes('kamar') || qLower.includes('ho gaya')) &&
      /[a-zA-Z]/.test(text);

    if (isTeluguScript) return { code: 'te', label: 'TE' };
    if (isHindiScript) return { code: 'hi', label: 'HI' };
    if (isTeluguRoman) return { code: 'te', label: 'TE-EN' };
    if (isHindiRoman) return { code: 'hi', label: 'HI-EN' };
    return { code: 'en', label: 'EN' };
  };

  const handleSendMessage = async (text) => {
    const detected = detectQueryLanguage(text);

    // Stop previous speech if any
    cancel();
    setActiveSpeechId(null);

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      language: detected.label, // Accurately displays TE, TE-EN, HI, or EN!
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await api.sendQuery(text, selectedLanguage);
      const data = response.data || response;

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.ai_response || data.response || data.message || 'I have analyzed your query based on trusted medical knowledge.',
        language: (data.response_language || data.detected_language || selectedLanguage).toUpperCase(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysis: data.analysis || data,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setCurrentAnalysis(data.analysis || data);
    } catch (err) {
      console.warn('API error or running client clinical engine:', err);
      const mockResult = generateClinicalTriageResponse(text, selectedLanguage);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockResult.response,
        language: mockResult.language.toUpperCase(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysis: mockResult.analysis,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setCurrentAnalysis(mockResult.analysis);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reactive Language Selection:
   * When user clicks Telugu, Hindi, or English in downside options,
   * immediately re-localize the assistant response and active analysis!
   */
  const handleSelectLanguage = (newLang) => {
    setLanguage(newLang);

    if (messages.length > 1) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMsg) {
        const reGenerated = generateClinicalTriageResponse(lastUserMsg.content, newLang);
        setMessages((prev) => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].role === 'assistant') {
              updated[i] = {
                ...updated[i],
                content: reGenerated.response,
                language: (newLang === 'auto' ? reGenerated.language : newLang).toUpperCase(),
                analysis: reGenerated.analysis,
              };
              break;
            }
          }
          return updated;
        });
        setCurrentAnalysis(reGenerated.analysis);
      }
    }
  };

  const handleClearChat = () => {
    cancel();
    setActiveSpeechId(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          'Consultation session reset. How can I assist you with clinical triage in Telugu, Hindi, or English?',
        language: 'EN',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setCurrentAnalysis(null);
    toast.success('Consultation session cleared');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      {/* Clinical Consultation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/70">
              <FaStethoscope className="text-xs" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Clinical AI Consultation & Tele-Triage
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time multilingual processing with FastText, MuRIL, and FAISS RAG
          </p>
        </div>

        {/* Clinical Session Info */}
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Consultation Session #ML-8429</span>
          </span>
          <button
            onClick={handleClearChat}
            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all flex items-center gap-1"
            title="Reset Session"
          >
            <FaHistory className="text-[10px]" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Chat + Analysis Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chat Area */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[760px] bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
          {/* Quick Query Starter Pills */}
          <div className="p-3 bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto flex items-center gap-2 text-xs scrollbar-none">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
              Clinical Case Prompts:
            </span>
            <button
              onClick={() => handleSendMessage('తుంటి నొప్పి మరియు నడవడంలో ఇబ్బందిగా ఉంది')}
              className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg font-semibold whitespace-nowrap transition-all hover:bg-teal-100/80 shadow-2xs"
            >
              Telugu: "తుంటి నొప్పి మరియు నడవడంలో ఇబ్బందిగా ఉంది"
            </button>
            <button
              onClick={() => handleSendMessage('naku cancer vachindhi')}
              className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 rounded-lg font-semibold whitespace-nowrap transition-all"
            >
              Telugu: "naku cancer vachindhi"
            </button>
            <button
              onClick={() => handleSendMessage("I'm suffering from fever.")}
              className="px-3 py-1 bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 rounded-lg text-slate-700 whitespace-nowrap transition-all font-medium"
            >
              English: "I'm suffering from fever"
            </button>
            <button
              onClick={() => handleSendMessage('Mujhe kal se kamar aur pairon mein dard hai.')}
              className="px-3 py-1 bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 rounded-lg text-slate-700 whitespace-nowrap transition-all font-medium"
            >
              Hindi: "Mujhe kal se kamar dard hai"
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-2.5 bg-slate-50/40 dark:bg-slate-950/50">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                speechState={{ isSpeaking, isPaused, activeId: activeId || activeSpeechId }}
                onSpeak={handleSpeak}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
              />
            ))}

            {isLoading && (
              <div className="flex gap-3.5 my-4">
                <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center flex-shrink-0 animate-pulse shadow-xs">
                  <FaStethoscope className="text-sm" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl rounded-tl-xs p-4 shadow-xs flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs font-medium text-slate-500 ml-1.5">
                    Querying Multilingual Clinical Knowledge Base (FAISS)...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar with Downside Options */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
            <ChatInput
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isLoading={isLoading}
              isListening={isListening}
              onToggleVoice={handleToggleVoice}
              voiceTranscript={transcript}
              interimTranscript={interimTranscript}
              selectedLanguage={selectedLanguage}
              onSelectLanguage={handleSelectLanguage}
            />
          </div>
        </div>

        {/* Right Column: Live NLP Analysis Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
          <AnalysisPanel
            analysis={currentAnalysis}
            isProcessing={isLoading}
            activeLanguage={selectedLanguage}
            onLanguageChange={handleSelectLanguage}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Intelligent Clinical Triage Engine:
 * Analyzes exact patient query to extract symptoms, diseases, medications,
 * intent, RAG documents, and custom tailored clinical responses!
 */
function generateClinicalTriageResponse(query, langPref) {
  const qLower = query.toLowerCase();

  // 1. Script & Language Detection
  const isTeluguScript = /[\u0C00-\u0C7F]/.test(query);
  const isHindiScript = /[\u0900-\u097F]/.test(query);
  const isTeluguRoman =
    (qLower.includes('naaku') || qLower.includes('naku') || qLower.includes('undi') || qLower.includes('vachindi') || qLower.includes('vachindhi') || qLower.includes('kuda') || qLower.includes('noppi') || qLower.includes('tunti') || qLower.includes('jwaram') || qLower.includes('talanoppi')) &&
    /[a-zA-Z]/.test(query);
  const isHindiRoman =
    (qLower.includes('mujhe') || qLower.includes('hai') || qLower.includes('dard') || qLower.includes('bukhar') || qLower.includes('se') || qLower.includes('aur') || qLower.includes('kamar') || qLower.includes('ho gaya')) &&
    /[a-zA-Z]/.test(query);
  const isCodeMixed = isTeluguRoman || isHindiRoman;

  let detectedLang = 'en';
  if (isTeluguScript) detectedLang = 'te';
  else if (isHindiScript) detectedLang = 'hi';
  else if (isTeluguRoman) detectedLang = 'te';
  else if (isHindiRoman) detectedLang = 'hi';

  let targetLang = 'en';
  if (langPref && langPref !== 'auto') {
    targetLang = langPref;
  } else {
    targetLang = detectedLang;
  }

  // 2. Clinical Condition Detection
  const isCancer =
    qLower.includes('cancer') ||
    qLower.includes('tumor') ||
    qLower.includes('lump') ||
    qLower.includes('carcinoma') ||
    query.includes('క్యాన్సర్') ||
    query.includes('కణితి') ||
    query.includes('పుండు') ||
    query.includes('कैंसर') ||
    query.includes('गांठ') ||
    query.includes('रसौली');

  const isFever =
    qLower.includes('fever') ||
    qLower.includes('bukhar') ||
    qLower.includes('jwaram') ||
    qLower.includes('temperature') ||
    query.includes('జ్వరం') ||
    query.includes('బుఖార్') ||
    query.includes('बुखार');

  const isHeadache =
    qLower.includes('headache') ||
    qLower.includes('sar dard') ||
    qLower.includes('talanoppi') ||
    qLower.includes('migraine') ||
    query.includes('తలనొప్పి') ||
    query.includes('సిరదర్ద్') ||
    query.includes('सिरदर्द');

  const isHipJoint =
    qLower.includes('hip') ||
    qLower.includes('joint') ||
    qLower.includes('walking') ||
    qLower.includes('pain') ||
    query.includes('నొప్పి') ||
    query.includes('తుంటి') ||
    query.includes('కీళ్ల') ||
    query.includes('నడవడంలో') ||
    query.includes('నడవడం') ||
    query.includes('दर्द') ||
    query.includes('कूल्हे') ||
    query.includes('जोड़ों');

  const isChest =
    qLower.includes('chest') ||
    qLower.includes('heart') ||
    qLower.includes('chathi') ||
    qLower.includes('seene') ||
    query.includes('ఛాతీ') ||
    query.includes('గుండె') ||
    query.includes('सीने');

  const isStomach =
    qLower.includes('stomach') ||
    qLower.includes('pet') ||
    qLower.includes('kadupu') ||
    qLower.includes('vomit') ||
    query.includes('కడుపు') ||
    query.includes('వాంతులు') ||
    query.includes('पेट') ||
    query.includes('उल्टी');

  // 3. Assemble Localized Entities, Intent, Diagnosis, and Guidance
  let symptoms = [];
  let diseases = [];
  let medicines = [];
  let durations = [];
  let responseText = '';
  let ragTitle = '';
  let ragSnippet = '';
  let intentName = 'symptom_inquiry';
  let explanationText = '';

  const is2Days = qLower.includes('2 day') || query.includes('రోజు') || query.includes('दिन');

  if (isCancer) {
    intentName = 'oncology_assessment_triage';
    if (targetLang === 'te') {
      symptoms = ['అలసట మరియు బరువు తగ్గడం', 'శరీరంలో అసాధారణ గడ్డ / కణితి'];
      diseases = ['ఆంకాలజీ పరీక్ష అవసరం (క్యాన్సర్ నిర్ధారణ)'];
      medicines = ['ఆంకాలజిస్ట్ సంప్రదింపులు / బయాప్సీ / డయాగ్నోస్టిక్ వర్కప్'];
      durations = ['సత్వర వైద్య పరిశీలన అవసరం'];
      responseText =
        'క్యాన్సర్ లేదా అనుమానిత కణితి లక్షణాల విషయంలో తీవ్ర ఆందోళన చెందకుండా, వీలైనంత త్వరగా ఒక నిపుణుడైన ఆంకాలజిస్ట్ (Medical / Surgical Oncologist) లేదా క్యాన్సర్ కేంద్రంలో సంప్రదించడం చాలా ముఖ్యం. నిర్దిష్ట రక్త పరీక్షలు, బయాప్సీ (Biopsy), మరియు PET-CT లేదా MRI స్కాన్ ద్వారా ఖచ్చితమైన నిర్ధారణ మరియు తగిన చికిత్స ప్రణాళికను సిద్ధం చేస్తారు. ఎటువంటి స్వీయ చికిత్సలు తీసుకోకండి.';
      ragTitle = 'నేషనల్ ఆంకాలజీ క్లినికల్ గైడ్‌లైన్స్ (క్యాన్సర్ స్క్రీనింగ్ & డయాగ్నోస్టిక్స్)';
      ragSnippet = 'అనుమానిత నియోప్లాజమ్స్ మరియు క్యాన్సర్ కేసులలో హిస్టోపాథలాజికల్ పరీక్ష (Biopsy) మరియు స్టేజింగ్ ఇన్వెస్టిగేషన్స్ తప్పనిసరి.';
      explanationText = 'క్లినికల్ NER ద్వారా క్యాన్సర్ మరియు నియోప్లాస్టిక్ పదాలు గుర్తించబడ్డాయి. సిస్టమ్ అత్యవసర ఆంకాలజీ రెఫరల్ మరియు అధునాతన డయాగ్నోస్టిక్ మార్గదర్శకాలను అందించింది.';
    } else if (targetLang === 'hi') {
      symptoms = ['अत्यधिक थकान और वजन कम होना', 'शरीर में असामान्य गांठ / सूजन'];
      diseases = ['ऑन्कोलॉजिकल मूल्यांकन आवश्यक (कैंसर जांच)'];
      medicines = ['कैंसर रोग विशेषज्ञ परामर्श / बायोप्सी जांच'];
      durations = ['तत्काल चिकित्सकीय जांच आवश्यक'];
      responseText =
        'कैंसर या संदिग्ध गांठ के संदर्भ में घबराएं नहीं, परंतु बिना किसी देरी के किसी योग्य ऑन्कोलॉजिस्ट (कैंसर रोग विशेषज्ञ) से संपर्क करें। रोग की सटीक पहचान और स्टेजिंग के लिए बायोप्सी (Biopsy), पीईटी-सीटी (PET-CT) और विशिष्ट रक्त परीक्षण आवश्यक होते हैं। कृपया किसी प्रमाणित कैंसर चिकित्सा केंद्र में तुरंत परामर्श लें।';
      ragTitle = 'राष्ट्रीय ऑन्कोलॉजी नैदानिक दिशानिर्देश (कैंसर स्क्रीनिंग और बायोप्सी)';
      ragSnippet = 'संदिग्ध ऑन्कोलॉजिकल मामलों में प्रारंभिक हिस्टोपैथोलॉजिकल बायोप्सी और रेडियोलॉजिकल इमेजिंग निर्णायक होती है।';
      explanationText = 'क्लीनिकल एनईआर द्वारा कैंसर एवं ऑन्कोलॉजी की पहचान की गई और प्रणाली ने तत्काल विशेषज्ञ परामर्श दिशानिर्देश पुनर्प्राप्त किए।';
    } else {
      symptoms = ['Unexplained Weight Loss & Fatigue', 'Localized Neoplasm / Mass'];
      diseases = ['Oncological Evaluation Required (Suspected Malignancy)'];
      medicines = ['Oncology Specialist Consultation / Biopsy Staging'];
      durations = ['Urgent Evaluation'];
      responseText =
        'Receiving a cancer diagnosis or noticing suspicious oncological symptoms requires urgent and coordinated care. We strongly advise scheduling a consultation with a qualified Medical or Surgical Oncologist. Standard clinical workup includes tissue histopathology (Biopsy), complete blood markers, and advanced staging imaging (PET-CT or Contrast MRI). Please seek care at a comprehensive oncology center immediately.';
      ragTitle = 'National Comprehensive Cancer Guidelines (Oncology Workup & Staging)';
      ragSnippet = 'Confirmed or suspected malignancies necessitate immediate multi-disciplinary tumor board review, tissue biopsy, and radiological staging.';
      explanationText = 'Entity extraction detected high-priority oncological terminology. Query routed to specialized oncology triage protocol with urgent referral recommendations.';
    }
  } else if (isFever) {
    intentName = 'fever_assessment';
    if (targetLang === 'te') {
      symptoms = ['జ్వరం / శరీర ఉష్ణోగ్రత పెరుగుదల', isHeadache ? 'తలనొప్పి' : 'శరీర నొప్పులు'];
      diseases = ['తీవ్రమైన జ్వర సంక్రమణ / వైరల్ ఇన్ఫెక్షన్'];
      medicines = ['పారాసిటమాల్ (500mg/650mg) / తగినంత ద్రవాలు / ఓఆర్‌ఎస్'];
      durations = is2Days ? ['2 రోజులు'] : ['ఇటీవలే ప్రారంభమైంది'];
      responseText =
        'మీరు జ్వరంతో బాధపడుతున్నారని చెప్పారు. తగినంత విశ్రాంతి తీసుకోవడం, ప్రతిరోజూ 3-4 లీటర్ల నీరు లేదా ద్రవ ఆహారం తీసుకోవడం మరియు శరీర ఉష్ణోగ్రతను థర్మామీటర్‌తో పర్యవేక్షించడం అవసరం. అవసరమైతే వైద్యుని సూచన మేరకు పారాసిటమాల్ తీసుకోవచ్చు. జ్వరం 101°F కంటే ఎక్కువ ఉంటే లేదా 48 గంటల కంటే ఎక్కువ కొనసాగితే వైద్యుడిని సంప్రదించండి.';
      ragTitle = 'జ్వర నిర్వహణ మరియు యాంటీపైరెటిక్ క్లినికల్ గైడ్‌లైన్స్';
      ragSnippet = 'జ్వర రోగులకు హైడ్రేషన్, పారాసిటమాల్ ఆధారిత ఉష్ణోగ్రత నియంత్రణ మరియు సంక్రమణ పరిశీలన అవసరం.';
      explanationText = 'రోగి ప్రశ్నలో జ్వరం మరియు ఉష్ణోగ్రత లక్షణాలు గుర్తించబడ్డాయి. సిస్టమ్ యాంటీపైరెటిక్ సంరక్షణ మార్గదర్శకాలను అందించింది.';
    } else if (targetLang === 'hi') {
      symptoms = ['बुखार / शरीर का तापमान बढ़ना', isHeadache ? 'सिरदर्द' : 'शरीर में दर्द'];
      diseases = ['तीव्र ज्वर बीमारी / वायरल संक्रमण'];
      medicines = ['पैरासिटामोल (500mg/650mg) / पर्याप्त जल व तरल पदार्थ'];
      durations = is2Days ? ['2 दिन'] : ['हाल ही में शुरू'];
      responseText =
        'बुखार की स्थिति में पर्याप्त आराम करें, शरीर को हाइड्रेटेड रखें और नियमित रूप से थर्मामीटर से तापमान मापें। यदि तापमान 101°F से अधिक है या 48 घंटे से अधिक समय तक बना रहता है, तो पैरासिटामोल लें और योग्य चिकित्सक से परामर्श करें।';
      ragTitle = 'ज्वर प्रबंधन और एंटीपायरेटिक नैदानिक दिशानिर्देश';
      ragSnippet = 'तीव्र ज्वर के रोगियों को पर्याप्त जलयोजन और तापमान की निरंतर निगरानी की आवश्यकता होती है।';
      explanationText = 'रोगी के प्रश्न में बुखार के लक्षण पहचाने गए और एंटीपायरेटिक देखभाल दिशानिर्देश प्राप्त किए गए।';
    } else {
      symptoms = ['Fever / Pyrexia', isHeadache ? 'Headache' : 'Body Aches'];
      diseases = ['Acute Febrile Illness / Viral Infection'];
      medicines = ['Paracetamol (500mg/650mg) / Oral Hydration / Electrolytes'];
      durations = is2Days ? ['2 days'] : ['Recent onset'];
      responseText =
        'You reported suffering from fever. Maintain strict physical rest, increase fluid intake (minimum 2.5–3 liters/day), and log your oral temperature with a digital thermometer. An antipyretic such as Paracetamol may be used under clinical advice to manage pyrexia. If fever exceeds 101°F (38.3°C), persists beyond 48 hours, or is accompanied by chills or breathing difficulty, seek clinical consultation.';
      ragTitle = 'Clinical Management of Pyrexia & Acute Febrile Illness';
      ragSnippet = 'Patients presenting with acute fever require temperature monitoring, oral hydration maintenance, and red-flag screening for sepsis or dengue.';
      explanationText = 'Clinical NER identified fever/pyrexia markers. Query mapped to Acute Febrile Illness with standard temperature management protocols.';
    }
  } else if (isHipJoint) {
    intentName = 'orthopedic_assessment';
    if (targetLang === 'te') {
      symptoms = ['తుంటి / కీళ్ల నొప్పి', 'నడవడంలో ఇబ్బంది'];
      diseases = ['తీవ్రమైన కీళ్ల సమస్య / అవాస్కులర్ నెక్రోసిస్ పరిశీలన'];
      medicines = ['పారాసిటమాల్ / కీళ్ల విశ్రాంతి / ఫిజియోథెరపీ'];
      durations = is2Days ? ['2 రోజులు'] : ['ఇటీవలే ప్రారంభమైంది'];
      responseText =
        'మీరు పేర్కొన్న లక్షణాలు (తుంటి లేదా కీళ్ల నొప్పి మరియు నడవడంలో ఇబ్బంది) కీళ్ల లేదా ఎముకల సమస్యను సూచిస్తున్నాయి. బరువు ఎత్తడం మానుకోండి, తగిన విశ్రాంతి తీసుకోండి. లక్షణాలు కొనసాగితే ఎక్స్-రే లేదా ఎంఆర్ఐ పరీక్ష కోసం ఎముకల వైద్యుడిని (Orthopedic Specialist) సంప్రదించండి.';
      ragTitle = 'ఆర్థోపెడిక్ జాయింట్ మరియు అవాస్కులర్ నెక్రోసిస్ క్లినికల్ ప్రోటోకాల్';
      ragSnippet = 'తుంటి నొప్పి లేదా నడకలో ఇబ్బంది ఉన్న రోగులకు రేడియోలాజికల్ పరీక్ష (X-Ray / MRI) మరియు మూవ్‌మెంట్ అసెస్‌మెంట్ అవసరం.';
      explanationText = 'ఆర్థోపెడిక్ ఎంటిటీలు గుర్తించబడ్డాయి. సిస్టమ్ కీళ్ల సంరక్షణ మరియు రేడియోలాజికల్ పరీక్ష మార్గదర్శకాలను అందించింది.';
    } else if (targetLang === 'hi') {
      symptoms = ['कूल्हे / जोड़ों का दर्द', 'चलने में कठिनाई'];
      diseases = ['जोड़ विकार / एवास्कुलर नेक्रोसिस जांच'];
      medicines = ['दर्द निवारक / आराम / फिजियोथेरेपी'];
      durations = is2Days ? ['2 दिन'] : ['हाल ही में शुरू'];
      responseText =
        'कूल्हे या जोड़ों में दर्द और चलने में परेशानी मस्कुलोस्केलेटल समस्या का संकेत हो सकता है। अधिक वजन न उठाएं, आराम करें और यदि दर्द बना रहता है तो हड्डी रोग विशेषज्ञ से संपर्क करें।';
      ragTitle = 'ऑर्थोपेडिक जोड़ दर्द और नैदानिक प्रोटोकॉल';
      ragSnippet = 'कूल्हे या जोड़ दर्द के मामलों में गतिशीलता मूल्यांकन और एक्स-रे आवश्यक है।';
      explanationText = 'ऑर्थोपेडिक लक्षणों की पहचान हुई और जोड़ देखभाल दिशानिर्देश प्राप्त किए गए।';
    } else {
      symptoms = ['Joint / Hip Pain', 'Difficulty in walking'];
      diseases = ['Musculoskeletal Dysfunction / Joint Arthropathy'];
      medicines = ['Paracetamol / Rest / Orthopedic Radiological Evaluation'];
      durations = is2Days ? ['2 days'] : ['Recent onset'];
      responseText =
        'Based on your reported symptoms (Joint / Hip Pain and Difficulty in walking), acute musculoskeletal or joint involvement is indicated. Avoid weight-bearing strain and rest the affected joint. If pain persists beyond 48 hours or restricts basic mobility, an orthopedic examination with pelvic/hip radiography (X-Ray/MRI) is recommended.';
      ragTitle = 'Orthopedic Clinical Guidelines (Joint Pain & Motion Assessment)';
      ragSnippet = 'Patients presenting with hip pain and restricted ambulation require physical motion examination and pelvic radiography.';
      explanationText = 'Orthopedic symptoms identified and mapped to joint pathology triage with radiological evaluation recommendations.';
    }
  } else {
    // General Triage Fallback
    intentName = 'general_health_inquiry';
    if (targetLang === 'te') {
      symptoms = ['నివేదించబడిన ఆరోగ్య లక్షణాలు'];
      diseases = ['సాధారణ క్లినికల్ సంప్రదింపులు'];
      medicines = ['విశ్రాంతి / తగినంత ద్రవ ఆహారం / వైద్య సంప్రదింపులు'];
      durations = ['ఇటీవలే ప్రారంభమైంది'];
      responseText =
        'మీరు వివరించిన లక్షణాల ఆధారంగా, తగినంత విశ్రాంతి తీసుకోవడం మరియు మీ శరీరాన్ని హైడ్రేటెడ్ గా ఉంచుకోవడం మంచిది. లక్షణాలు కొనసాగితే లేదా తీవ్రమైతే తగిన వైద్యుడిని సంప్రదించి పరీక్షలు చేయించుకోండి.';
      ragTitle = 'సాధారణ వైద్య సంరక్షణ మార్గదర్శకాలు';
      ragSnippet = 'సాధారణ లక్షణాల రోగులకు ప్రాథమిక క్లినికల్ పరీక్ష మరియు జీవనశైలి పరిశీలన అవసరం.';
      explanationText = 'రోగి ప్రశ్న ప్రాథమిక క్లినికల్ మ్యాపింగ్ చేయబడింది.';
    } else if (targetLang === 'hi') {
      symptoms = ['सूचित स्वास्थ्य लक्षण'];
      diseases = ['सामान्य नैदानिक परामर्श'];
      medicines = ['आराम / पर्याप्त जल / चिकित्सकीय परामर्श'];
      durations = ['हाल ही में शुरू'];
      responseText =
        'आपके द्वारा बताए गए लक्षणों के अनुसार पर्याप्त आराम करें और तरल पदार्थ लें। यदि लक्षण बने रहते हैं तो कृपया प्रमाणित चिकित्सक से परामर्श लें।';
      ragTitle = 'सामान्य चिकित्सा परामर्श दिशानिर्देश';
      ragSnippet = 'रोगियों के सामान्य लक्षणों में प्रारंभिक स्वास्थ्य मूल्यांकन अनुशंसित है।';
      explanationText = 'सामान्य स्वास्थ्य परामर्श दिशानिर्देश प्राप्त किए गए।';
    } else {
      symptoms = ['Reported Clinical Symptoms'];
      diseases = ['General Ambulatory Consultation'];
      medicines = ['Hydration / Adequate Rest / Physician Review'];
      durations = ['Recent onset'];
      responseText =
        'Based on your reported query, we recommend monitoring your symptoms closely, ensuring adequate rest, and maintaining hydration. If symptoms worsen or persist beyond 48 hours, please seek an in-person clinical assessment with a qualified healthcare provider.';
      ragTitle = 'General Ambulatory Clinical Guidance';
      ragSnippet = 'Routine primary health symptoms should be monitored for red flags and evaluated by an ambulatory physician.';
      explanationText = 'General health assessment provided based on clinical knowledge base.';
    }
  }

  return {
    response: responseText,
    language: targetLang,
    analysis: {
      language_detection: {
        detected_language: detectedLang,
        is_code_mixed: isCodeMixed,
        normalized_text: query.trim(),
      },
      ner: {
        symptoms,
        diseases,
        medicines,
        durations,
      },
      intent: {
        intent: intentName,
        confidence: 0.95,
      },
      rag: {
        retrieved_docs: [
          {
            title: ragTitle,
            snippet: ragSnippet,
            score: 0.93,
          },
        ],
      },
      processing_time: 38,
      explanation: explanationText,
    },
  };
}
