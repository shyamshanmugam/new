from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "model_artifacts" / "soil_cnn_experimental.keras"
CLASS_NAMES_PATH = ROOT / "model_artifacts" / "soil_class_names.json"


def main() -> int:
    print(f"model path: {MODEL_PATH}")
    print(f"file size: {MODEL_PATH.stat().st_size if MODEL_PATH.is_file() else 0} bytes")
    class_data = json.loads(CLASS_NAMES_PATH.read_text(encoding="utf-8"))
    names = (
        [class_data[str(i)] for i in range(len(class_data))]
        if isinstance(class_data, dict)
        else class_data
    )
    print(f"class mapping: {names}")
    try:
        import tensorflow as tf

        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        print(f"input shape: {model.input_shape}")
        print(f"output shape: {model.output_shape}")
        print(f"parameter count: {model.count_params()}")
        if tuple(model.input_shape[1:]) != (224, 224, 3):
            raise ValueError(f"unexpected input shape: {model.input_shape}")
        if model.output_shape[-1] != len(names):
            raise ValueError("output class count does not match class mapping")
        print("loads successfully: yes")
        return 0
    except (ImportError, OSError, RuntimeError, ValueError) as error:
        print(f"loads successfully: no ({error})")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
