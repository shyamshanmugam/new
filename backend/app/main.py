from __future__ import annotations

import os

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .schemas import ModelInfoResponse, SoilAnalysisResponse, SoilParameters
from .services.advisory_service import analyze_soil
from .services.cnn_service import predict_image as run_image_prediction
from .services.model_registry import model_available, model_info

app = FastAPI(title="Soil Analytics API", version="0.1.0")
cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "SOIL_ADVISOR_CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    loaded = model_info()["model_available"]
    return {"status": "ok", "cnn_model_loaded": loaded, "structured_ml_available": False}


@app.get("/model-info", response_model=ModelInfoResponse)
def get_model_info() -> dict:
    return model_info()


@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)) -> dict:
    allowed = {"image/jpeg", "image/png", "image/jpg"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=415, detail="Upload a JPEG or PNG image.")
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be smaller than 10 MB.")
    if not model_available():
        raise HTTPException(status_code=503, detail="CNN model unavailable. Showing rule-based soil advisory only.")
    try:
        return run_image_prediction(contents)
    except (FileNotFoundError, ImportError, RuntimeError) as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.post("/analyze-soil", response_model=SoilAnalysisResponse)
def analyze_soil_endpoint(parameters: SoilParameters) -> dict:
    return analyze_soil(parameters.model_dump())


@app.post("/hybrid-analysis")
async def hybrid_analysis(parameters: SoilParameters, file: UploadFile | None = File(default=None)) -> dict:
    rule_result = analyze_soil(parameters.model_dump())
    if not file or not model_available():
        return {"hybrid_available": False, "reason": "CNN model unavailable; rule-based advisory returned.", "soil_analysis": rule_result}
    return {"hybrid_available": False, "reason": "Structured ML model unavailable; rule-based advisory returned.", "soil_analysis": rule_result}
