from .recommendation_engine import SoilInput, load_knowledge_base, validate


def _range_score(value: float, minimum: float, maximum: float) -> float:
    if minimum <= value <= maximum:
        return 1.0
    return max(0.0, 1.0 - (minimum - value if value < minimum else value - maximum) / max(maximum - minimum, 1.0))


def score_soil_health(soil: SoilInput) -> dict:
    validate(soil)
    knowledge_base = load_knowledge_base()
    bands = knowledge_base["bands"]
    components = {
        "nitrogen": _range_score(soil.nitrogen, bands["nitrogen"]["low_below"], bands["nitrogen"]["adequate_max"]),
        "phosphorus": _range_score(soil.phosphorus, bands["phosphorus"]["low_below"], bands["phosphorus"]["adequate_max"]),
        "potassium": _range_score(soil.potassium, bands["potassium"]["low_below"], bands["potassium"]["adequate_max"]),
        "ph": _range_score(soil.ph, bands["ph"]["target_min"], bands["ph"]["target_max"]),
        "organic_matter": _range_score(soil.organic_matter, 1.5, bands["organic_matter"]["adequate_max"]),
        "moisture": _range_score(soil.moisture, 10, bands["moisture"]["adequate_max"]),
    }
    scoring = knowledge_base["soil_health_scoring"]
    weights = scoring["weights"]
    total_weight = sum(weights.values())
    score = round(sum(components[name] * weights[name] for name in components) / total_weight * 100)
    grades = scoring["grades"]
    grade = "Good" if score >= grades["good_min"] else "Fair" if score >= grades["fair_min"] else "Needs improvement" if score >= grades["needs_improvement_min"] else "Poor"
    return {"score": score, "grade": grade, "components": components, "method": scoring["method"]}