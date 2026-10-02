import math
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))

from src.crop_suitability import rank_crops
from src.recommendation_engine import (
    SoilInput,
    load_knowledge_base,
    nutrient_statuses,
    recommendations,
    validate,
)
from src.soil_health import score_soil_health


class TestSoilAdvisory(unittest.TestCase):
    def setUp(self):
        self.healthy_soil = SoilInput(85, 45, 110, 6.8, 20, 2.0)

    def test_knowledge_base_documents_sources_and_methodology(self):
        knowledge_base = load_knowledge_base()
        self.assertGreaterEqual(len(knowledge_base["metadata"]["sources"]), 3)
        self.assertIn("fertilizer_application_guidance", knowledge_base["rules"])
        self.assertEqual(
            set(knowledge_base["soil_health_scoring"]["weights"]),
            {"nitrogen", "phosphorus", "potassium", "ph", "organic_matter", "moisture"},
        )
        self.assertIn("soil_health_conditions", knowledge_base)

    def test_low_nutrients_acid_soil_and_low_organic_matter_are_flagged(self):
        advice = recommendations(SoilInput(40, 20, 60, 5.0, 18, 1.0))
        titles = {item["title"] for item in advice}
        self.assertTrue(
            {
                "Nitrogen management",
                "Phosphorus management",
                "Potassium management",
                "Acid soil management",
                "Build soil organic matter",
            }.issubset(titles)
        )
        self.assertTrue(all(item["caution"] for item in advice))

    def test_high_nutrients_alkaline_soil_and_wet_conditions_are_flagged(self):
        advice = recommendations(SoilInput(130, 70, 160, 8.0, 40, 2.0))
        titles = {item["title"] for item in advice}
        self.assertTrue(
            {
                "Avoid extra nitrogen",
                "Avoid extra phosphorus",
                "Avoid extra potassium",
                "Alkaline soil assessment",
                "Review excess wetness",
            }.issubset(titles)
        )

    def test_dry_soil_and_threshold_values_are_classified(self):
        soil = SoilInput(50, 30, 80, 5.5, 5, 1.5)
        advice = recommendations(soil)
        self.assertIn("Conserve soil moisture", {item["title"] for item in advice})
        self.assertNotIn("Acid soil management", {item["title"] for item in advice})
        self.assertEqual(
            nutrient_statuses(soil),
            {"nitrogen": "adequate", "phosphorus": "adequate", "potassium": "adequate"},
        )

    def test_adequate_readings_receive_balanced_management_advice(self):
        self.assertEqual(
            recommendations(self.healthy_soil)[0]["title"],
            "Maintain balanced soil management",
        )

    def test_validation_rejects_invalid_and_non_finite_values(self):
        invalid_soils = [
            SoilInput(-1, 20, 60, 5.0, 18, 1.0),
            SoilInput(40, 20, 60, 14.1, 18, 1.0),
            SoilInput(40, 20, 60, 5.0, 101, 1.0),
            SoilInput(math.nan, 20, 60, 5.0, 18, 1.0),
            SoilInput(math.inf, 20, 60, 5.0, 18, 1.0),
            SoilInput(True, 20, 60, 5.0, 18, 1.0),
        ]
        for soil in invalid_soils:
            with self.subTest(soil=soil), self.assertRaises(ValueError):
                validate(soil)

    def test_health_score_is_bounded_and_explains_its_method(self):
        result = score_soil_health(self.healthy_soil)
        self.assertEqual(result["score"], 100)
        self.assertEqual(result["grade"], "Good")
        self.assertEqual(len(result["components"]), 6)
        self.assertIn("Arithmetic mean", result["method"])

        poor_result = score_soil_health(SoilInput(0, 0, 0, 0, 0, 0))
        self.assertGreaterEqual(poor_result["score"], 0)
        self.assertLess(poor_result["score"], result["score"])
        self.assertEqual(poor_result["grade"], "Poor")

    def test_crop_ranking_returns_sorted_results_for_distinct_soils(self):
        suitable = rank_crops(self.healthy_soil, top_n=3)
        poor = rank_crops(SoilInput(0, 0, 0, 0, 0, 0), top_n=3)
        self.assertEqual(len(suitable), 3)
        self.assertGreaterEqual(suitable[0]["score"], suitable[-1]["score"])
        self.assertGreater(suitable[0]["score"], poor[0]["score"])
        self.assertTrue(suitable[0]["limiting_factors"])

    def test_crop_ranking_rejects_invalid_result_count(self):
        for top_n in (0, -1, 1.5, True):
            with self.subTest(top_n=top_n), self.assertRaises(ValueError):
                rank_crops(self.healthy_soil, top_n=top_n)


if __name__ == "__main__":
    unittest.main()
