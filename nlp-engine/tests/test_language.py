import unittest
from app.services.language_service import language_service


class TestLanguageService(unittest.TestCase):
    def test_english_query(self):
        res = language_service.detect_language("I have severe fever and headache for 2 days.")
        self.assertEqual(res["detected_language"], "en")
        self.assertFalse(res["is_code_mixed"])

    def test_telugu_script_query(self):
        res = language_service.detect_language("నాకు రెండు రోజుల నుండి తీవ్రమైన జ్వరం మరియు తలనొప్పి ఉంది.")
        self.assertIn("te", res["detected_language"])

    def test_hindi_script_query(self):
        res = language_service.detect_language("मुझे दो दिनों से तेज बुखार और सिरदर्द है।")
        self.assertIn("hi", res["detected_language"])

    def test_telugu_english_code_mixed(self):
        res = language_service.detect_language("Naaku 2 days nunchi severe fever and headache undi.")
        self.assertTrue(res["is_code_mixed"])
        self.assertIn("te", res["detected_language"])

    def test_hindi_english_code_mixed(self):
        res = language_service.detect_language("Mujhe 2 days se severe headache and fever ho raha hai.")
        self.assertTrue(res["is_code_mixed"])
        self.assertIn("hi", res["detected_language"])


if __name__ == "__main__":
    unittest.main()
