# CNN Method and Colab Handoff

The existing experiment uses EfficientNetB0 transfer learning in a
Colab-oriented script. The reproducible workflow is:

1. Audit and deduplicate the image collection.
2. Build a leakage-free train/validation/test split.
3. Resize images consistently and use the preprocessing expected by the
   selected EfficientNetB0 implementation.
4. Train with deterministic seeds, validation monitoring, early stopping,
   checkpointing, and learning-rate reduction.
5. Save the actual model and class mapping.
6. Evaluate only on the clean holdout and save measured metrics.

Required exports:

```text
ml/models/soil_cnn.keras
ml/artifacts/class_names.json
ml/artifacts/cnn_metrics.json
```

The active artifact is `model_artifacts/soil_cnn_experimental.keras`; the old
`soil_cnn_final.keras` remains as a backup. Both supplied checkpoints had an
extra `/255` rescaling layer before EfficientNetB0's own preprocessing and
predicted Red Soil for all 143 test images. The experimental script reuses the
backbone weights but feeds the expected raw `[0, 255]` pixels, uses class
weights, rejects exact cross-split duplicates, and evaluates the fixed test
split. It achieved 91.6% accuracy and 90.7% macro recall on 143 images, with
Black Soil recall 92.5%. The source/license is undocumented and no external
holdout is available, so these are experimental split metrics, not production
validation. Do not use image predictions as agronomic advice.

Reproduce the candidate with `python scripts/train_soil_cnn_experiment.py`.
The script writes a separate model and metrics file, never overwriting the
production backup. The FastAPI service loads the configured artifact once.
