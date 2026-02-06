import { DetectionResult, WebSocketOptions } from "@/types";
import { WS_CONFIG } from "./constants";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
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

export class DetectionWebSocket {
  private ws: WebSocket | null = null;
  private options: WebSocketOptions;
  private reconnectAttempts = 0;
  private shouldReconnect = true;

  constructor(options: WebSocketOptions = {}) {
    this.options = options;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.shouldReconnect = true;
    this.options.onStatusChange?.("connecting");

    try {
      this.ws = new WebSocket(`${WS_URL}/api/ws/detect`);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.options.onStatusChange?.("connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const result: DetectionResult = JSON.parse(event.data);
          this.options.onResult?.(result);
        } catch (e) {
          console.error("Failed to parse detection result:", e);
        }
      };

      this.ws.onerror = (event) => {
        this.options.onStatusChange?.("error");
        this.options.onError?.(event);
      };

      this.ws.onclose = () => {
        this.options.onStatusChange?.("disconnected");
        if (this.shouldReconnect) {
          this.attemptReconnect();
        }
      };
    } catch {
      this.options.onStatusChange?.("error");
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < WS_CONFIG.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (this.shouldReconnect) {
          this.connect();
        }
      }, WS_CONFIG.reconnectDelay * this.reconnectAttempts);
    }
  }

  sendFrame(imageBase64: string, confidence: number = 0.5): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          image: imageBase64,
          confidence,
        }),
      );
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
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

export type {
  DetectionResult,
  Detection,
  BoundingBox,
  ConnectionStatus,
  WebSocketOptions,
} from "@/types";
