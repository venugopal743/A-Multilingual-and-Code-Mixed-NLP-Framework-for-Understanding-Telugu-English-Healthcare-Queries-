"""
Text utility functions for multilingual healthcare NLP.
Handles cleaning, tokenization, transliteration, and abbreviation expansion.
"""

import re
import unicodedata
import logging
from typing import List, Tuple

logger = logging.getLogger(__name__)

# ── Unicode Script Ranges ────────────────────────────────────────────────────

TELUGU_RANGE = (0x0C00, 0x0C7F)
DEVANAGARI_RANGE = (0x0900, 0x097F)
LATIN_RANGE_BASIC = (0x0041, 0x007A)
DIGIT_RANGE = (0x0030, 0x0039)

# ── Medical Abbreviation Dictionaries ────────────────────────────────────────

MEDICAL_ABBREVIATIONS = {
    "bp": "blood pressure",
    "hr": "heart rate",
    "rr": "respiratory rate",
    "temp": "temperature",
    "spo2": "oxygen saturation",
    "ecg": "electrocardiogram",
    "ekg": "electrocardiogram",
    "ct": "computed tomography",
    "mri": "magnetic resonance imaging",
    "uti": "urinary tract infection",
    "copd": "chronic obstructive pulmonary disease",
    "tb": "tuberculosis",
    "hiv": "human immunodeficiency virus",
    "aids": "acquired immunodeficiency syndrome",
    "icu": "intensive care unit",
    "opd": "outpatient department",
    "ipd": "inpatient department",
    "ent": "ear nose throat",
    "gp": "general practitioner",
    "rx": "prescription",
    "dx": "diagnosis",
    "sx": "symptoms",
    "tx": "treatment",
    "hx": "history",
    "bmi": "body mass index",
    "cbc": "complete blood count",
    "esr": "erythrocyte sedimentation rate",
    "hba1c": "glycated hemoglobin",
    "ldl": "low density lipoprotein",
    "hdl": "high density lipoprotein",
    "iv": "intravenous",
    "im": "intramuscular",
    "od": "once daily",
    "bd": "twice daily",
    "tid": "three times daily",
    "qid": "four times daily",
    "prn": "as needed",
    "pcm": "paracetamol",
}


def get_script(char: str) -> str:
    """Determine the Unicode script of a character.

    Returns one of: 'telugu', 'devanagari', 'latin', 'digit', 'punctuation', 'other'.
    """
    code = ord(char)
    if TELUGU_RANGE[0] <= code <= TELUGU_RANGE[1]:
        return "telugu"
    if DEVANAGARI_RANGE[0] <= code <= DEVANAGARI_RANGE[1]:
        return "devanagari"
    if char.isascii() and char.isalpha():
        return "latin"
    if char.isdigit():
        return "digit"
    if unicodedata.category(char).startswith("P") or char in " \t\n\r":
        return "punctuation"
    return "other"


def clean_text(text: str) -> str:
    """Clean text by normalizing whitespace and removing control characters.

    Preserves Telugu and Hindi script characters.
    """
    if not text:
        return ""
    # Normalize Unicode (NFC form preserves composed characters)
    text = unicodedata.normalize("NFC", text)
    # Remove zero-width characters but keep ZWNJ which is used in Indic scripts
    text = re.sub(r"[\u200b\u200c\ufeff]", "", text)
    # Remove control characters except common whitespace
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_text(text: str) -> str:
    """Normalize text for NLP processing.

    - Lowercases Latin characters only
    - Standardizes punctuation
    - Normalizes whitespace
    - Keeps Indic script characters as-is
    """
    if not text:
        return ""
    text = clean_text(text)
    # Lowercase only ASCII/Latin characters; leave Indic scripts unchanged
    result = []
    for char in text:
        script = get_script(char)
        if script == "latin":
            result.append(char.lower())
        else:
            result.append(char)
    text = "".join(result)
    # Standardize common punctuation
    text = text.replace("\u2018", "'").replace("\u2019", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = re.sub(r"\.{2,}", ".", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize_multilingual(text: str) -> List[str]:
    """Tokenize multilingual text, handling Telugu, Hindi, and English.

    Splits on whitespace and punctuation while keeping Indic words intact.
    """
    if not text:
        return []
    # Split on whitespace first
    raw_tokens = text.split()
    tokens = []
    for raw in raw_tokens:
        # Check if the token is purely one script; if so, keep it together
        scripts_in_token = set()
        for ch in raw:
            s = get_script(ch)
            if s not in ("punctuation", "digit", "other"):
                scripts_in_token.add(s)

        if len(scripts_in_token) <= 1:
            # Strip edge punctuation but keep the token
            cleaned = raw.strip(".,;:!?\"'()[]{}…।|")
            if cleaned:
                tokens.append(cleaned)
        else:
            # Mixed-script token — split at script boundaries
            current = []
            prev_script = None
            for ch in raw:
                s = get_script(ch)
                if s == "punctuation":
                    if current:
                        tokens.append("".join(current))
                        current = []
                        prev_script = None
                    continue
                if prev_script and s != prev_script and s not in ("digit", "other"):
                    if current:
                        tokens.append("".join(current))
                        current = []
                current.append(ch)
                if s not in ("digit", "other"):
                    prev_script = s
            if current:
                tokens.append("".join(current))
    return tokens


def get_token_scripts(text: str) -> List[Tuple[str, str]]:
    """Return a list of (token, primary_script) tuples for each token."""
    tokens = tokenize_multilingual(text)
    result = []
    for token in tokens:
        script_counts = {"telugu": 0, "devanagari": 0, "latin": 0}
        for ch in token:
            s = get_script(ch)
            if s in script_counts:
                script_counts[s] += 1
        primary = max(script_counts, key=script_counts.get) if any(script_counts.values()) else "other"
        if all(v == 0 for v in script_counts.values()):
            primary = "digit" if all(c.isdigit() for c in token) else "other"
        result.append((token, primary))
    return result


def expand_abbreviations(text: str) -> str:
    """Expand common medical abbreviations in text."""
    words = text.split()
    expanded = []
    for word in words:
        lower = word.lower().strip(".,;:!?")
        if lower in MEDICAL_ABBREVIATIONS:
            expanded.append(MEDICAL_ABBREVIATIONS[lower])
        else:
            expanded.append(word)
    return " ".join(expanded)


def extract_duration_patterns(text: str) -> List[str]:
    """Extract duration/time patterns from multilingual text.

    Matches patterns like: 2 days, 3 weeks, 1 month, 2 din, 3 hafte, 5 rojulu, etc.
    """
    durations = []
    # English patterns
    en_pattern = r"\b(\d+)\s*(day|days|week|weeks|month|months|year|years|hour|hours|minute|minutes|night|nights|morning|mornings)\b"
    for match in re.finditer(en_pattern, text, re.IGNORECASE):
        durations.append(match.group(0))

    # Hindi patterns (Romanized and Devanagari)
    hi_patterns = [
        r"\b(\d+)\s*(din|dinon|hafte|hafton|mahine|mahinon|saal|salon|ghante|ghanton)\b",
        r"(\d+)\s*(दिन|दिनों|हफ्ते|हफ्तों|महीने|महीनों|साल|सालों|घंटे|घंटों)",
        r"(कई|कुछ|बहुत)\s*(दिन|दिनों|हफ्ते|महीने|साल)",
        r"(\d+)\s*(दिन से|दिनों से|हफ्ते से|महीने से|साल से)",
    ]
    for pat in hi_patterns:
        for match in re.finditer(pat, text, re.IGNORECASE):
            durations.append(match.group(0))

    # Telugu patterns
    te_patterns = [
        r"(\d+)\s*(రోజులు|రోజుల|వారాలు|వారాల|నెలలు|నెలల|సంవత్సరాలు|సంవత్సరాల|గంటలు|గంటల)",
        r"(\d+)\s*(rojulu|rojula|vaaralu|vaarala|nelalu|nelala|samvatsaralu)",
        r"(చాలా|కొన్ని)\s*(రోజులు|వారాలు|నెలలు|సంవత్సరాలు)",
        r"(\d+)\s*(రోజుల నుండి|వారాల నుండి|నెలల నుండి)",
    ]
    for pat in te_patterns:
        for match in re.finditer(pat, text, re.IGNORECASE):
            durations.append(match.group(0))

    return list(set(durations))


def detect_script_distribution(text: str) -> dict:
    """Calculate the character-level script distribution of text.

    Returns a dict with percentage of telugu, devanagari, latin, digit, other characters.
    """
    counts = {"telugu": 0, "devanagari": 0, "latin": 0, "digit": 0, "other": 0}
    total = 0
    for ch in text:
        if ch.isspace():
            continue
        s = get_script(ch)
        if s == "punctuation":
            continue
        total += 1
        if s in counts:
            counts[s] += 1
        else:
            counts["other"] += 1

    if total == 0:
        return {k: 0.0 for k in counts}
    return {k: round(v / total * 100, 2) for k, v in counts.items()}


def is_telugu_char(char: str) -> bool:
    """Check if a character belongs to the Telugu Unicode block."""
    return TELUGU_RANGE[0] <= ord(char) <= TELUGU_RANGE[1]


def is_devanagari_char(char: str) -> bool:
    """Check if a character belongs to the Devanagari Unicode block."""
    return DEVANAGARI_RANGE[0] <= ord(char) <= DEVANAGARI_RANGE[1]


def transliterate_basic(text: str, source_lang: str, target_lang: str) -> str:
    """Basic placeholder transliteration.

    For production use, integrate a proper transliteration library like
    indic-trans or AI4Bharat's IndicTrans.
    """
    # This is a placeholder — full transliteration requires ML models
    logger.info(
        "Basic transliteration requested from %s to %s (placeholder)",
        source_lang,
        target_lang,
    )
    return text
