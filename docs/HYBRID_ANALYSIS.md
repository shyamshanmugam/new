# Hybrid Analysis

The intended hybrid flow has three separate evidence sources:

1. CNN image class and measured probability.
2. Structured-model prediction and measured probability, if a valid model
   exists.
3. Deterministic rule-based soil health, recommendations, and crop ranking.

These outputs must not be averaged as if they represented the same quantity.
The response should preserve each source and state which components were
available. If a model is unavailable, the application must show the
rule-based advisory fallback and must not label it as hybrid AI.

The current running PWA uses source 3 only.
