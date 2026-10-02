# Final Verification Report

Date: 2026-10-01

| Component | Status | Command/evidence | Result |
|---|---|---|---|
| Image audit | COMPLETE | `scripts/audit_image_dataset.ps1` | 529 files; 9 cross-split duplicate hashes |
| Recommendation tests | COMPLETE | Python unittest discovery | 9 tests passed |
| PWA build | COMPLETE | `cd farmer-pwa; npm run build` | Next.js production build passed |
| Browser advisory flow | COMPLETE | Local browser at `http://localhost:3000` | Score, recommendations, crops, history verified |
| Tamil UI | COMPLETE | Browser language selector | Tamil text rendered |
| Structured dataset | BLOCKED | Recursive data-file inventory | No valid measured soil dataset found |
| CNN training | EXPERIMENTAL CANDIDATE TRAINED | `scripts/train_soil_cnn_experiment.py` | New candidate uses the supplied backbone with corrected raw-pixel input preprocessing; production claims remain blocked by source/license and external validation gaps |
| CNN metrics | EXPERIMENTAL, NOT EXTERNALLY VALIDATED | `model_artifacts/soil_cnn_experimental_metrics.json` | Candidate scores 0.9161 accuracy and 0.9068 macro recall on 143 images; the previous checkpoint scored 0.3007 and predicted Red Soil for every image |
| Model artifact handoff | EXPERIMENTAL | `scripts/verify_cnn_model.py` | Candidate is 19,034,687 bytes and loads with input `(None, 224, 224, 3)`, four outputs and the verified class mapping |
| Real image prediction | COMPLETE WITH LIMITATIONS | Live Uvicorn POST `/predict-image` with labeled Black Soil image | Correctly predicted Black Soil for `Black_1.jpg`; candidate still misclassified one of three manually spot-checked Black images |
| Grad-CAM | BLOCKED | Explainability was not implemented | The CNN is loaded, but no Grad-CAM output is claimed |
| SHAP | BLOCKED | Same evidence | No structured model |
| FastAPI service | COMPLETE | Backend syntax check and live Uvicorn check | `/health`, `/model-info`, `/predict-image`, and rule-based routes verified |
| FastAPI endpoint tests | COMPLETE | `backend/tests/test_api.py` via unittest | 14 tests pass, including artifact, mapping, model loading, synthetic-image prediction, invalid MIME, missing model, mismatch handling, and local PWA CORS preflight |
| PostgreSQL | PARTIAL | `database/schema.sql` | Proposal exists; not connected |

## Commands

```powershell
cd "C:\Users\HP\OneDrive\Desktop\infosys springboard"
& ".\.venv-1\Scripts\python.exe" ".\scripts\verify_cnn_model.py"
& ".\.venv-1\Scripts\python.exe" -m unittest discover -s ".\backend\tests" -p "test_*.py"
& ".\.venv-1\Scripts\python.exe" -m unittest discover -s ".\week5\tests" -p "test_*.py"
& ".\scripts\audit_image_dataset.ps1"
cd ".\farmer-pwa"
npm run build
npm run dev
```

## Conclusion

The verified deliverable is a rule-based soil advisory PWA with a connected,
experimental CNN image-classification path. The prior checkpoint is not
reliable for soil identification. A corrected-preprocessing candidate performs
better on the repository's test split but is not independently validated and
must not be the sole basis for farmer decisions. The CNN does not predict
nutrients, pH, moisture, organic matter, fertilizer, or crop suitability; those
remain separate rule-based advisory outputs.

## Milestone 3 Audit (2026-09-28)

| Requirement | Status | Evidence and remaining limitation |
|---|---|---|
| Week 5 recommendation engine | ✅ COMPLETE | `week5/tests`: 9 tests pass; current browser analysis shows recommendations. |
| Week 5 crop suitability | ✅ COMPLETE | Crop ranking and limiting factors are returned and displayed. |
| Week 5 soil-health scoring | ✅ COMPLETE | Score and grade are displayed from current N/P/K/pH/moisture/organic-matter readings. |
| CNN → FastAPI → Next.js integration | ⚠️ EXPERIMENTAL | The corrected-preprocessing candidate is connected; `Black_1.jpg` now predicts Black Soil. Test-split metrics are not external validation and errors remain possible. |
| Image upload and camera capture | ⚠️ PARTIAL | File input, preview and Android `capture="environment"` are present; physical camera capture needs Android verification. |
| Soil parameter entry and results | ✅ COMPLETE | Browser analysis displayed readings, conditions, deficiencies, score, recommendations and crop ranking. |
| Week 6 #25 Hindi | ✅ COMPLETE | Hindi login, dashboard, analysis labels and recommendation copy rendered in browser. |
| Week 6 #26 Kannada | ✅ COMPLETE | Kannada analysis and recommendation copy rendered; language code changed to `kn`. |
| Week 6 #27 Voice Output | IMPLEMENTED | Reusable Web Speech API component with Read/Pause/Resume/Stop, translated result content and speaking status. Browser-mocked checks confirmed `en-IN`, `hi-IN`, `kn-IN`, playback actions and unavailable-API fallback; audible/device playback was not independently confirmed. |
| Week 6 #28 downloadable PDF | ⚠️ PARTIAL | Report content is generated from the current analysis and includes classifier, readings, deficiencies, recommendations and crops. The browser harness did not expose a download event, so a saved PDF was not confirmed. |
| Week 6 #29 PWA configuration | ✅ COMPLETE | Manifest, standalone display, service worker, route/app-shell caching, local 192px/512px PNG icons and install prompt hook are present; browser registered the service worker. |
| Week 6 #30 PWA installation test | 🧪 NEEDS REAL DEVICE TEST | No Android install prompt or standalone launch was exercised on a physical device. |
| Week 6 #31 Android Chrome test | 🧪 NEEDS REAL DEVICE TEST | No physical Android device is available in this environment. |
| Week 6 #32 responsive layouts | ✅ COMPLETE | Browser viewport checks at 320, 375, 390, 412, 768, 1024 and 1280 CSS px found no horizontal document overflow after the service-worker cache update. |
| Week 6 #33 usability fixes | ✅ COMPLETE | Browser login/logout, protected dashboard redirect, language selection, analysis navigation and eight dashboard tools were exercised. |
| Demo login/logout | ✅ COMPLETE | Any non-empty identifier/password creates a local demo session; logout clears it. This is explicitly not real authentication. |
| Agriculture dashboard visual | ✅ COMPLETE | Original local field/soil illustration loaded in the dashboard; no remote image dependency. |
| Accessibility and contrast audit | ⚠️ PARTIAL | Labels, alt text, semantic controls and visible focus states exist; screen-reader and formal contrast testing remain outstanding. |
| Live model and API checks | ✅ COMPLETE WITH MODEL LIMITATIONS | 14 backend tests pass; model verifier confirms the experimental artifact's four classes, mapping, expected shapes and parameter count. |

### Verification in This Session

- `npx tsc --noEmit` and `npm run build`: passed; routes include `/`, `/login`, `/dashboard` and `/manifest.webmanifest`.
- `python -m unittest discover -s backend/tests -p "test_*.py"`: 14 tests passed. The GitHub-ready suite uses a generated synthetic JPEG so it does not depend on excluded raw dataset images; the earlier `Black_1.jpg` live prediction is recorded separately as a local spot check.
- `python -m unittest discover -s week5/tests -p "test_*.py"`: 9 tests passed.
- `python scripts/verify_cnn_model.py`: model loads; input `(None, 224, 224, 3)`, output `(None, 4)`, 4,214,055 parameters, and class mapping validated.
- Browser checks: demo login/dashboard/logout, unauthenticated redirect, Hindi analysis, Kannada analysis copy, service-worker registration and responsive widths exercised.
- Live FastAPI checks: `/health` returned `ok` with the CNN loaded; `/model-info` returned the four expected class names. A fresh server using defaults allowed the PWA origin on port `3001`.
- A dataset-labeled Black Soil sample was sent to the prior model and predicted as Red Soil (34.6% Red vs 21.5% Black), confirming its all-Red class-collapse behavior.
- The corrected-preprocessing candidate scores 91.61% accuracy and 90.68% macro recall on the repository's 143-image test split; class recalls are Alluvial 84.0%, Black 92.45%, Clay 90.91%, and Red 95.35%. `Black_1.jpg` is predicted as Black Soil at 73.05%; one of three additional spot checks was misclassified.
- Final browser upload with `Black_1.jpg` displayed Black Soil (73%), the experimental-model warning, score 75, and five crop cards with no UI error. Service-worker cache v5 evicted the stale result UI.
- Browser upload/CORS was verified against the restarted API. The labeled Black Soil sample displayed Black Soil (73%) and the experimental warning in the current PWA.
- The PWA labels output experimental and includes the split metric and independent-verification warning in UI, spoken summary, and PDF. Dataset source/license and external validation remain unresolved.
- Browser-mocked speech checks confirmed English/Hindi/Kannada locales (`en-IN`, `hi-IN`, `kn-IN`), translated visible-result content, Listen disabled while speaking, Stop cancellation and the friendly unavailable-API message. The browser environment exposed three voices, but audible output was not independently heard and Android voice testing remains outstanding.
- PDF generation code and button were exercised, but no browser download event was observed.

### GitHub Packaging Verification

The backend regression tests use a generated in-memory JPEG and do not require the source image datasets. Raw soil-image folders, virtual environments, archives, logs and frontend build output are excluded from the GitHub update. The three required `.keras` model files are retained.

### Device and Deployment Limits

PWA installation, Android Chrome, camera capture and standalone/offline behavior need a physical Android device. For remote use, configure `NEXT_PUBLIC_API_URL` and `SOIL_ADVISOR_CORS_ORIGINS`; the local default `localhost` API URL is not reachable from a phone as-is. The demo login is not a security boundary. Do not report the entire milestone complete until the voice audio, saved PDF, Android install and Android Chrome checks are completed.

## Final Release Verification (2026-10-01)

- FastAPI defaults now allow local PWA origins on ports `3000` and `3001`; a regression test verifies the `3001` preflight without an environment override.
- Network failures from the optional CNN image service now display a translated fallback while preserving soil-reading analysis, rather than exposing the raw `Failed to fetch` exception.
- Backend tests: 14 passed. Week 5 tests: 9 passed.
- CNN verification passed: four expected classes, input `(None, 224, 224, 3)`, output `(None, 4)`, and 4,214,055 parameters.
- PWA TypeScript check and Next.js production build passed. ESLint is not configured in `farmer-pwa/package.json`.
- Source and automated checks are ready for handoff. Physical Android voice playback, installation, camera behavior, saved PDF verification, and production authentication/deployment still need their respective device and deployment setup.

### GitHub Worktree Revalidation (2026-10-01)

- Backend API tests: 14 passed using an in-memory synthetic JPEG fixture.
- Week 5 tests: 9 passed.
- CNN verification passed for the experimental default; all three `.keras` files loaded with input `(None, 224, 224, 3)` and four outputs. Each file is approximately 19 MB.
- `corepack pnpm install --frozen-lockfile`, `pnpm exec tsc --noEmit`, and `pnpm build` passed in the GitHub worktree. The Next.js build generated `/`, `/login`, `/dashboard`, and `/manifest.webmanifest`.
- Python syntax compilation passed for backend, tests, Week 5 modules, and scripts.
- Raw dataset folders and generated build output were not imported into the GitHub worktree.
- GitHub Actions backend CI initially failed because `pytest` was not installed and its legacy tests targeted an older API. The workflow now installs backend/runtime and test dependencies; test collection includes the current backend and Week 5 suites, and the legacy API checks exercise the current routes.
- Full pytest suite after the CI correction: 27 passed, with 10 subtests passed.
