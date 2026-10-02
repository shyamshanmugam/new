from __future__ import annotations

import csv

from .recommendation_engine import ROOT, SoilInput, load_knowledge_base, validate


def _range_score(value: float, minimum: float, maximum: float) -> float:
    if minimum <= value <= maximum:
        return 1.0
    return max(0.0, 1.0 - (minimum - value if value < minimum else value - maximum) / max(maximum - minimum, 1.0))


def rank_crops(soil: SoilInput, top_n: int = 5) -> list[dict]:
    validate(soil)
    if isinstance(top_n, bool) or not isinstance(top_n, int) or top_n < 1:
        raise ValueError("top_n must be a positive integer.")
    scoring = load_knowledge_base()["crop_suitability"]
    weights = scoring["weights"]
    results = []
    with (ROOT / "data" / "crop_requirements.csv").open(newline="", encoding="utf-8") as file:
        for row in csv.DictReader(file):
            values = {key: float(value) for key, value in row.items() if key != "crop"}
            factors = {
                "pH": _range_score(soil.ph, values["ph_min"], values["ph_max"]),
                "N": _range_score(soil.nitrogen, values["n_min"], values["n_max"]),
                "P": _range_score(soil.phosphorus, values["p_min"], values["p_max"]),
                "K": _range_score(soil.potassium, values["k_min"], values["k_max"]),
                "organic matter": _range_score(soil.organic_matter, values["organic_matter_min"], scoring["organic_matter_score_max"]),
                "moisture": _range_score(soil.moisture, values["moisture_min"], values["moisture_max"]),
            }
            factor_weights = {"pH": weights["ph"], "N": weights["n"], "P": weights["p"], "K": weights["k"], "organic matter": weights["organic_matter"], "moisture": weights["moisture"]}
            score = round(sum(factors[key] * factor_weights[key] for key in factors) * 100)
            limits = [name for name, value in factors.items() if value < .99]
            grades = scoring["grades"]
            results.append({"crop": row["crop"], "score": score, "status": "Suitable" if score >= grades["suitable_min"] else "Suitable after improvement" if score >= grades["improve_min"] else "Lower suitability", "limiting_factors": ", ".join(limits) or "No demonstrated limitation"})
    return sorted(results, key=lambda item: item["score"], reverse=True)[:top_n]