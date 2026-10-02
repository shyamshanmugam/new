# Model Card

FastAPI defaults to the experimental `model_artifacts/soil_cnn_experimental.keras`
artifact, with input shape `(None, 224, 224, 3)` and four image classes. The
original `soil_cnn_final.keras` remains as a backup. Image classification does
not change nutrient or soil-health recommendations, which remain rule-based.

## Current status

The supplied CNN artifact is structurally valid and non-zero. FastAPI validates
its input shape and output class count before serving predictions, and the
verified local runtime successfully loads it. If the TensorFlow runtime or
artifact cannot load, the API reports HTTP 503 instead of fabricating image
predictions.

## Intended use

After a real model is trained and independently evaluated, it may support
soil-class research demonstrations. It must not be presented as a laboratory
diagnosis, fertilizer prescription, or yield guarantee.

## Data

The repository contains 529 folder-labelled soil images. Nine exact contents
occur in both the supplied training and test folders, so the supplied test
folder is not an independent holdout. The source and license are not recorded.
No measured structured N/P/K/pH/moisture/organic-matter dataset with a valid
target was found.

A legacy ZIP named `model_artifacts/soil_cnn_week3_output (1).zip` is retained
as a backup; the configured production artifact is the standalone
`soil_cnn_final.keras`.

The validation command is:

```powershell
& ".\scripts\validate_model_zip.ps1"
```

## Limitations

The original Colab report records 0.3007 accuracy on 143 samples and predicts
Red Soil for every image. Both original checkpoints contained an additional
`/255` layer before EfficientNetB0's internal rescaling.

The experimental retrain removes that extra scaling and achieves 91.6% accuracy
and 90.7% macro recall on the repository's 143-image test split. Per-class
recall: Alluvial 84.0%, Black 92.5%, Clay 90.9%, Red 95.3%. Three manually
checked Black samples included one error, so the output remains explicitly
experimental. The dataset source/license and external validation are unknown;
softmax confidence is not calibrated certainty. Verify soil type independently
and do not base agronomic decisions on the image prediction.
