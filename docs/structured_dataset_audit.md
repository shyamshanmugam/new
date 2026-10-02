# Structured Dataset Audit

Audit date: 2026-09-27
Project root: `C:\Users\HP\OneDrive\Desktop\infosys springboard`

## Search scope

The project was searched recursively for `.csv`, `.xlsx`, `.xls`, `.json`,
`.parquet`, `.sqlite`, and `.db` files. Dependency caches under `.venv`,
`.venv-1`, `farmer-pwa/node_modules`, and `farmer-pwa/.next` were excluded.

## Candidate files

| File | Size | Finding |
|---|---:|---|
| `InternCallSchedule (1).xlsx` | 19,951 bytes | Unrelated internship schedule; not a soil dataset |
| `week5/data/agricultural_knowledge_base.json` | 8,154 bytes | Rule and recommendation knowledge base; not observations |
| `week5/data/crop_requirements.csv` | 472 bytes | Eight crop requirement rows; no observed samples or supervised target |
| `farmer-pwa/tsconfig.json` | 641 bytes | Application configuration |
| `farmer-pwa/package.json` | 423 bytes | Application dependency manifest |

No structured soil-measurement file was found containing observed Nitrogen,
Phosphorus, Potassium, pH, moisture, organic matter, fertility, deficiency,
or crop-label records.

## Dataset suitability

`week5/data/crop_requirements.csv` is a knowledge table used by the existing
rule-based crop compatibility module. Its rows describe requirement ranges for
crops; they are not soil samples and do not contain a legitimate supervised
learning target. Treating those rows as training observations would fabricate
data and invalidate evaluation.

The image folders under `train_data/` and `test/` are separate folder-labelled
image data. They do not contain the structured N/P/K/pH/moisture/organic-matter
measurements needed for structured ML.

## Result

Structured supervised ML is **BLOCKED** until a sourced, licensed soil-test
dataset with measured features and a valid target is added. No structured model,
accuracy, precision, recall, F1 score, confusion matrix, SHAP explanation, or
structured-model confidence is reported.

The existing browser and Python recommendation engines remain the valid
fallback. They use explicit agronomic rules and the crop requirement table;
they are not presented as supervised ML.

## Environment evidence

The project environment currently contains only `pip` in the dedicated Python
environment. TensorFlow/Keras, scikit-learn, XGBoost, SHAP, FastAPI, and Pillow
are not installed. Therefore a CNN/Grad-CAM training run and API run cannot be
claimed as verified in this environment.

## Next legitimate step

Add a documented, licensed structured soil dataset and install a pinned ML
environment. Then implement and run cleaning, split construction, model
training, evaluation, SHAP, and hybrid integration against that real data.
