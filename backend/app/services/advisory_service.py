from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]


def _range_score(value: float, minimum: float, maximum: float) -> float:
    if minimum <= value <= maximum:
        return 1.0
    distance = minimum - value if value < minimum else value - maximum
    return max(0.0, 1.0 - distance / max(maximum - minimum, 1.0))


def _recommendations(values: dict[str, float], statuses: dict[str, str]) -> list[dict]:
    result: list[dict] = []
    caution = "Use crop- and district-specific Soil Health Card guidance; do not apply a universal rate from these demonstration bands."
    nutrient_rules = {
        "nitrogen": ("Nitrogen management", "Confirm the crop-specific nitrogen dose using the soil-test report and local Soil Health Card."),
        "phosphorus": ("Phosphorus management", "Confirm the crop-specific phosphorus dose from the Soil Health Card or local extension service."),
        "potassium": ("Potassium management", "Confirm the crop-specific potassium dose from the Soil Health Card or local extension service."),
    }
    for key, (title, action) in nutrient_rules.items():
        if statuses[key] == "Low":
            result.append({"title": title, "priority": "High", "actions": [action], "caution": caution})
        elif statuses[key] == "High":
            result.append({"title": f"Avoid extra {key}", "priority": "Medium", "actions": [f"Review the soil test before adding {key}."], "caution": "A high test value is not, by itself, a diagnosis of toxicity."})
    if values["ph"] < 5.5:
        result.append({"title": "Acid soil management", "priority": "High", "actions": ["Request lime-requirement or buffer-pH testing before selecting an application rate."], "caution": "Do not estimate a lime rate from pH alone; soil texture and buffer capacity matter."})
    elif values["ph"] > 7.5:
        result.append({"title": "Alkaline soil assessment", "priority": "High", "actions": ["Consult a local soil laboratory or extension service for a field-specific plan."], "caution": "High pH alone does not establish sodicity or identify the correct amendment."})
    if values["organic_matter"] < 1.5:
        result.append({"title": "Build organic matter", "priority": "Medium", "actions": ["Use mature compost or well-decomposed manure where suitable."], "caution": "Account for nutrients in organic inputs and follow local nutrient-management guidance."})
    if values["moisture"] < 10:
        result.append({"title": "Conserve soil moisture", "priority": "Medium", "actions": ["Use mulch and schedule irrigation according to crop stage, soil texture and weather."], "caution": "A single moisture reading does not represent seasonal field water availability."})
    elif values["moisture"] > 30:
        result.append({"title": "Review excess wetness", "priority": "Medium", "actions": ["Check drainage, irrigation timing and compaction before adding fertilizer."], "caution": "A single moisture reading does not represent seasonal field water availability."})
    return result or [{"title": "Maintain balanced soil management", "priority": "Low", "actions": ["Continue crop-specific soil-test planning and periodic testing."], "caution": "This prototype does not assess micronutrients, salinity, pests or disease."}]


def analyze_soil(values: dict[str, float]) -> dict:
    statuses = {
        "nitrogen": "Low" if values["nitrogen"] < 50 else "High" if values["nitrogen"] > 120 else "Adequate",
        "phosphorus": "Low" if values["phosphorus"] < 30 else "High" if values["phosphorus"] > 60 else "Adequate",
        "potassium": "Low" if values["potassium"] < 80 else "High" if values["potassium"] > 150 else "Adequate",
        "ph": "Acidic" if values["ph"] < 5.5 else "Alkaline" if values["ph"] > 7.5 else "Near neutral",
        "organicMatter": "Very low" if values["organic_matter"] < 1 else "Low" if values["organic_matter"] < 1.5 else "Adequate",
        "moisture": "Dry" if values["moisture"] < 10 else "Wet" if values["moisture"] > 30 else "Adequate",
    }
    components = [
        _range_score(values["nitrogen"], 50, 120),
        _range_score(values["phosphorus"], 30, 60),
        _range_score(values["potassium"], 80, 150),
        _range_score(values["ph"], 6.5, 7.5),
        _range_score(values["organic_matter"], 1.5, 3),
        _range_score(values["moisture"], 10, 30),
    ]
    score = round(sum(components) / len(components) * 100)
    grade = "Good" if score >= 85 else "Fair" if score >= 70 else "Needs improvement" if score >= 50 else "Poor"
    crops = []
    crop_file = ROOT / "week5" / "data" / "crop_requirements.csv"
    with crop_file.open(newline="", encoding="utf-8") as file:
        for row in csv.DictReader(file):
            factors = [
                _range_score(values["ph"], float(row["ph_min"]), float(row["ph_max"])),
                _range_score(values["nitrogen"], float(row["n_min"]), float(row["n_max"])),
                _range_score(values["phosphorus"], float(row["p_min"]), float(row["p_max"])),
                _range_score(values["potassium"], float(row["k_min"]), float(row["k_max"])),
                _range_score(values["organic_matter"], float(row["organic_matter_min"]), 3),
                _range_score(values["moisture"], float(row["moisture_min"]), float(row["moisture_max"])),
            ]
            crop_score = round(sum(factors) / len(factors) * 100)
            crops.append({"name": row["crop"], "score": crop_score})
    crops.sort(key=lambda item: item["score"], reverse=True)
    return {
        "model_type": "rule-based",
        "structured_ml_available": False,
        "score": score,
        "grade": grade,
        "statuses": statuses,
        "recommendations": _recommendations(values, statuses),
        "crops": crops[:5],
    }
