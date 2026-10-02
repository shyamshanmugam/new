# Week 4 — AI/ML Status

## Scope

Week 4 covers CNN image classification, clean evaluation, Grad-CAM,
structured soil ML, SHAP, and hybrid analysis.

## Verified work

### Image dataset audit

- `train_data/`: 371 files.
- `test/`: 158 files.
- Classes inferred from folders: Alluvial, Black, Clay, and Red soil.
- Total files: 529.
- Unique SHA-256 contents: 481.
- Repeated hash groups: 41.
- Redundant file entries: 48.
- Distinct hashes present in both train and test: 9.
- Cross-split class conflicts: 0.

The original folders were preserved. Because exact duplicates cross the
current split, the supplied test folder is not an independent holdout and no
CNN metric is reported from it.

### Existing Week 3 material

The repository contains Colab-oriented EfficientNetB0 training code in
`soli_data_set_for_infosys_done_for_you (2).py` and image-related code in the
Milestone notebook/script. No verified local `.keras` model, class mapping,
completed evaluation report, or reproducible local training environment is
present.

## Components not claimable as complete

| Component | Status | Reason |
|---|---|---|
| CNN training/evaluation | BLOCKED | No verified model artifact; current split contains cross-split duplicates; required ML packages are absent |
| Grad-CAM | BLOCKED | No verified trained CNN exists to explain |
| Structured dataset | BLOCKED | No observed N/P/K/pH/moisture/organic-matter dataset with a valid target was found |
| Structured ML | BLOCKED | Training without a legitimate dataset/target would fabricate results |
| SHAP | BLOCKED | No structured model exists |
| Hybrid AI | BLOCKED | It must consume verified model outputs; the running app currently uses rule-based analysis only |

## Existing working fallback

The rule-based advisory path is implemented and tested separately:

- six soil readings are validated;
- nutrient, pH, moisture, and organic-matter conditions are classified;
- a documented equal-weight soil-health score is calculated;
- management recommendations are generated;
- crop compatibility is ranked from the crop requirement table.

This fallback is explicitly labelled as rule-based and not a laboratory
diagnosis or ML confidence score.

## Reproducible verification

From the project root:

```powershell
& ".\.venv-1\Scripts\python.exe" -m unittest discover -s ".\week5\tests" -p "test_*.py"
Set-Location ".\farmer-pwa"
npm run build
```

The focused Python suite passes 9 tests and the Next.js production build
passes. The repeatable image audit is:

```powershell
Set-Location "C:\Users\HP\OneDrive\Desktop\infosys springboard"
& ".\scripts\audit_image_dataset.ps1"
```
