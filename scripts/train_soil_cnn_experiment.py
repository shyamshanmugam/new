from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
import tensorflow as tf


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATASET = ROOT / "final_soil_dataset"
DEFAULT_SOURCE_MODEL = ROOT / "model_artifacts" / "soil_cnn_final.keras"
DEFAULT_OUTPUT = ROOT / "model_artifacts" / "soil_cnn_experimental.keras"
DEFAULT_METRICS = ROOT / "model_artifacts" / "soil_cnn_experimental_metrics.json"
SPLITS = ("train", "validation", "test")


def reject_cross_split_duplicates(dataset_root: Path) -> None:
    hashes: dict[str, tuple[str, Path]] = {}
    for split in SPLITS:
        for image_path in (dataset_root / split).rglob("*"):
            if not image_path.is_file():
                continue
            digest = hashlib.sha256(image_path.read_bytes()).hexdigest()
            previous = hashes.get(digest)
            if previous is not None and previous[0] != split:
                raise ValueError(
                    f"Exact image duplicate crosses {previous[0]} and {split}: "
                    f"{previous[1]} and {image_path}"
                )
            hashes[digest] = (split, image_path)


def make_dataset(dataset_root: Path, split: str, class_names: list[str], batch_size: int):
    return tf.keras.utils.image_dataset_from_directory(
        dataset_root / split,
        class_names=class_names,
        image_size=(224, 224),
        batch_size=batch_size,
        label_mode="int",
        shuffle=split == "train",
        seed=42,
    ).prefetch(tf.data.AUTOTUNE)


def class_counts(dataset, number_of_classes: int) -> list[int]:
    counts = np.zeros(number_of_classes, dtype=np.int64)
    for _, labels in dataset.unbatch():
        counts[int(labels.numpy())] += 1
    return counts.tolist()


def evaluate(model, dataset, class_names: list[str]) -> dict:
    confusion = np.zeros((len(class_names), len(class_names)), dtype=np.int64)
    for images, labels in dataset:
        probabilities = model(images, training=False).numpy()
        predictions = np.argmax(probabilities, axis=1)
        for actual, predicted in zip(labels.numpy(), predictions):
            confusion[int(actual), int(predicted)] += 1

    total = int(confusion.sum())
    per_class = {}
    recalls = []
    for index, name in enumerate(class_names):
        support = int(confusion[index].sum())
        recall = float(confusion[index, index] / support) if support else 0.0
        precision_count = int(confusion[:, index].sum())
        precision = float(confusion[index, index] / precision_count) if precision_count else 0.0
        per_class[name] = {
            "precision": precision,
            "recall": recall,
            "support": support,
        }
        if support:
            recalls.append(recall)

    return {
        "accuracy": float(np.trace(confusion) / total) if total else 0.0,
        "macro_recall": float(np.mean(recalls)) if recalls else 0.0,
        "per_class": per_class,
        "confusion_matrix": confusion.tolist(),
        "prediction_counts": confusion.sum(axis=0).tolist(),
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train an experimental soil-image classifier without changing the production model."
    )
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--source-model", type=Path, default=DEFAULT_SOURCE_MODEL)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--metrics", type=Path, default=DEFAULT_METRICS)
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch-size", type=int, default=16)
    args = parser.parse_args()

    class_names_path = ROOT / "model_artifacts" / "soil_class_names.json"
    class_names = json.loads(class_names_path.read_text(encoding="utf-8"))
    if isinstance(class_names, dict):
        class_names = [class_names[str(index)] for index in range(len(class_names))]
    if not isinstance(class_names, list) or len(class_names) != 4 or not all(
        isinstance(name, str) and name.strip() for name in class_names
    ):
        raise ValueError("soil_class_names.json must contain the four expected soil classes.")
    for split in SPLITS:
        split_classes = {path.name for path in (args.dataset / split).iterdir() if path.is_dir()}
        if split_classes != set(class_names):
            raise ValueError(f"{split} class folders do not match soil_class_names.json.")

    reject_cross_split_duplicates(args.dataset)
    tf.keras.utils.set_random_seed(42)
    train = make_dataset(args.dataset, "train", class_names, args.batch_size)
    validation = make_dataset(args.dataset, "validation", class_names, args.batch_size)
    test = make_dataset(args.dataset, "test", class_names, args.batch_size)
    counts = class_counts(train, len(class_names))
    class_weights = {
        index: sum(counts) / (len(class_names) * count)
        for index, count in enumerate(counts)
        if count
    }

    source_model = tf.keras.models.load_model(args.source_model, compile=False)
    backbone = source_model.get_layer("efficientnetb0")
    backbone.trainable = False
    augmentation = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomRotation(0.08),
            tf.keras.layers.RandomZoom(0.08),
        ],
        name="training_augmentation",
    )
    inputs = tf.keras.Input(shape=(224, 224, 3), name="soil_image")
    features = augmentation(inputs)
    features = backbone(features, training=False)
    features = tf.keras.layers.GlobalAveragePooling2D()(features)
    features = tf.keras.layers.Dropout(0.3)(features)
    features = tf.keras.layers.Dense(128, activation="relu")(features)
    features = tf.keras.layers.Dropout(0.2)(features)
    outputs = tf.keras.layers.Dense(len(class_names), activation="softmax")(features)
    model = tf.keras.Model(inputs, outputs, name="soil_cnn_experimental")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=["accuracy"],
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss", patience=5, restore_best_weights=True
        ),
        tf.keras.callbacks.ModelCheckpoint(
            args.output, monitor="val_loss", save_best_only=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6
        ),
    ]
    history = model.fit(
        train,
        validation_data=validation,
        epochs=args.epochs,
        class_weight=class_weights,
        shuffle=False,
        callbacks=callbacks,
    )

    best_model = tf.keras.models.load_model(args.output, compile=False)
    metrics = {
        "model": args.output.name,
        "class_names": class_names,
        "dataset": str(args.dataset.relative_to(ROOT)),
        "train_counts": counts,
        "validation_counts": class_counts(validation, len(class_names)),
        "test_counts": class_counts(test, len(class_names)),
        "epochs_completed": len(history.history["loss"]),
        "test": evaluate(best_model, test, class_names),
        "warning": "Experimental result on repository data; source licensing and independent validation are not established.",
    }
    args.metrics.write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()