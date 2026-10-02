from pydantic import BaseModel, Field


class SoilParameters(BaseModel):
    nitrogen: float = Field(ge=0)
    phosphorus: float = Field(ge=0)
    potassium: float = Field(ge=0)
    ph: float = Field(ge=0, le=14)
    moisture: float = Field(ge=0, le=100)
    organic_matter: float = Field(ge=0, le=100)


class SoilAnalysisResponse(BaseModel):
    model_type: str
    structured_ml_available: bool
    score: int
    grade: str
    statuses: dict[str, str]
    recommendations: list[dict]
    crops: list[dict]


class ModelInfoResponse(BaseModel):
    model_name: str
    model_available: bool
    model_filename: str
    model_version: str | None
    class_names: list[str]
    input_shape: list[int | None] | None
    output_classes: int | None
    message: str
