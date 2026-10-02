# Methods

1. **Dataset collection:** images are stored in folder-labelled training and
   test directories; provenance and license still require confirmation.
2. **Cleaning:** a SHA-256 audit found 529 files and 9 exact train/test
   overlaps. Original files were preserved.
3. **Splitting:** a clean independent holdout must be rebuilt before CNN
   metrics are reported.
4. **Image preprocessing:** the existing Colab experiment describes
   EfficientNetB0 preprocessing and augmentation, but it has not produced a
   verified local artifact.
5. **CNN:** EfficientNetB0 transfer learning is the intended image method.
6. **Evaluation:** accuracy, precision, recall, F1, and a confusion matrix
   must come from a clean holdout; none are currently reported.
7. **Grad-CAM:** requires the real trained CNN and is not currently available.
8. **Structured ML:** no measured structured soil dataset with a valid target
   was found, so no supervised model is trained.
9. **SHAP:** blocked until a structured model exists.
10. **Hybrid analysis:** blocked until real model outputs exist; the current
    app uses rule-based advisory logic.
11. **Recommendation engine:** transparent rules classify readings and provide
    cautious management guidance.
12. **Crop suitability:** documented crop ranges are compared with readings and
    ranked.
13. **Soil health:** six normalized range-fit indicators are averaged equally
    into a prototype score.
14. **FastAPI:** not connected in the current demonstration.
15. **PostgreSQL:** schema proposal only.
16. **PWA:** Next.js UI presents readings, results, PDF, history, speech, and
    multilingual labels.
