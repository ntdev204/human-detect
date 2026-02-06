export interface DetectionResult {
  detections: Detection[];
  count: number;
  has_person: boolean;
}

export interface Detection {
  bbox: BoundingBox;
  confidence: number;
  class: string;
  class_id: number;
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface WebSocketOptions {
  onResult?: (result: DetectionResult) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onError?: (error: Event) => void;
}
