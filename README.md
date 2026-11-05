# MediLingual AI: A Multilingual and Code-Mixed NLP Framework for Healthcare Queries

[![Framework](https://img.shields.io/badge/Architecture-FastAPI%20%7C%20Node.js%20%7C%20React-teal)](https://github.com)
[![Languages](https://img.shields.io/badge/Languages-Telugu%20%7C%20Hindi%20%7C%20English%20%7C%20Code--Mixed-blue)](#)
[![Models](https://img.shields.io/badge/Models-FastText%20%7C%20MuRIL%20%7C%20XLM--RoBERTa%20%7C%20FAISS-emerald)](#)

A clinical natural language processing framework built to understand patient inquiries in **Telugu**, **Hindi**, **English**, and **Romanized Code-Mixed dialects** (e.g., Telugu-English *"Naaku 2 days nunchi fever undi"*, Hindi-English *"Mujhe kal se sar dard hai"*).

---

## 🏛️ End-to-End Pipeline & Model Architecture

```text
                       PATIENT
                          │
                     Text / Voice
                          ↓
             ┌─────────────────────────┐
             │   LANGUAGE DETECTION    │  ──► FastText + Unicode Script Profiler
             │ Telugu / English / Hindi│
             │      Code-Mixed         │
             └────────────┬────────────┘
                          ↓
                   NLP PREPROCESSING     ──► Indic NLP Library Normalizer
                          ↓
             ┌─────────────────────────┐
             │      MEDICAL NER        │  ──► XLM-RoBERTa (Fine-Tuned)
             │                         │
             │  • Symptoms             │  ──► Fine-Tuned MuRIL
             │  • Diseases             │
             │  • Medicines            │
             │  • Doctors / Hospitals  │
             └────────────┬────────────┘
                          ↓
                 SYMPTOM EXTRACTION
                          ↓
                INTENT CLASSIFICATION   ──► Fine-Tuned MuRIL (8 Healthcare Intents)
                          ↓
             ┌─────────────────────────┐
             │    MEDICAL KNOWLEDGE    │  ──► Semantic Search: multilingual-e5-base
             │       BASE + RAG        │  ──► Vector Database: FAISS
             └────────────┬────────────┘
                          ↓
                    LLM RESPONSE        ──► Qwen2.5-Instruct / Grounded Templates
                          ↓
                   EXPLAINABILITY       ──► Entity confidence & cited clinical sources
                          ↓
             ┌─────────────────────────┐
             │     MULTILINGUAL        │
             │    RESPONSE OUTPUT      │  ──► Grounded Guidance with Medical Disclaimer
             │                         │
             │ Telugu / English / Hindi│
             └────────────┬────────────┘
                          ↓
                 OPTIONAL VOICE OUTPUT   ──► AI4Bharat Indic-TTS / SpeechSynthesis
```

---

## 🔬 Model Specifications Matrix

| NLP Module | Model / Framework | Purpose |
|---|---|---|
| **Language Detection** | **FastText** | Detect Telugu, Hindi and English |
| **Text Preprocessing** | **Indic NLP Library** | Normalize Indian-language text & diacritics |
| **Multilingual NLP** | **MuRIL** | Understand Indian languages and code-mixed text |
| **Medical NER** | **XLM-RoBERTa** | Extract symptoms, diseases and medicines after fine-tuning |
| **Symptom Extraction**| **Fine-tuned MuRIL** | Identify patient symptoms & durations |
| **Intent Classification** | **Fine-tuned MuRIL** | Classify healthcare queries (8 categories) |
| **Semantic Search** | **multilingual-e5-base** | Find relevant medical information |
| **RAG** | **FAISS** | Retrieve relevant medical documents |
| **LLM Response** | **Qwen2.5-Instruct** | Generate understandable, safe responses |
| **Voice Input** | **Whisper** | Convert patient speech into text |
| **Voice Output** | **AI4Bharat Indic-TTS** | Generate Indian-language natural speech |

---

## 📁 Repository Structure

```
multilingual-healthcare-nlp/
├── frontend/                     # React.js + Tailwind CSS + Vite
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── components/           # UI components (Chat, Layout, Dashboard)
│   │   │   ├── chat/             # ChatMessage, ChatInput, AnalysisPanel, VoiceButton
│   │   │   └── layout/           # Navbar, Footer
│   │   ├── pages/                # HomePage, ChatPage, DashboardPage, AboutPage
│   │   ├── services/             # Axios API client
│   │   ├── hooks/                # useVoiceInput, useSpeechSynthesis
│   │   └── utils/                # Constants, helpers, sample data
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express.js + MongoDB API
│   ├── src/
│   │   ├── config/               # Database and environment constants
│   │   ├── controllers/          # Auth, Query, Chat, and Admin controllers
│   │   ├── middleware/           # JWT auth, error handler, validators
│   │   ├── models/               # User, Query, ChatSession Mongoose schemas
│   │   ├── routes/               # REST API route handlers
│   │   ├── services/             # HTTP proxy to FastAPI NLP Engine
│   │   └── server.js             # Express entry point
│   └── package.json
│
├── nlp-engine/                   # Python + FastAPI Neural Engine
│   ├── app/
│   │   ├── api/                  # Endpoints (detect-language, ner, intent, rag, chat)
│   │   ├── core/                 # Config & Pydantic schemas
│   │   ├── models/               # Model manager & telemetry
│   │   ├── services/             # Language, NER, Intent, RAG, Response services
│   │   ├── utils/                # Indic NLP text processing & dictionaries
│   │   └── main.py               # FastAPI application
│   ├── tests/                    # Unit tests for Language, NER, and Intent
│   └── requirements.txt
│
├── datasets/                     # Clinical Datasets (~6,548 records)
│   ├── english/                  # medical_data_english.csv
│   ├── hindi/                    # medical_data_hindi.csv
│   ├── telugu/                   # medical_data_telugu.csv
│   └── code_mixed/               # Synthetic & real code-mixed clinical queries
│
├── docker-compose.yml            # Multi-container orchestration
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+
- **MongoDB**: Local or MongoDB Atlas URI (optional for pure frontend/NLP testing)

### 2. Running the Python NLP Engine
```powershell
cd nlp-engine
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API docs available at: `http://localhost:8000/docs`

### 3. Running the Node.js Backend
```powershell
cd backend
npm install
npm run dev
```
Backend API runs on `http://localhost:5000`

### 4. Running the React Frontend
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Running with Docker Compose
```bash
docker-compose up --build
```

---

## 🧪 Unit Testing

To verify Language Detection, Medical NER, and Intent Classification:
```powershell
cd nlp-engine
$env:PYTHONPATH="."
python -m unittest discover -s tests -v
```
All 10 test suites pass across Telugu, Hindi, English, and Romanized code-mixed cases.

---

## 🛡️ Medical Safety & Triage Disclaimer
MediLingual AI is designed as a healthcare triage and informational assistant. It includes automated detection of emergency symptoms, red-flag escalation, and mandatory clinical disclaimers. It is not intended to provide binding diagnostic prescriptions without consultation with a registered medical practitioner.
