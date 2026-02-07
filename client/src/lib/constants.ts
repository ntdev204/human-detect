export const DEFAULT_CONFIDENCE = 0.5;
export const POLLING_FPS = 3;
export const POLLING_INTERVAL_MS = Math.floor(1000 / POLLING_FPS);

export const WS_CONFIG = {
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
} as const;

export const IMAGE_QUALITY = 0.6;
export const WEBCAM_CONSTRAINTS = {
  width: 640,
  height: 480,
  facingMode: "user",
} as const;

export const NOOP = () => {};
export const NOOP_ASYNC = async () => {};
