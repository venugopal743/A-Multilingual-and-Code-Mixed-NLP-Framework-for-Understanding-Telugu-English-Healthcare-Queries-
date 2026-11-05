import unittest
from app.services.ner_service import ner_service


class TestNERService(unittest.TestCase):
    def test_symptom_and_duration_extraction(self):
        query = "Naaku 2 days nunchi fever and headache undi."
        res = ner_service.extract_entities(query, "te-en")

        symptoms = [s.lower() for s in res["symptoms"]]
        self.assertTrue(any("fever" in s for s in symptoms))
        self.assertTrue(any("headache" in s for s in symptoms))
        self.assertTrue(len(res["durations"]) > 0)

    def test_telugu_native_symptoms(self):
        query = "నాకు తీవ్రమైన జ్వరం మరియు తుంటి నొప్పి ఉంది"
        res = ner_service.extract_entities(query, "te")
        self.assertTrue(len(res["symptoms"]) > 0 or len(res["entities"]) > 0)


if __name__ == "__main__":
    unittest.main()
