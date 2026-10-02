from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class SoilInput:
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    moisture: float
    organic_matter: float


def load_knowledge_base() -> dict:
    with (ROOT / "data" / "agricultural_knowledge_base.json").open(encoding="utf-8") as file:
        return json.load(file)


def validate(soil: SoilInput) -> None:
    values = soil.__dict__
    if any(isinstance(value, bool) or not isinstance(value, (int, float)) for value in values.values()):
        raise ValueError("All soil readings must be numeric.")
    if any(not math.isfinite(value) for value in values.values()):
        raise ValueError("Soil readings must be finite numbers.")
    if any(value < 0 for value in values.values()):
        raise ValueError("Soil readings cannot be negative.")
    if not 0 <= soil.ph <= 14:
        raise ValueError("pH must be between 0 and 14.")
    if soil.moisture > 100 or soil.organic_matter > 100:
        raise ValueError("Moisture and organic matter must be percentages from 0 to 100.")


def _status(value: float, low: float, high: float) -> str:
    return "low" if value < low else "high" if value > high else "adequate"


def nutrient_statuses(soil: SoilInput) -> dict[str, str]:
    validate(soil)
    bands = load_knowledge_base()["bands"]
    return {name: _status(getattr(soil, name), band["low_below"], band["adequate_max"])
            for name, band in bands.items() if name in {"nitrogen", "phosphorus", "potassium"}}


def recommendations(soil: SoilInput) -> list[dict[str, object]]:
    knowledge_base = load_knowledge_base()
    statuses = nutrient_statuses(soil)
    rules = knowledge_base["recommendations"]
    items: list[dict[str, object]] = []

    for nutrient, status in statuses.items():
        rule = rules[nutrient].get(status)
        if rule:
            items.append({**rule, "category": "nutrient"})

    ph_status = "acidic" if soil.ph < 5.5 else "alkaline" if soil.ph > 7.5 else None
    if ph_status:
        items.append({**rules["ph"][ph_status], "category": "pH"})

    if soil.organic_matter < knowledge_base["bands"]["organic_matter"]["low_below"]:
        items.append({**rules["organic_matter"]["low"], "category": "organic matter"})

    if soil.moisture < knowledge_base["bands"]["moisture"]["dry_below"]:
        items.append({**rules["moisture"]["dry"], "category": "moisture"})
    elif soil.moisture > knowledge_base["bands"]["moisture"]["adequate_max"]:
        items.append({**rules["moisture"]["wet"], "category": "moisture"})

    if not items:
        items.append({**rules["balanced"], "category": "balanced"})
    return items