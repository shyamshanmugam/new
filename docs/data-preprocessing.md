# Data Preparation and Model Readiness

## Current state

The Colab-oriented image-preparation script describes image discovery, folder-derived labels, duplicate hashing, image verification, RGB conversion, resizing to 224×224, pixel rescaling, augmentation, and train/validation/test directory creation. It depends on Colab upload/mount paths and is not a verified local pipeline. No processed dataset artifact or training run was found in the workspace.

The current directory split must not be used for reliable test metrics: 9 exact image contents occur in both `train_data/` and `test/`. Duplicate detection should run before split assignment; all copies of a duplicate image must stay in one split or be removed. Keep a separate, deduplicated holdout and record class counts before training.

The Colab script also contains repeated alternative model-building cells. One later cell assigns a `Dropout` layer object without applying it to the feature tensor before constructing the final Dense layer. Treat the notebook-generated training code as experimental until this is corrected and the complete run succeeds.

## Recommended safe preparation sequence

1. Confirm image source, license, and class definitions.
2. Decode each image and record failures, dimensions, format, and class.
3. Normalize folder labels consistently; review labels manually.
4. Hash images and remove or group exact duplicates before splitting.
5. Split by duplicate group, preferably stratified by class; keep a final test set untouched during model selection.
6. Resize and normalize consistently in the model pipeline. Apply augmentation only to training data.
7. Save the split manifest, class mapping, preprocessing parameters, random seed, metrics, and model artifact together.
8. Report per-class precision/recall/F1 and confusion matrix on the deduplicated holdout; do not infer soil chemistry from image classes.

## Structured data readiness

There is no suitable labeled soil-sample table to clean or train. The crop-requirements CSV is a hand-authored compatibility knowledge base. Structured ML should remain blocked until a sourced dataset with defined units, laboratory methods, and valid targets is provided.
