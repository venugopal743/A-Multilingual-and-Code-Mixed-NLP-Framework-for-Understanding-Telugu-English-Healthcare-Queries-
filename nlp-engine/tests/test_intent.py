import unittest
from app.services.intent_service import intent_service


class TestIntentService(unittest.TestCase):
    def test_hospital_search(self):
        res = intent_service.classify_intent("Warangal lo nearest hospital ekkada?")
        self.assertEqual(res["intent"], "hospital_search")
        self.assertGreater(res["confidence"], 0.7)

    def test_symptom_inquiry(self):
        res = intent_service.classify_intent("Naaku 2 days nunchi fever and headache undi.")
        self.assertEqual(res["intent"], "symptom_inquiry")

    def test_emergency_assistance(self):
        res = intent_service.classify_intent("Emergency! Patient has severe chest pain and is unconscious!")
        self.assertEqual(res["intent"], "emergency_assistance")


if __name__ == "__main__":
    unittest.main()
