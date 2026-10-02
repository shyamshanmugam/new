# Architecture

The platform has three boundaries:

```text
Next.js mobile UI -> FastAPI validation/API -> domain services
                                      |-> structured soil baseline
                                      |-> image classifier integration point
                                      |-> recommendation engine
```

The structured path accepts laboratory measurements and currently uses a
transparent rule-based baseline. The image path validates JPEG/PNG input and
returns `not_trained` until a documented CNN artefact is supplied. These paths
must remain separate because the available soil images do not contain laboratory
nutrient labels.

## Future replacement points

- Replace `src/cnn/classifier.py` with a ResNet-50 or EfficientNet loader after
  training and evaluating on the documented soil classes.
- Replace `src/structured_ml/analyzer.py` with a persisted gradient-boosted model
  trained on a real, versioned CSV.
- Add PostgreSQL persistence behind `backend/app/services.py`.
- Add SHAP and Grad-CAM only when the corresponding trained models exist.
