# Kisan Soil Advisor

A mobile-first soil-health and crop-compatibility advisory interface. Enter laboratory soil readings to see nutrient status, an explainable score, management guidance and a ranked crop-compatibility list.

## Run locally

Requirements: Node.js, npm, Python and the repository virtual environment for image classification.

```text
cd "C:\Users\HP\OneDrive\Desktop\infosys springboard\farmer-pwa"
npm install
npm run dev
```

In a second terminal from the workspace root, start FastAPI:

```powershell
& ".\.venv-1\Scripts\python.exe" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Open [http://localhost:3000](http://localhost:3000). The analysis workspace is at `/`; the demo login and dashboard are at `/login` and `/dashboard`. Replace the pre-filled sample values with the N, P, K, pH, moisture and organic-matter values from a soil test, then select **Analyze my soil**. Use **Download Soil Health Report** to save the current result.

Press `Ctrl+C` in the terminal to stop the development server.

For a presentation script and mentor demo walkthrough, see [MENTOR_DEMO.md](./MENTOR_DEMO.md).

## Features

- Validated N/P/K, pH, moisture and organic-matter inputs
- Soil-health score, condition statuses and rule-based recommendations
- Crop compatibility ranking and limiting factors
- Camera capture or image selection with file checks and an image preview
- Recent analysis history stored in the current browser
- Local demo login, protected dashboard and logout; this is not account authentication
- English, Hindi, Kannada and Tamil interface
- Optional browser Web Speech API voice controls for the concise analysis summary, score, deficiencies, recommendations and crops (English, Hindi, Kannada and Tamil), alongside PDF report generation
- Web app manifest and service worker for installable/offline app shell
- Local agriculture illustration and 192px/512px PNG install icons
- Mobile-first responsive layout with large tap targets, visible rule-based/not-a-lab disclosure, reduced-motion support and system dark mode

## Scope and limitations

An uploaded soil photo is validated, previewed, and sent to FastAPI `/predict-image` for an experimental CNN estimate. The current candidate scored 91.6% accuracy on the repository's 143-image test split, but the dataset source/license and independent external validation are unknown; the estimate can still be wrong and must be confirmed separately. Image confidence does not predict nutrients, pH, moisture, organic matter, fertilizer or crop suitability. Those recommendations remain rules-based demonstrations, not yield estimates. Do not use this app instead of a laboratory report, locally calibrated Soil Health Card recommendations or agronomic advice.

The current demo requires all six numeric readings; the pre-filled values are examples, not defaults to use for a real field. Analysis history stays in the current browser and is not synchronized between devices. Login accepts any non-empty identifier and password and stores only a local demo session flag; no account is verified, and real passwords must not be entered. Speech availability and language voices depend on the browser and installed voices. The generated PDF uses English report text for font compatibility. Recommendations are not a substitute for crop-specific or district-specific extension guidance.

## Voice Assistance

- **Technology:** Web Speech API
- **API:** `window.speechSynthesis` and `SpeechSynthesisUtterance`
- **Method:** Text-to-Speech (TTS)
- **Type:** Browser/client-side TTS
- **AI voice model trained:** No

Voice assistance runs entirely in the browser and follows the application's selected language: English (`en-IN`), Hindi (`hi-IN`), Kannada (`kn-IN`), and Tamil (`ta-IN`). Availability and pronunciation depend on browser support and installed device voices; no voice service or separate AI voice model is deployed.

For a remote or LAN deployment, set `NEXT_PUBLIC_API_URL` to the reachable FastAPI base URL and `SOIL_ADVISOR_CORS_ORIGINS` to a comma-separated list of exact PWA origins before starting/building the services. Do not use `localhost` as the API host from an Android phone; it refers to the phone itself.

## PWA checks

The manifest, service worker and local 192px/512px icons are configured. This does not itself verify installation. Serve the production app over HTTPS (or use `localhost` for local development). On Android Chrome, open the deployed URL and use **Install app** when offered. Confirm standalone launch, camera capture, voice playback, downloads and offline behavior on the target device; prompts vary by browser version and device. Physical Android installation and Chrome testing remain outstanding.

## Validation

From the workspace root, run:

```text
python -m unittest discover -s week5/tests -p "test_*.py"
python -m unittest discover -s backend/tests -p "test_*.py"
python scripts/verify_cnn_model.py
```

From this directory, build the frontend:

```text
npm run build
```

Manually test camera capture, audible speech, report downloads, installation and offline behavior on target devices. Responsive overflow was checked in a browser at 320, 375, 390, 412, 768, 1024 and 1280 CSS pixels; this is not a substitute for physical Android testing. Keyboard focus indicators and semantic labels are present; assistive-technology and formal contrast testing are still required.
