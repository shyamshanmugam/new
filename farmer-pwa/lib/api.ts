export type ImagePrediction = {
  predicted_class: string;
  confidence: number;
  class_probabilities: Record<string, number>;
  model_name: string;
  model_status: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function predictImage(file: File): Promise<ImagePrediction> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${apiUrl}/predict-image`, { method: "POST", body });
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof payload === "object" && payload !== null && "detail" in payload
      ? String(payload.detail)
      : "Image model is unavailable.";
    throw new Error(detail);
  }
  return payload as ImagePrediction;
}
