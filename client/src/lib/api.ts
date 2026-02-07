import { DetectionResult } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class DetectionError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DetectionError";
  }
}

export async function detectImage(
  file: File,
  confidence: number = 0.5,
  signal?: AbortSignal,
): Promise<DetectionResult> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      `${API_URL}/api/detect?confidence=${confidence}`,
      {
        method: "POST",
        body: formData,
        signal,
      },
    );

    if (!response.ok) {
      throw new DetectionError(
        `Detection failed: ${response.statusText}`,
        response.status,
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof DetectionError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new DetectionError("Detection cancelled", undefined, error);
    }
    throw new DetectionError(
      "Network error during detection",
      undefined,
      error,
    );
  }
}

export async function detectBase64(
  imageBase64: string,
  confidence: number = 0.5,
  signal?: AbortSignal,
): Promise<DetectionResult> {
  try {
    const response = await fetch(`${API_URL}/api/detect/base64`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageBase64,
        confidence,
      }),
      signal,
    });

    if (!response.ok) {
      throw new DetectionError(
        `Detection failed: ${response.statusText}`,
        response.status,
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof DetectionError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new DetectionError("Detection cancelled", undefined, error);
    }
    throw new DetectionError(
      "Network error during detection",
      undefined,
      error,
    );
  }
}

export type {
  DetectionResult,
  Detection,
  BoundingBox,
  ConnectionStatus,
} from "@/types";
