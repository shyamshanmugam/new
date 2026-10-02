# Deployment Notes

## Current demonstration

FastAPI serves the experimental `model_artifacts/soil_cnn_experimental.keras` checkpoint; the PWA calls its `/predict-image` endpoint. It scored 91.6% on the repository's 143-image test split, but has not been independently validated and must not be treated as a production agronomic classifier. The former `soil_cnn_final.keras` checkpoint remains available as a backup.

Start FastAPI from the workspace root:

```powershell
& ".\.venv-1\Scripts\python.exe" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

In a second terminal, run the PWA:

```powershell
cd "C:\Users\HP\OneDrive\Desktop\infosys springboard\farmer-pwa"
npm install
npm run dev
```

Open `http://localhost:3000`. The analysis workspace is `/`; `/login` and `/dashboard` use a local demo session only and are not production authentication.
The API allows the local PWA origins on ports `3000` and `3001` by default. For other origins, set `SOIL_ADVISOR_CORS_ORIGINS` before starting FastAPI.

## Remote and Android testing

Set `NEXT_PUBLIC_API_URL` to the externally reachable FastAPI base URL before building the PWA. Set `SOIL_ADVISOR_CORS_ORIGINS` to the exact comma-separated PWA origins before starting FastAPI. For a phone on the same LAN, bind FastAPI to a reachable interface and use the computer's LAN address; `localhost` on Android points to the phone. Use HTTPS for public PWA installation and configure appropriate TLS, firewall and upload limits before deployment.

The manifest, service worker, install icons and responsive styles are configured. Android Chrome installation, camera capture, offline launch and physical-device behavior have not been tested here and require a real Android device.

PostgreSQL remains a schema proposal only. The current demonstration uses
browser-local history.
