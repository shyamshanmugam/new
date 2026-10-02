# Soil Recommendation and Crop Suitability

This module evaluates six soil readings and returns transparent nutrient and soil-management advice, an explainable soil-health score, and a ranked list of compatible crops. It is a deterministic, rule-based prototype, not a trained machine-learning model.

## Inputs and units

| Reading | Unit |
| --- | --- |
| Nitrogen, phosphorus and potassium | mg/kg (ppm) |
| pH | pH scale |
| Soil moisture | percent |
| Organic matter | percent |

The interpretation bands are demonstration defaults. Laboratory extraction methods, soil texture, crop, season, region and calibration affect interpretation. Confirm readings against the full soil-test report and local Soil Health Card or extension guidance before applying fertilizer or amendments.

## Agricultural knowledge base

`data/agricultural_knowledge_base.json` contains the reference bands and condition categories, recommendation rules and cautions, scoring methods, and reference sources. The engine maps low/high N/P/K readings, acidic/alkaline pH, low organic matter, and dry/wet readings to corresponding management advice.

Fertilizer advice intentionally does not prescribe universal application rates. Use crop- and district-specific Soil Health Card recommendations, taking into account the crop, soil-test method, season, local calibration, and prior nutrient inputs. Source references and intended uses are recorded in the knowledge-base metadata.

## Crop compatibility

`data/crop_requirements.csv` is the editable crop-soil compatibility dataset. It records pH, N, P, K, organic-matter and moisture requirements. `src/crop_suitability.py` compares soil readings to these ranges, calculates a weighted range-fit score, identifies limiting factors, and ranks the crops.

Crop scores are compatibility indicators, not guaranteed yield predictions. Validate crop requirements for the local region before making field decisions.

## Soil-health score

The score is the arithmetic mean of six range-fit indicators: nitrogen, phosphorus, potassium, pH, organic matter and moisture. Each indicator has equal weight; the result is bounded from 0 to 100. Grade thresholds and the method are documented in the knowledge base.

## Run tests

From the workspace root:

```text
python -m unittest discover -s week5/tests -p "test_*.py"
```

The tests cover reference data, low and high nutrient conditions, acidic and alkaline pH, dry and wet readings, invalid values, bounded health scoring, and crop ranking for contrasting sample conditions.

## Sources

The knowledge-base `metadata.sources` lists the cited material and how it informs the prototype, including India's Soil Health Card guidance, FAO acid-soil management context, and ICAR balanced-fertilizer guidance. Verify current regional advice before operational use.
