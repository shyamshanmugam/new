from __future__ import annotations

import os
import json
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]

def model_path() -> Path:
    configured = Path(os.getenv("MODEL_PATH", "model_artifacts/soil_cnn_experimental.keras"))
    return configured if configured.is_absolute() else ROOT / configured


def model_available() -> bool:
    path = model_path()
    return path.is_file() and path.stat().st_size > 0


def class_names_path() -> Path:
    configured = Path(os.getenv("CLASS_NAMES_PATH", "model_artifacts/soil_class_names.json"))
    return configured if configured.is_absolute() else ROOT / configured


def metadata_path() -> Path:
    configured = Path(os.getenv("MODEL_METADATA_PATH", "model_artifacts/model_metadata.json"))
    return configured if configured.is_absolute() else ROOT / configured


def metadata() -> dict:
    try:
        with metadata_path().open(encoding="utf-8") as file:
            value = json.load(file)
        return value if isinstance(value, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


@lru_cache(maxsize=1)
def class_names() -> list[str]:
    with class_names_path().open(encoding="utf-8") as file:
        mapping = json.load(file)
    if isinstance(mapping, list):
        names = mapping
    elif isinstance(mapping, dict):
        names = [mapping[str(index)] for index in range(len(mapping))]
    else:
        raise ValueError("Class mapping must be a JSON list or index-keyed object.")
    if not names or not all(isinstance(name, str) and name.strip() for name in names):
        raise ValueError("Class mapping contains invalid class names.")
    return names


@lru_cache(maxsize=1)
def load_model():
    if not model_available():
        raise FileNotFoundError(f"CNN model not found: {model_path()}")
    try:
        import tensorflow as tf
    except ImportError as error:
        raise RuntimeError("TensorFlow is required for CNN inference.") from error
    model = tf.keras.models.load_model(model_path(), compile=False)
    shape = tuple(model.input_shape)
    if len(shape) != 4 or tuple(shape[1:]) != (224, 224, 3):
        raise ValueError(f"CNN input shape must be (None, 224, 224, 3), got {shape}.")
    output_shape = tuple(model.output_shape)
    if len(output_shape) != 2 or output_shape[-1] != len(class_names()):
        raise ValueError(
            "CNN output class count does not match soil_class_names.json."
        )
    return model


def model_info() -> dict:
    available = model_available()
    saved_metadata = metadata()
    info = {
        "model_name": saved_metadata.get("model_name", "EfficientNetB0 soil classifier"),
        "model_available": available,
        "model_filename": model_path().name,
        "model_version": saved_metadata.get("model_version"),
        "class_names": [],
        "input_shape": saved_metadata.get("input_shape"),
        "output_classes": saved_metadata.get("output_classes"),
        "message": "A verified Colab-exported model artifact is required before image inference.",
    }
    try:
        info["class_names"] = class_names()
    except (OSError, ValueError, json.JSONDecodeError):
        pass
    if not available:
        return info
    try:
        model = load_model()
        info.update({
            "input_shape": list(model.input_shape),
            "output_classes": int(model.output_shape[-1]),
            "message": "CNN model loaded and ready for image inference.",
        })
    except (ImportError, OSError, RuntimeError, ValueError) as error:
        info["model_available"] = False
        info["message"] = f"CNN model unavailable: {error}"
    return info
