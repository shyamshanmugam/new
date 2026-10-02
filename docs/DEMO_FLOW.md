# Mentor Demo Flow

## Opening explanation

“This is a farmer-friendly soil advisory PWA. It accepts six soil-test
readings, applies transparent rules, calculates a prototype soil-health score,
provides cautious recommendations, and ranks crops using a compatibility
dataset.”

## Live demonstration

1. Start the app with the commands in [DEPLOYMENT.md](./DEPLOYMENT.md).
2. Open `http://localhost:3000`.
3. Select English, Hindi, Kannada, or Tamil.
4. Replace the sample N/P/K/pH/moisture/organic-matter values.
5. Optionally upload a soil image and explain that this build previews the
   image but does not classify it.
6. Select **Analyze my soil**.
7. Show the score, indicator table, recommendations, crop ranking, PDF,
   speech button, and browser-local history.

## Honest Week 4 explanation

“The repository contains an EfficientNetB0 Colab experiment, but no verified
exported model. The image audit found exact duplicates across the supplied
train/test folders, and no valid structured soil-measurement dataset was
found. Therefore I have not invented accuracy, confidence, Grad-CAM, SHAP, or
hybrid results. The next step is to train in Colab, download the real artifact,
serve it with FastAPI, and then connect the PWA.”
