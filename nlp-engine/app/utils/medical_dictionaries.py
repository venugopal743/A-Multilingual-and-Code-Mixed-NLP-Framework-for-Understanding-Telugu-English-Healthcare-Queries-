"""
Comprehensive medical dictionaries for Telugu, Hindi, and English.
Used for keyword-based NER, intent classification, and entity extraction.
"""

# ═══════════════════════════════════════════════════════════════════════════════
# SYMPTOMS
# ═══════════════════════════════════════════════════════════════════════════════

SYMPTOMS_EN = [
    "fever", "headache", "cough", "cold", "sore throat", "body pain",
    "fatigue", "nausea", "vomiting", "diarrhea", "constipation",
    "chest pain", "shortness of breath", "dizziness", "back pain",
    "joint pain", "stomach ache", "abdominal pain", "rash", "itching",
    "swelling", "bleeding", "weight loss", "weight gain", "insomnia",
    "anxiety", "depression", "numbness", "tingling", "blurred vision",
    "hearing loss", "ear pain", "runny nose", "sneezing", "wheezing",
    "palpitations", "muscle pain", "weakness", "loss of appetite",
    "excessive thirst", "frequent urination", "blood in urine",
    "blood in stool", "difficulty swallowing", "hoarseness",
    "night sweats", "chills", "cramps", "bruising", "dry mouth",
    "burning sensation", "stiffness", "tremors", "seizures",
    "confusion", "memory loss", "hair loss", "acne", "ulcers",
    "bloating", "heartburn", "acid reflux", "high blood pressure",
    "low blood pressure", "high sugar", "low sugar",
]

SYMPTOMS_HI = [
    "बुखार", "सिरदर्द", "खांसी", "सर्दी", "गले में दर्द", "बदन दर्द",
    "थकान", "जी मिचलाना", "उल्टी", "दस्त", "कब्ज",
    "सीने में दर्द", "सांस की तकलीफ", "चक्कर आना", "कमर दर्द",
    "जोड़ों में दर्द", "पेट दर्द", "पेट में दर्द", "दाने", "खुजली",
    "सूजन", "खून बहना", "वजन कम होना", "वजन बढ़ना", "नींद न आना",
    "चिंता", "अवसाद", "सुन्नपन", "झुनझुनी", "धुंधला दिखना",
    "सुनाई कम देना", "कान में दर्द", "नाक बहना", "छींक", "सांस में घरघराहट",
    "धड़कन तेज होना", "मांसपेशियों में दर्द", "कमजोरी", "भूख न लगना",
    "अत्यधिक प्यास", "बार बार पेशाब आना", "पेशाब में खून",
    "मल में खून", "निगलने में कठिनाई", "आवाज बैठना",
    "रात को पसीना आना", "ठंड लगना", "ऐंठन", "नील पड़ना", "मुंह सूखना",
    "जलन", "अकड़न", "कांपना", "मिर्गी", "भ्रम", "याददाश्त कम होना",
    "बाल झड़ना", "मुंहासे", "अल्सर", "पेट फूलना", "सीने में जलन",
    "एसिडिटी", "उच्च रक्तचाप", "निम्न रक्तचाप", "शुगर बढ़ना", "शुगर कम होना",
]

SYMPTOMS_TE = [
    "జ్వరం", "తలనొప్పి", "దగ్గు", "జలుబు", "గొంతు నొప్పి", "ఒళ్ళు నొప్పి",
    "అలసట", "వాంతి అనిపించడం", "వాంతులు", "విరేచనాలు", "మలబద్ధకం",
    "ఛాతీ నొప్పి", "ఊపిరి ఆడకపోవడం", "తల తిరగడం", "నడుము నొప్పి",
    "కీళ్ళ నొప్పి", "కడుపు నొప్పి", "పొట్ట నొప్పి", "దద్దుర్లు", "దురద",
    "వాపు", "రక్తస్రావం", "బరువు తగ్గడం", "బరువు పెరగడం", "నిద్ర రాకపోవడం",
    "ఆందోళన", "నిరాశ", "మొద్దుబారడం", "జలదరింపు", "మసకగా కనిపించడం",
    "వినికిడి తగ్గడం", "చెవి నొప్పి", "ముక్కు కారడం", "తుమ్ములు", "గురగురలు",
    "గుండె వేగంగా కొట్టుకోవడం", "కండరాల నొప్పి", "బలహీనత", "ఆకలి లేకపోవడం",
    "ఎక్కువ దాహం", "తరచుగా మూత్ర విసర్జన", "మూత్రంలో రక్తం",
    "మలంలో రక్తం", "మింగడంలో ఇబ్బంది", "గొంతు బొంగురుపోవడం",
    "రాత్రి చెమటలు", "చలి", "నొప్పులు", "కమిలిన గాయాలు", "నోరు ఎండిపోవడం",
    "మంట", "బిగుతు", "వణుకు", "మూర్ఛ", "గందరగోళం", "జ్ఞాపకశక్తి తగ్గడం",
    "జుట్టు రాలడం", "మొటిమలు", "పుండ్లు", "ఉబ్బరం", "గుండెల్లో మంట",
    "ఆమ్లత్వం", "అధిక రక్తపోటు", "తక్కువ రక్తపోటు", "షుగర్ ఎక్కువ", "షుగర్ తక్కువ",
]

# Romanized common terms (for code-mixed text)
SYMPTOMS_ROMANIZED = [
    "bukhar", "sir dard", "khansi", "sardi", "gale mein dard",
    "badan dard", "thakan", "ulti", "dast", "kabz", "seene mein dard",
    "sans ki taklif", "chakkar", "kamar dard", "jodon mein dard",
    "pet dard", "sujan", "khujli", "kamzori", "bhookh na lagna",
    "jwaram", "talanappi", "daggu", "jalubu", "gontu noppi",
    "vantulu", "kadupunoppi", "alasata",
]

# ═══════════════════════════════════════════════════════════════════════════════
# DISEASES
# ═══════════════════════════════════════════════════════════════════════════════

DISEASES_EN = [
    "diabetes", "hypertension", "asthma", "tuberculosis", "malaria",
    "dengue", "typhoid", "pneumonia", "bronchitis", "arthritis",
    "cancer", "heart disease", "kidney disease", "liver disease",
    "stroke", "epilepsy", "migraine", "anemia", "thyroid",
    "cholesterol", "covid", "coronavirus", "influenza", "flu",
    "hepatitis", "jaundice", "gastritis", "ulcer", "appendicitis",
    "hernia", "gallstones", "kidney stones", "urinary tract infection",
    "uti", "sinusitis", "tonsillitis", "conjunctivitis", "cataract",
    "glaucoma", "eczema", "psoriasis", "osteoporosis", "spondylitis",
    "sciatica", "vertigo", "depression disorder", "anxiety disorder",
    "allergy", "food poisoning", "dehydration",
]

DISEASES_HI = [
    "मधुमेह", "शुगर", "उच्च रक्तचाप", "हाई ब्लड प्रेशर", "दमा", "अस्थमा",
    "टीबी", "क्षय रोग", "मलेरिया", "डेंगू", "टाइफाइड", "निमोनिया",
    "ब्रोंकाइटिस", "गठिया", "कैंसर", "हृदय रोग", "दिल की बीमारी",
    "गुर्दे की बीमारी", "किडनी की बीमारी", "लिवर की बीमारी",
    "जिगर की बीमारी", "स्ट्रोक", "लकवा", "मिर्गी", "माइग्रेन",
    "एनीमिया", "खून की कमी", "थायराइड", "कोलेस्ट्रॉल",
    "कोविड", "कोरोना", "इन्फ्लुएंजा", "फ्लू", "हेपेटाइटिस",
    "पीलिया", "गैस्ट्राइटिस", "अल्सर", "अपेंडिसाइटिस",
    "हर्निया", "पित्त की पथरी", "गुर्दे की पथरी", "किडनी स्टोन",
    "मूत्र मार्ग संक्रमण", "साइनस", "टॉन्सिल",
    "आंख आना", "मोतियाबिंद", "काला मोतिया", "एक्जिमा",
    "सोरायसिस", "ऑस्टियोपोरोसिस", "स्पॉन्डिलाइटिस",
    "साइटिका", "चक्कर की बीमारी", "एलर्जी", "फूड पॉइजनिंग", "डिहाइड्रेशन",
]

DISEASES_TE = [
    "మధుమేహం", "షుగర్ వ్యాధి", "అధిక రక్తపోటు", "హై బీపీ", "ఆస్తమా", "ఉబ్బసం",
    "టీబీ", "క్షయ", "మలేరియా", "డెంగ్యూ", "టైఫాయిడ్", "న్యుమోనియా",
    "బ్రాంకైటిస్", "కీళ్ళవాతం", "క్యాన్సర్", "గుండె జబ్బు",
    "మూత్రపిండాల వ్యాధి", "కిడ్నీ వ్యాధి", "కాలేయ వ్యాధి", "లివర్ వ్యాధి",
    "పక్షవాతం", "మూర్ఛ వ్యాధి", "మైగ్రేన్", "రక్తహీనత",
    "థైరాయిడ్", "కొలెస్ట్రాల్", "కోవిడ్", "కరోనా", "ఇన్ఫ్లుయెంజా",
    "ఫ్లూ", "హెపటైటిస్", "కామెర్లు", "గ్యాస్ట్రైటిస్", "అల్సర్",
    "అపెండిసైటిస్", "హెర్నియా", "పిత్తాశయ రాళ్ళు", "మూత్రపిండాల రాళ్ళు",
    "కిడ్నీ స్టోన్స్", "మూత్ర మార్గ సంక్రమణం", "సైనసైటిస్",
    "టాన్సిలైటిస్", "కంటివాపు", "కంటి శుక్లం", "గ్లాకోమా",
    "ఎగ్జిమా", "సోరియాసిస్", "ఆస్టియోపోరోసిస్",
    "స్పాండిలైటిస్", "సయాటికా", "అలర్జీ", "ఫుడ్ పాయిజనింగ్", "నిర్జలీకరణం",
]

# ═══════════════════════════════════════════════════════════════════════════════
# MEDICINES / TREATMENTS
# ═══════════════════════════════════════════════════════════════════════════════

MEDICINES_EN = [
    "paracetamol", "ibuprofen", "aspirin", "amoxicillin", "azithromycin",
    "ciprofloxacin", "metformin", "insulin", "amlodipine", "atenolol",
    "omeprazole", "pantoprazole", "cetirizine", "montelukast",
    "salbutamol", "prednisolone", "doxycycline", "metronidazole",
    "diclofenac", "tramadol", "gabapentin", "losartan", "atorvastatin",
    "clopidogrel", "warfarin", "levothyroxine", "multivitamin",
    "calcium", "iron supplement", "vitamin d", "vitamin b12",
    "antacid", "cough syrup", "eye drops", "ear drops", "ointment",
    "injection", "iv fluid", "saline", "antibiotic", "painkiller",
    "tablet", "capsule", "syrup", "cream", "gel",
]

MEDICINES_HI = [
    "पैरासिटामोल", "आइबुप्रोफेन", "एस्पिरिन", "एमोक्सिसिलिन",
    "एज़िथ्रोमाइसिन", "मेटफॉर्मिन", "इंसुलिन", "एंटीबायोटिक",
    "दर्द की दवा", "खांसी की दवा", "बुखार की दवा", "सर्दी की दवा",
    "पेट की दवा", "एंटासिड", "मल्टीविटामिन", "कैल्शियम",
    "आयरन की गोली", "विटामिन डी", "विटामिन बी12",
    "गोली", "कैप्सूल", "सिरप", "मरहम", "इंजेक्शन",
    "आई ड्रॉप्स", "ड्रिप", "सलाइन", "क्रीम", "जेल",
]

MEDICINES_TE = [
    "పారాసిటమాల్", "ఐబుప్రోఫెన్", "ఆస్పిరిన్", "అమాక్సిసిలిన్",
    "అజిత్రోమైసిన్", "మెట్ఫార్మిన్", "ఇన్సులిన్", "యాంటీబయాటిక్",
    "నొప్పి మందు", "దగ్గు మందు", "జ్వరం మందు", "జలుబు మందు",
    "కడుపు మందు", "యాంటాసిడ్", "మల్టీవిటమిన్", "కాల్షియం",
    "ఐరన్ మాత్ర", "విటమిన్ డి", "విటమిన్ బి12",
    "మాత్ర", "క్యాప్సూల్", "సిరప్", "మలాం", "ఇంజెక్షన్",
    "కంటి చుక్కలు", "డ్రిప్", "సెలైన్", "క్రీమ్", "జెల్",
]

# ═══════════════════════════════════════════════════════════════════════════════
# BODY PARTS
# ═══════════════════════════════════════════════════════════════════════════════

BODY_PARTS_EN = [
    "head", "brain", "eye", "eyes", "ear", "ears", "nose", "mouth",
    "throat", "neck", "shoulder", "arm", "elbow", "wrist", "hand",
    "finger", "chest", "heart", "lung", "lungs", "stomach", "abdomen",
    "liver", "kidney", "kidneys", "intestine", "spine", "back",
    "hip", "knee", "leg", "ankle", "foot", "toe", "skin", "bone",
    "muscle", "blood", "nerve", "tooth", "teeth", "tongue", "jaw",
    "rib", "pelvis", "bladder", "uterus", "ovary", "prostate",
]

BODY_PARTS_HI = [
    "सिर", "दिमाग", "आंख", "आंखें", "कान", "नाक", "मुंह",
    "गला", "गर्दन", "कंधा", "बांह", "कोहनी", "कलाई", "हाथ",
    "उंगली", "सीना", "छाती", "दिल", "फेफड़ा", "फेफड़े", "पेट",
    "लिवर", "जिगर", "गुर्दा", "किडनी", "आंत", "रीढ़", "पीठ", "कमर",
    "कूल्हा", "घुटना", "टांग", "टखना", "पैर", "अंगूठा", "त्वचा", "चमड़ी",
    "हड्डी", "मांसपेशी", "खून", "रक्त", "नस", "दांत", "जीभ", "जबड़ा",
    "पसली", "मूत्राशय", "गर्भाशय",
]

BODY_PARTS_TE = [
    "తల", "మెదడు", "కన్ను", "కళ్ళు", "చెవి", "ముక్కు", "నోరు",
    "గొంతు", "మెడ", "భుజం", "చేయి", "మోచేయి", "మణికట్టు", "చేతులు",
    "వేలు", "ఛాతీ", "గుండె", "ఊపిరితిత్తి", "ఊపిరితిత్తులు", "కడుపు", "పొట్ట",
    "కాలేయం", "లివర్", "మూత్రపిండం", "కిడ్నీ", "ప్రేగు", "వెన్నెముక", "వీపు", "నడుము",
    "తుంటి", "మోకాలు", "కాలు", "చీలమండ", "పాదం", "కాలి వేలు", "చర్మం",
    "ఎముక", "కండరం", "రక్తం", "నరం", "పన్ను", "నాలుక", "దవడ",
    "పక్కటెముక", "మూత్రాశయం", "గర్భాశయం",
]

# ═══════════════════════════════════════════════════════════════════════════════
# HOSPITAL / DOCTOR TERMS
# ═══════════════════════════════════════════════════════════════════════════════

HOSPITAL_DOCTOR_EN = [
    "hospital", "clinic", "doctor", "physician", "surgeon", "specialist",
    "nurse", "pharmacist", "pharmacy", "lab", "laboratory", "ward",
    "icu", "emergency", "ambulance", "appointment", "consultation",
    "checkup", "test", "scan", "x-ray", "mri", "ct scan", "ultrasound",
    "blood test", "urine test", "biopsy", "surgery", "operation",
    "cardiologist", "neurologist", "orthopedic", "dermatologist",
    "gynecologist", "pediatrician", "ent", "ophthalmologist",
    "psychiatrist", "dentist", "urologist", "oncologist",
    "general practitioner", "gp", "opd", "ipd",
]

HOSPITAL_DOCTOR_HI = [
    "अस्पताल", "हॉस्पिटल", "क्लिनिक", "डॉक्टर", "वैद्य", "चिकित्सक",
    "सर्जन", "विशेषज्ञ", "नर्स", "दवाखाना", "फार्मेसी", "लैब",
    "प्रयोगशाला", "वार्ड", "आईसीयू", "इमरजेंसी", "आपातकालीन",
    "एम्बुलेंस", "अपॉइंटमेंट", "मुलाकात", "जांच", "परामर्श",
    "एक्स-रे", "एमआरआई", "सीटी स्कैन", "अल्ट्रासाउंड", "सोनोग्राफी",
    "खून की जांच", "पेशाब की जांच", "बायोप्सी", "सर्जरी", "ऑपरेशन",
    "हृदय रोग विशेषज्ञ", "न्यूरोलॉजिस्ट", "हड्डी का डॉक्टर",
    "त्वचा विशेषज्ञ", "स्त्री रोग विशेषज्ञ", "बच्चों का डॉक्टर",
    "नाक कान गला विशेषज्ञ", "आंखों का डॉक्टर",
    "मनोचिकित्सक", "दंत चिकित्सक", "ओपीडी",
]

HOSPITAL_DOCTOR_TE = [
    "ఆసుపత్రి", "హాస్పిటల్", "క్లినిక్", "డాక్టర్", "వైద్యుడు",
    "సర్జన్", "నిపుణుడు", "నర్సు", "మందుల దుకాణం", "ఫార్మసీ", "ల్యాబ్",
    "ప్రయోగశాల", "వార్డు", "ఐసీయూ", "ఎమర్జెన్సీ", "అత్యవసరం",
    "అంబులెన్స్", "అపాయింట్‌మెంట్", "సంప్రదింపు", "పరీక్ష", "చెకప్",
    "ఎక్స్-రే", "ఎంఆర్ఐ", "సీటీ స్కాన్", "అల్ట్రాసౌండ్",
    "రక్త పరీక్ష", "మూత్ర పరీక్ష", "బయాప్సీ", "సర్జరీ", "ఆపరేషన్",
    "హృద్రోగ నిపుణుడు", "న్యూరాలజిస్ట్", "ఎముకల డాక్టర్",
    "చర్మ వైద్యుడు", "స్త్రీ రోగ నిపుణుడు", "పిల్లల డాక్టర్",
    "చెవి ముక్కు గొంతు నిపుణుడు", "కంటి డాక్టర్",
    "మానసిక వైద్యుడు", "దంత వైద్యుడు", "ఓపీడీ",
]

# ═══════════════════════════════════════════════════════════════════════════════
# INTENT KEYWORDS — for all 8 categories in all 3 languages
# ═══════════════════════════════════════════════════════════════════════════════

INTENT_KEYWORDS = {
    "symptom_inquiry": {
        "en": [
            "symptom", "symptoms", "feeling", "experiencing", "suffer",
            "having", "problem", "issue", "pain", "ache", "hurt", "hurts",
            "discomfort", "what does it mean", "why am i", "i have",
            "i feel", "started having", "been having", "sign", "signs",
        ],
        "hi": [
            "लक्षण", "तकलीफ", "परेशानी", "दर्द", "समस्या", "दिक्कत",
            "महसूस", "हो रहा", "हो रही", "हो रहे", "शिकायत", "पीड़ा",
            "कष्ट", "मुझे", "मेरे", "मेरा", "मेरी", "क्यों हो रहा",
            "क्या मतलब", "होने लगा", "होने लगी",
        ],
        "te": [
            "లక్షణం", "లక్షణాలు", "సమస్య", "ఇబ్బంది", "నొప్పి", "బాధ",
            "ఉంది", "వస్తోంది", "అవుతోంది", "నాకు", "నాకు ఉంది",
            "ఎందుకు", "ఏమిటి", "మొదలైంది", "వచ్చింది",
        ],
    },
    "disease_information": {
        "en": [
            "disease", "condition", "disorder", "syndrome", "what is",
            "tell me about", "information about", "causes", "caused by",
            "diagnosis", "prognosis", "stages", "types", "cure",
            "treatable", "contagious", "hereditary", "chronic", "acute",
        ],
        "hi": [
            "बीमारी", "रोग", "क्या है", "बताइए", "जानकारी", "कारण",
            "इलाज", "निदान", "प्रकार", "संक्रामक", "वंशानुगत",
            "पुरानी बीमारी", "जानलेवा", "के बारे में", "कैसे होता है",
        ],
        "te": [
            "వ్యాధి", "జబ్బు", "రోగం", "ఏమిటి", "చెప్పండి", "సమాచారం",
            "కారణం", "కారణాలు", "చికిత్స", "నిర్ధారణ", "రకాలు",
            "అంటువ్యాధి", "వంశపారంపర్యం", "గురించి", "ఎలా వస్తుంది",
        ],
    },
    "medicine_information": {
        "en": [
            "medicine", "medication", "drug", "tablet", "capsule", "syrup",
            "dosage", "dose", "side effect", "side effects", "prescribed",
            "prescription", "take", "how to take", "alternative",
            "generic", "brand", "interaction", "contraindication",
        ],
        "hi": [
            "दवा", "दवाई", "गोली", "कैप्सूल", "सिरप", "खुराक",
            "डोज", "साइड इफेक्ट", "असर", "दुष्प्रभाव", "कैसे खाएं",
            "कब खाएं", "विकल्प", "नुस्खा", "पर्ची",
        ],
        "te": [
            "మందు", "మాత్ర", "క్యాప్సూల్", "సిరప్", "మోతాదు",
            "దుష్ప్రభావాలు", "ఎలా తీసుకోవాలి", "ఎప్పుడు తీసుకోవాలి",
            "ప్రత్యామ్నాయం", "ప్రిస్క్రిప్షన్",
        ],
    },
    "hospital_search": {
        "en": [
            "hospital", "clinic", "medical center", "health center",
            "nearby", "near me", "closest", "best hospital", "where",
            "location", "address", "available", "open", "24 hours",
            "emergency room", "er",
        ],
        "hi": [
            "अस्पताल", "हॉस्पिटल", "क्लिनिक", "नजदीक", "पास में",
            "कहां", "कहाँ", "सबसे अच्छा", "पता", "खुला",
            "इमरजेंसी", "आपातकालीन",
        ],
        "te": [
            "ఆసుపత్రి", "హాస్పిటల్", "క్లినిక్", "దగ్గరలో", "సమీపంలో",
            "ఎక్కడ", "మంచి ఆసుపత్రి", "చిరునామా", "తెరిచి ఉంది",
            "ఎమర్జెన్సీ",
        ],
    },
    "doctor_information": {
        "en": [
            "doctor", "specialist", "physician", "surgeon", "which doctor",
            "consult", "see a doctor", "recommend doctor", "best doctor",
            "experience", "qualification", "reviews",
        ],
        "hi": [
            "डॉक्टर", "विशेषज्ञ", "चिकित्सक", "कौन सा डॉक्टर",
            "किस डॉक्टर", "दिखाना", "मिलना", "सबसे अच्छा डॉक्टर",
            "अनुभव", "योग्यता", "सलाह",
        ],
        "te": [
            "డాక్టర్", "నిపుణుడు", "వైద్యుడు", "ఏ డాక్టర్",
            "చూపించుకోవాలి", "సంప్రదించాలి", "మంచి డాక్టర్",
            "అనుభవం", "సిఫార్సు",
        ],
    },
    "appointment_inquiry": {
        "en": [
            "appointment", "book", "schedule", "reserve", "slot",
            "available time", "when can i", "timing", "visiting hours",
            "token", "queue", "waiting time", "cancel appointment",
            "reschedule",
        ],
        "hi": [
            "अपॉइंटमेंट", "बुक", "समय", "कब मिल सकते", "टोकन",
            "लाइन", "कतार", "इंतज़ार", "रद्द", "बदलना", "मुलाकात",
            "मिलने का समय",
        ],
        "te": [
            "అపాయింట్‌మెంట్", "బుక్", "సమయం", "ఎప్పుడు కలవచ్చు",
            "టోకెన్", "క్యూ", "వేచి ఉండు సమయం", "రద్దు", "మార్చు",
            "కలవడం",
        ],
    },
    "emergency_assistance": {
        "en": [
            "emergency", "urgent", "critical", "severe", "immediately",
            "right now", "help", "life threatening", "accident",
            "unconscious", "bleeding heavily", "heart attack", "stroke",
            "choking", "seizure", "ambulance", "911", "108",
        ],
        "hi": [
            "इमरजेंसी", "आपातकालीन", "तुरंत", "जल्दी", "गंभीर",
            "खतरनाक", "मदद", "बचाओ", "एक्सीडेंट", "दुर्घटना",
            "बेहोश", "हार्ट अटैक", "दिल का दौरा", "एम्बुलेंस",
            "108", "खून बह रहा", "सांस नहीं आ रही",
        ],
        "te": [
            "ఎమర్జెన్సీ", "అత్యవసరం", "వెంటనే", "తీవ్రమైన",
            "ప్రమాదకరమైన", "సహాయం", "ప్రమాదం", "స్పృహ తప్పడం",
            "హార్ట్ ఎటాక్", "గుండెపోటు", "అంబులెన్స్",
            "108", "రక్తం కారుతోంది", "ఊపిరి ఆడటం లేదు",
        ],
    },
    "general_health_info": {
        "en": [
            "health", "healthy", "diet", "nutrition", "exercise",
            "wellness", "prevention", "precaution", "immunity",
            "vaccination", "vaccine", "fitness", "yoga", "meditation",
            "sleep", "stress", "lifestyle", "habits", "tips",
            "how to prevent", "how to stay healthy",
        ],
        "hi": [
            "स्वास्थ्य", "स्वस्थ", "आहार", "खानपान", "व्यायाम",
            "कसरत", "योग", "ध्यान", "रोकथाम", "बचाव", "टीका",
            "टीकाकरण", "प्रतिरक्षा", "इम्यूनिटी", "नींद", "तनाव",
            "जीवनशैली", "सुझाव", "उपाय",
        ],
        "te": [
            "ఆరోగ్యం", "ఆరోగ్యకరమైన", "ఆహారం", "పోషణ", "వ్యాయామం",
            "యోగా", "ధ్యానం", "నివారణ", "జాగ్రత్తలు", "టీకా",
            "వ్యాక్సిన్", "రోగనిరోధక శక్తి", "నిద్ర", "ఒత్తిడి",
            "జీవనశైలి", "చిట్కాలు", "సలహాలు",
        ],
    },
}

# ═══════════════════════════════════════════════════════════════════════════════
# MEDICAL DISCLAIMERS
# ═══════════════════════════════════════════════════════════════════════════════

MEDICAL_DISCLAIMERS = {
    "en": (
        "⚠️ DISCLAIMER: This information is for educational purposes only "
        "and should NOT be considered as medical advice. Please consult a "
        "qualified healthcare professional for proper diagnosis and treatment."
    ),
    "hi": (
        "⚠️ अस्वीकरण: यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है "
        "और इसे चिकित्सा सलाह के रूप में नहीं माना जाना चाहिए। "
        "कृपया उचित निदान और उपचार के लिए किसी योग्य चिकित्सक से परामर्श करें।"
    ),
    "te": (
        "⚠️ నిరాకరణ: ఈ సమాచారం విద్యా ప్రయోజనాల కోసం మాత్రమే "
        "మరియు వైద్య సలహాగా పరిగణించకూడదు. "
        "సరైన రోగ నిర్ధారణ మరియు చికిత్స కోసం అర్హత కలిగిన వైద్య నిపుణుడిని సంప్రదించండి."
    ),
}

# ═══════════════════════════════════════════════════════════════════════════════
# RESPONSE TEMPLATES
# ═══════════════════════════════════════════════════════════════════════════════

RESPONSE_TEMPLATES = {
    "symptom_inquiry": {
        "en": "Based on your described symptoms ({symptoms}), here is some relevant information:\n\n{info}\n\nPlease consult a doctor for proper evaluation.",
        "hi": "आपके बताए गए लक्षणों ({symptoms}) के आधार पर, यहाँ कुछ प्रासंगिक जानकारी है:\n\n{info}\n\nकृपया उचित मूल्यांकन के लिए डॉक्टर से परामर्श करें।",
        "te": "మీరు వివరించిన లక్షణాల ({symptoms}) ఆధారంగా, ఇక్కడ కొంత సంబంధిత సమాచారం ఉంది:\n\n{info}\n\nసరైన మూల్యాంకనం కోసం దయచేసి వైద్యుడిని సంప్రదించండి.",
    },
    "disease_information": {
        "en": "Here is information about {disease}:\n\n{info}\n\nPlease consult a healthcare professional for detailed guidance.",
        "hi": "{disease} के बारे में जानकारी:\n\n{info}\n\nविस्तृत मार्गदर्शन के लिए कृपया स्वास्थ्य पेशेवर से संपर्क करें।",
        "te": "{disease} గురించి సమాచారం:\n\n{info}\n\nవివరమైన మార్గదర్శకత్వం కోసం దయచేసి ఆరోగ్య నిపుణుడిని సంప్రదించండి.",
    },
    "medicine_information": {
        "en": "Regarding the medicine/treatment ({medicine}):\n\n{info}\n\nAlways follow your doctor's prescription and dosage instructions.",
        "hi": "दवा/उपचार ({medicine}) के संबंध में:\n\n{info}\n\nहमेशा अपने डॉक्टर के प्रिस्क्रिप्शन और खुराक के निर्देशों का पालन करें।",
        "te": "మందు/చికిత్స ({medicine}) గురించి:\n\n{info}\n\nఎల్లప్పుడూ మీ డాక్టర్ ప్రిస్క్రిప్షన్ మరియు మోతాదు సూచనలను అనుసరించండి.",
    },
    "hospital_search": {
        "en": "Here is some information that may help you find a hospital or clinic:\n\n{info}",
        "hi": "अस्पताल या क्लिनिक खोजने में मदद करने के लिए कुछ जानकारी:\n\n{info}",
        "te": "ఆసుపత్రి లేదా క్లినిక్ కనుగొనడంలో సహాయపడే సమాచారం:\n\n{info}",
    },
    "doctor_information": {
        "en": "Here is information about doctors/specialists relevant to your query:\n\n{info}",
        "hi": "आपकी पूछताछ से संबंधित डॉक्टरों/विशेषज्ञों की जानकारी:\n\n{info}",
        "te": "మీ ప్రశ్నకు సంబంధించిన డాక్టర్లు/నిపుణుల సమాచారం:\n\n{info}",
    },
    "appointment_inquiry": {
        "en": "Regarding appointment booking:\n\n{info}\n\nPlease contact the hospital directly for scheduling.",
        "hi": "अपॉइंटमेंट बुकिंग के बारे में:\n\n{info}\n\nकृपया शेड्यूलिंग के लिए सीधे अस्पताल से संपर्क करें।",
        "te": "అపాయింట్‌మెంట్ బుకింగ్ గురించి:\n\n{info}\n\nషెడ్యూలింగ్ కోసం దయచేసి నేరుగా ఆసుపత్రిని సంప్రదించండి.",
    },
    "emergency_assistance": {
        "en": "🚨 EMERGENCY: If you are experiencing a medical emergency, please call 108 (ambulance) or go to the nearest emergency room immediately!\n\n{info}",
        "hi": "🚨 आपातकाल: यदि आप चिकित्सा आपातकाल का अनुभव कर रहे हैं, तो कृपया तुरंत 108 (एम्बुलेंस) पर कॉल करें या निकटतम इमरजेंसी रूम में जाएं!\n\n{info}",
        "te": "🚨 అత్యవసరం: మీరు వైద్య అత్యవసర పరిస్థితిని ఎదుర్కొంటున్నట్లయితే, దయచేసి వెంటనే 108 (అంబులెన్స్) కు కాల్ చేయండి లేదా సమీపంలోని ఎమర్జెన్సీ రూమ్‌కు వెళ్ళండి!\n\n{info}",
    },
    "general_health_info": {
        "en": "Here is some general health information related to your query:\n\n{info}",
        "hi": "आपके प्रश्न से संबंधित कुछ सामान्य स्वास्थ्य जानकारी:\n\n{info}",
        "te": "మీ ప్రశ్నకు సంబంధించిన కొన్ని సాధారణ ఆరోగ్య సమాచారం:\n\n{info}",
    },
}
