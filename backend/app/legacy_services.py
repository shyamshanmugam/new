from src.cnn.classifier import classification_dict
from src.recommendations.engine import crop_suitability, recommendations
from src.structured_ml.analyzer import analyze_soil

from .schemas import SoilTest


def analyze(test: SoilTest, image_bytes: bytes | None = None) -> dict:
    result = analyze_soil(**test.model_dump())
    return {
        "health_score": result.health_score,
        "deficiencies": result.deficiencies,
        "degradation_risks": result.risks,
        "recommendations": recommendations(result.deficiencies),
        "crop_suitability": crop_suitability(test.ph, test.moisture),
        "image_classification": classification_dict(image_bytes) if image_bytes else None,
    }
