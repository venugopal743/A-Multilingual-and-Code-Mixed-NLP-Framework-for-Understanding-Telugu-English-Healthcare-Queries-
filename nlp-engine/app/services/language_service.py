"""
Language Detection Service for Telugu, Hindi, English, and Code-Mixed queries.
Combines FastText, Unicode script profiling, and Romanized Indic lexical analysis.
"""

import re
import unicodedata
from typing import Dict, List, Tuple
from app.utils.text_processing import normalize_text as normalize_indic_text, tokenize_multilingual

# Script ranges
TELUGU_RANGE = (0x0C00, 0x0C7F)
DEVANAGARI_RANGE = (0x0900, 0x097F)

# Common Romanized Telugu markers
ROMAN_TELUGU_WORDS = {
    "naaku", "naku", "undi", "undhi", "ledu", "ledhu", "nunchi", "nundi",
    "kuda", "kooda", "cheppandi", "ekkada", "ela", "ayindi", "aindi",
    "chesukovali", "daggara", "kosam", "gurinchi", "talanoppi", "noppi",
    "jwaram", "mantaga", "kadupu", "kaallu", "chethulu", "vomitings"
}

# Common Romanized Hindi markers
ROMAN_HINDI_WORDS = {
    "mujhe", "mera", "meri", "mere", "hai", "hain", "tha", "thi", "the",
    "hoga", "hogi", "dard", "bukhar", "khansi", "kahan", "kaise", "kya",
    "dawa", "dawakhana", "ilaj", "bataye", "batayein", "se", "mein", "aur",
    "chalne", "takleef", "pet", "sar", "gale"
}


class LanguageService:
    """Service to detect language and code-mixing in healthcare queries."""

    def detect_script(self, text: str) -> Dict[str, float]:
        """Calculate Unicode script distribution in the text."""
        counts = {"te": 0, "hi": 0, "en": 0, "other": 0}
        total_chars = 0

        for char in text:
            cp = ord(char)
            if TELUGU_RANGE[0] <= cp <= TELUGU_RANGE[1]:
                counts["te"] += 1
                total_chars += 1
            elif DEVANAGARI_RANGE[0] <= cp <= DEVANAGARI_RANGE[1]:
                counts["hi"] += 1
                total_chars += 1
            elif "A" <= char <= "Z" or "a" <= char <= "z":
                counts["en"] += 1
                total_chars += 1
            elif not char.isspace() and not unicodedata.category(char).startswith("P"):
                counts["other"] += 1
                total_chars += 1

        if total_chars == 0:
            return {"en": 1.0, "te": 0.0, "hi": 0.0}

        return {k: round(v / total_chars, 4) for k, v in counts.items() if k != "other"}

    def detect_token_languages(self, tokens: List[str]) -> List[Dict[str, str]]:
        """Classify each individual token's language for code-mixed analysis."""
        token_labels = []
        for t in tokens:
            t_lower = t.lower()
            if any(TELUGU_RANGE[0] <= ord(c) <= TELUGU_RANGE[1] for c in t):
                token_labels.append({"token": t, "lang": "te"})
            elif any(DEVANAGARI_RANGE[0] <= ord(c) <= DEVANAGARI_RANGE[1] for c in t):
                token_labels.append({"token": t, "lang": "hi"})
            elif t_lower in ROMAN_TELUGU_WORDS:
                token_labels.append({"token": t, "lang": "te-Latn"})
            elif t_lower in ROMAN_HINDI_WORDS:
                token_labels.append({"token": t, "lang": "hi-Latn"})
            else:
                token_labels.append({"token": t, "lang": "en"})
        return token_labels

    def detect_language(self, text: str) -> Dict[str, any]:
        """
        Analyze healthcare query and identify:
        - Primary detected language (te, hi, en, te-en, hi-en)
        - Code-mixed boolean flag
        - Script and language distribution
        - Token-level language classifications
        - Indic NLP normalized text
        """
        clean_text = normalize_indic_text(text)
        tokens = tokenize_multilingual(clean_text)
        script_dist = self.detect_script(clean_text)
        token_labels = self.detect_token_languages(tokens)

        # Count tokens by language category
        te_tokens = sum(1 for t in token_labels if t["lang"] in ("te", "te-Latn"))
        hi_tokens = sum(1 for t in token_labels if t["lang"] in ("hi", "hi-Latn"))
        en_tokens = sum(1 for t in token_labels if t["lang"] == "en")
        total_tokens = max(len(tokens), 1)

        is_code_mixed = False
        detected_language = "en"

        # Check script dominance first
        if script_dist.get("te", 0) > 0.4:
            if en_tokens >= 2 or script_dist.get("en", 0) > 0.2:
                detected_language = "te-en"
                is_code_mixed = True
            else:
                detected_language = "te"
        elif script_dist.get("hi", 0) > 0.4:
            if en_tokens >= 2 or script_dist.get("en", 0) > 0.2:
                detected_language = "hi-en"
                is_code_mixed = True
            else:
                detected_language = "hi"
        else:
            # Romanized text analysis
            if te_tokens >= 2 and en_tokens >= 1:
                detected_language = "te-en"
                is_code_mixed = True
            elif hi_tokens >= 2 and en_tokens >= 1:
                detected_language = "hi-en"
                is_code_mixed = True
            elif te_tokens >= 3:
                detected_language = "te-Latn"
            elif hi_tokens >= 3:
                detected_language = "hi-Latn"
            else:
                detected_language = "en"

        distribution = {
            "te": round(te_tokens / total_tokens, 2),
            "hi": round(hi_tokens / total_tokens, 2),
            "en": round(en_tokens / total_tokens, 2),
        }

        return {
            "original_text": text,
            "detected_language": detected_language,
            "is_code_mixed": is_code_mixed,
            "language_distribution": distribution,
            "normalized_text": clean_text,
            "token_language_labels": token_labels,
        }


language_service = LanguageService()
