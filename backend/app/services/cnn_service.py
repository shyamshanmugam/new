from __future__ import annotations

import io

import numpy as np
from PIL import Image, UnidentifiedImageError

from .model_registry import class_names, load_model, metadata


def predict_image(contents: bytes) -> dict:
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB").resize((224, 224))
    except (UnidentifiedImageError, OSError) as error:
        raise ValueError("The uploaded file is not a readable image.") from error
    # image_dataset_from_directory feeds EfficientNetB0 float pixels in the
    # [0, 255] range; the Keras EfficientNet model applies its own rescaling.
    batch = np.asarray(image, dtype=np.float32)[None, ...]
    model = load_model()
    probabilities = np.asarray(model.predict(batch, verbose=0)[0], dtype=np.float32)
    if probabilities.ndim != 1 or len(probabilities) != len(class_names()):
        raise RuntimeError("Model output does not match the class mapping.")
    probabilities = np.clip(probabilities, 0, None)
    total = float(probabilities.sum())
    if total <= 0:
        raise RuntimeError("Model returned an invalid probability vector.")
    probabilities = probabilities / total
    index = int(np.argmax(probabilities))
    names = class_names()
    return {
        "predicted_class": names[index],
        "confidence": float(probabilities[index]),
        "class_probabilities": {names[i]: float(probabilities[i]) for i in range(len(names))},
        "model_name": metadata().get("model_name", "EfficientNetB0 soil classifier"),
        "model_version": metadata().get("model_version"),
        "model_status": "loaded",
    }
