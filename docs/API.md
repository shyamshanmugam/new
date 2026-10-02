# API and Colab-to-Application Workflow

The intended deployment flow is:

```text
Colab training
  -> download soil_cnn.keras and class_names.json
  -> place artifacts in the inference service
  -> FastAPI loads artifacts at startup
  -> Next.js sends image and soil readings to FastAPI
```

The repository now contains a FastAPI service contract under `backend/app/`.
The rule-based soil endpoint is implemented independently of the CNN artifact.
The browser-only PWA remains runnable without an API.

Available routes:

- `GET /health` reports whether the CNN runtime and artifact are loadable.
- `GET /model-info` reports validated model availability, shape, and classes.
- `POST /analyze-soil` validates six readings and returns the existing
  rule-based score, statuses, recommendations, and crop ranking.
- `POST /predict-image` validates MIME type, decodes and resizes the image to
  224x224 RGB, then returns the real CNN class probabilities. The Colab
  training code uses `image_dataset_from_directory` with EfficientNetB0, whose
  built-in preprocessing expects float pixels in the `[0, 255]` range; the
  service therefore does not apply an additional `/255` scale.
- `POST /hybrid-analysis` returns the rule-based result and explicitly marks
  hybrid analysis unavailable until both model layers exist.

The default experimental CNN image path is
`model_artifacts/soil_cnn_experimental.keras`; class names are loaded from
`model_artifacts/soil_class_names.json`. It was retrained to remove an extra
`/255` input scaling layer and scored 91.6% on the repository's 143-image test
split. This small, source-undocumented dataset is not independent external
validation; predictions are experimental and may be wrong. The prior
`soil_cnn_final.keras` artifact remains available as a backup. If TensorFlow
cannot load the configured artifact, the endpoint returns HTTP 503.

The Next.js client uses `NEXT_PUBLIC_API_URL` (default
`http://localhost:8000`) and sends the selected image to `/predict-image`.
The local API allows requests from the local PWA origins.

Install backend dependencies from `backend/requirements.txt`, then run:

```powershell
cd "C:\Users\HP\OneDrive\Desktop\infosys springboard\backend"
python -m uvicorn app.main:app --reload --port 8000
```

Image uploads must have a size limit and MIME validation; invalid readings
must return a client error, not a fake result. Secrets and database URLs
belong in environment variables.
