# Mentor Demo Guide

## Start the application

Open PowerShell or the VS Code terminal and run:

```powershell
cd "C:\Users\HP\OneDrive\Desktop\infosys springboard\farmer-pwa"
npm install
npm run dev
```

Keep the terminal running and open [http://localhost:3000](http://localhost:3000) in a browser. Press `Ctrl+C` in the terminal when you are finished.

## Suggested presentation

### Introduction

> Kisan Soil Advisor is a mobile-friendly application for interpreting soil-test readings. A user enters N, P, K, pH, moisture and organic matter values. The application validates the readings, applies documented rules, calculates a soil-health score, provides management guidance and ranks crops against a crop-requirements dataset.

### Demonstration steps

1. Show the six soil-reading inputs and explain the units shown on screen.
2. Select **Analyze soil** using the sample values already in the form.
3. Walk through the soil-health score, condition statuses, management recommendations and ranked crop results.
4. Change one value to an invalid negative number and analyze again to show input validation. Restore the original value afterward.
5. Change the language selector to Hindi, Kannada and Tamil to demonstrate the translated interface.
6. Show the camera/image control and explain that it validates and previews an image; it does not predict soil type from the image.
7. Show recent analyses and the **Download PDF** control. Explain that history is saved only in the current browser.
8. To demonstrate the mobile layout, use browser developer tools and select a phone-sized viewport. Actual Android installation and camera behavior should be demonstrated only after testing on a physical device.

The updated interface uses a score ring, expandable crop-ranking cards, a visible explanation that the score is rule-based, and clear sample-value/photo-preview notices. It adapts to light or dark system appearance. The existing app is a single-page workflow rather than separate onboarding, capture, and results routes.

## What is implemented

- Validated inputs for N, P, K, pH, moisture and organic matter.
- A rule-based soil-condition and recommendation engine.
- Documented soil-health indicators and scoring methodology.
- Crop compatibility data and crop ranking.
- An English, Hindi, Kannada and Tamil responsive farmer-facing interface.
- A mobile-first visual refresh with high-contrast large controls, a soil-health score ring, expandable crop ranking and a visible explanation of the rule-based estimate.
- Image selection/camera input with validation and preview.
- Browser-local analysis history, speech output, PDF report control, web manifest and service worker.
- Python regression tests for the advisory and crop/health scoring logic.

## Describe the results accurately

The current advisory is a rule-based demonstration. Its values and crop requirements need local agronomic calibration; the app is not a replacement for a laboratory soil report or local agricultural-extension advice. Do not describe the current version as a trained prediction model.

The project plan also includes trained structured-data ML, soil-image classification, Grad-CAM/SHAP explanations, hybrid model analysis, and FastAPI/PostgreSQL integration. These are not part of the current running app: the training dataset and connected model/backend are not available in this workspace. Uploaded images are preview-only. Android installation and camera behavior still require physical-device testing.

No API endpoints were available or stubbed for this UI refresh. History remains a local-browser list and cannot reopen full reports. Verify contrast and layout with your target phone, and test voice synthesis, camera behavior, and PWA installation on the actual Android device before claiming device compatibility.

## If asked how to verify the project

From the workspace root, run the Python tests:

```powershell
& ".\.venv-1\Scripts\python.exe" -m unittest discover -s ".\week5\tests" -p "test_*.py"
```

To build the frontend, open a second terminal:

```powershell
cd "C:\Users\HP\OneDrive\Desktop\infosys springboard\farmer-pwa"
npm run build
```
