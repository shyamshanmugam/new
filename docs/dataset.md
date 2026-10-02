# Dataset Inventory

## Soil images

The workspace contains folder-labeled images in `train_data/` and `test/`. Counts below were obtained by recursively listing files in each class directory; they have not been individually decoded or manually relabeled.

| Folder split | Class folder | Files |
|---|---|---:|
| train_data | Alluvial Soil | 94 |
| train_data | Black Soil | 96 |
| train_data | Clay Soil | 56 |
| train_data | Red Soil | 125 |
| **train_data total** |  | **371** |
| test | Alluvial soil | 26 |
| test | Black Soil | 66 |
| test | Clay soil | 22 |
| test | Red soil | 44 |
| **test total** |  | **158** |

Image suffixes include JPG/JPEG, PNG, JFIF, and one GIF in the training folders. Labels are inferred from parent folder names, including inconsistent capitalization. Folder labels do not by themselves establish scientifically verified soil taxonomy.

## Integrity and leakage checks

A SHA-256 content comparison over the two directories found 9 distinct file hashes in both the training and test directories. This makes the test split unsuitable as an independent evaluation set until the overlap is resolved and a clean split is rebuilt. The scan found 48 repeated file entries across the complete 529-file inventory; this count includes within-split repeats and the train/test overlap. No cross-split class-name conflict was observed after normalizing folder names.

These are exact-byte duplicate checks only; visually similar images with different encodings may still exist. The dataset has not been fully decoded, quality-screened, or audited for label correctness in this run.

## Provenance and license

The Colab-generated script refers to an uploaded `archive.zip` and a Colab notebook, but the checked-in workspace does not record the archive's original source, license, or redistribution terms. Confirm those rights before training on, publishing, or redistributing the images. Do not upload the raw image collection to a public repository until provenance and license are clear.

## Structured soil measurements

No measured soil-test table with N, P, K, pH, moisture, organic matter, and target labels was found. `week5/data/crop_requirements.csv` has 8 crop rows describing requirement ranges. It is a rule-engine knowledge table, not observed sample data, and must not be used to claim supervised ML.

The image folders are not a structured soil-test database. They contain class labels inferred from directory names, not N/P/K/pH/moisture measurements or deficiency labels.
