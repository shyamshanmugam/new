# Scoring and Recommendation Method

## Soil-health estimate

For each of six parameters, the prototype computes a range-fit component from 0 to 1. A value inside that parameter's target range receives 1. Outside the range, the score decreases linearly with distance from the nearest boundary using the target-range width, with a minimum width of 1 for the calculation.

```text
soil score = round(100 × (N fit + P fit + K fit + pH fit + organic matter fit + moisture fit) / 6)
```

The indicators have equal weight. Grades are Good (85–100), Fair (70–84), Needs improvement (50–69), and Poor (0–49). This is a transparent demonstration formula, not a calibrated soil-health index.

The browser code defines the reference bands in `farmer-pwa/lib/advisory.ts`. The Python engine and knowledge-base configuration are under `week5/src/` and `week5/data/`. Keep these copies aligned when changing the method.

## Condition bands

The prototype classifies N as low below 50 and high above 120 mg/kg; P as low below 30 and high above 60 mg/kg; K as low below 80 and high above 150 mg/kg. pH below 5.5 is called acidic and above 7.5 alkaline. Organic matter below 1.0% is very low and below 1.5% low. Moisture below 10% is dry and above 30% wet.

These cutoffs are demonstration defaults. Nutrient interpretation depends on the extraction method and local calibration; moisture depends on soil texture, crop and measurement method.

## Recommendations

Rules map the observed conditions to general actions and cautions. The engine intentionally avoids universal fertilizer or lime rates. It asks users to follow crop- and district-specific Soil Health Card or extension guidance. Sources and intended use are listed in `week5/data/agricultural_knowledge_base.json`.

## Crop ranking

Crop scores compare the input readings with pH, N, P, K, organic-matter, and moisture ranges in the compatibility table. The ranked percentage indicates range compatibility only, not yield probability or a guarantee of agronomic suitability.
