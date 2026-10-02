import unittest
from io import BytesIO
from unittest.mock import patch

from fastapi.testclient import TestClient
from PIL import Image

from backend.app.main import app
from backend.app.services import model_registry


class TestApi(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        image = Image.new("RGB", (224, 224), (120, 80, 60))
        buffer = BytesIO()
        image.save(buffer, format="JPEG")
        self.sample_image = buffer.getvalue()
        self.payload = {
            "nitrogen": 45,
            "phosphorus": 25,
            "potassium": 110,
            "ph": 5.2,
            "moisture": 18,
            "organic_matter": 1.1,
        }

    def test_model_artifact_detection(self):
        self.assertTrue(model_registry.model_available())

    def test_class_mapping_loading(self):
        self.assertEqual(
            model_registry.class_names(),
            ["Alluvial Soil", "Black Soil", "Clay Soil", "Red Soil"],
        )

    def test_model_loading(self):
        model = model_registry.load_model()
        self.assertEqual(tuple(model.input_shape), (None, 224, 224, 3))
        self.assertEqual(model.output_shape[-1], len(model_registry.class_names()))

    def test_health_reports_loaded_model(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["cnn_model_loaded"])
        self.assertFalse(response.json()["structured_ml_available"])

    def test_pwa_dev_origin_is_allowed_by_cors(self):
        response = self.client.options(
            "/predict-image",
            headers={
                "Origin": "http://localhost:3001",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], "http://localhost:3001")

    def test_model_info_reports_loaded_artifact(self):
        response = self.client.get("/model-info")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["model_available"])
        self.assertEqual(response.json()["class_names"], ["Alluvial Soil", "Black Soil", "Clay Soil", "Red Soil"])

    def test_rule_based_soil_analysis(self):
        response = self.client.post("/analyze-soil", json=self.payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["model_type"], "rule-based")
        self.assertFalse(response.json()["structured_ml_available"])
        self.assertEqual(response.json()["score"], 75)

    def test_invalid_soil_input_is_rejected(self):
        response = self.client.post("/analyze-soil", json={**self.payload, "ph": 15})
        self.assertEqual(response.status_code, 422)

    def test_invalid_image_type_is_rejected(self):
        response = self.client.post(
            "/predict-image",
            files={"file": ("notes.txt", b"not an image", "text/plain")},
        )
        self.assertEqual(response.status_code, 415)

    def test_malformed_image_is_rejected(self):
        response = self.client.post(
            "/predict-image",
            files={"file": ("soil.jpg", b"not an image", "image/jpeg")},
        )
        self.assertEqual(response.status_code, 422)

    def test_missing_model_returns_service_unavailable(self):
        with patch("backend.app.main.model_available", return_value=False):
            response = self.client.post(
                "/predict-image",
                files={"file": ("soil.jpg", b"not an image", "image/jpeg")},
            )
        self.assertEqual(response.status_code, 503)

    def test_valid_image_prediction(self):
        response = self.client.post(
            "/predict-image",
            files={"file": ("synthetic-soil.jpg", self.sample_image, "image/jpeg")},
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn(body["predicted_class"], model_registry.class_names())
        self.assertGreaterEqual(body["confidence"], 0)
        self.assertLessEqual(body["confidence"], 1)
        self.assertEqual(set(body["class_probabilities"]), set(model_registry.class_names()))
        self.assertEqual(body["model_status"], "loaded")

    def test_experimental_model_predicts_synthetic_image(self):
        response = self.client.post(
            "/predict-image",
            files={"file": ("synthetic-soil.jpg", self.sample_image, "image/jpeg")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn(response.json()["predicted_class"], model_registry.class_names())
        self.assertIn("experimental", response.json()["model_name"].lower())

    def test_class_count_mismatch_is_rejected(self):
        model_registry.load_model.cache_clear()
        with patch("backend.app.services.model_registry.class_names", return_value=["Only one"]):
            with self.assertRaises(ValueError):
                model_registry.load_model()
        model_registry.load_model.cache_clear()


if __name__ == "__main__":
    unittest.main()
