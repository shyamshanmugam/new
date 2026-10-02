from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_health_is_explicit_about_model_state():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "cnn_model_loaded" in response.json()


def test_structured_analysis_reports_low_nutrients():
    response = client.post(
        "/analyze-soil",
        json={"nitrogen": 10, "phosphorus": 5, "potassium": 50, "ph": 6.8, "organic_matter": 2, "moisture": 25},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["model_type"] == "rule-based"
    assert body["score"] < 100
    assert body["statuses"]["nitrogen"] == "Low"


def test_image_endpoint_rejects_unsupported_type():
    response = client.post(
        "/predict-image",
        files={"file": ("soil.txt", b"not-an-image", "text/plain")},
    )
    assert response.status_code == 415


def test_image_endpoint_rejects_invalid_image_bytes():
    response = client.post(
        "/predict-image",
        files={"file": ("soil.png", b"not-an-image", "image/png")},
    )
    assert response.status_code == 422
