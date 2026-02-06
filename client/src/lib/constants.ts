export const DEFAULT_CONFIDENCE = 0.5;
export const FPS_LIMIT = 15;
export const FRAME_INTERVAL_MS = Math.floor(1000 / FPS_LIMIT);

export const WS_CONFIG = {
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
} as const;

export const IMAGE_QUALITY = 0.7;
export const WEBCAM_CONSTRAINTS = {
  width: 640,
  height: 480,
  facingMode: "user",
} as const;

export const NOOP = () => {};
export const NOOP_ASYNC = async () => {};
