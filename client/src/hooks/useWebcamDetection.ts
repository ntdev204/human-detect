import { useState, useCallback, useRef, useEffect } from "react";
import {
  DetectionWebSocket,
  DetectionResult,
  ConnectionStatus,
} from "@/lib/api";
import {
  DEFAULT_CONFIDENCE,
  FRAME_INTERVAL_MS,
  IMAGE_QUALITY,
  WEBCAM_CONSTRAINTS,
} from "@/lib/constants";

export function useWebcamDetection(
  onDetection?: (result: DetectionResult) => void,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<DetectionWebSocket | null>(null);
  const lastFrameTime = useRef<number>(0);
  const frameCount = useRef<number>(0);

  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [lastResult, setLastResult] = useState<DetectionResult | null>(null);
  const [fps, setFps] = useState(0);

  const confidenceRef = useRef(DEFAULT_CONFIDENCE);

  const setConfidence = useCallback((c: number) => {
    confidenceRef.current = c;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(frameCount.current);
      frameCount.current = 0;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      if (!isStreaming) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && wsRef.current?.isConnected()) {
        const now = performance.now();
        const elapsed = now - lastFrameTime.current;

        if (elapsed > FRAME_INTERVAL_MS) {
          lastFrameTime.current = now;
          frameCount.current++;

          const ctx = canvas.getContext("2d");
          if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            const imageData = canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
            wsRef.current.sendFrame(imageData, confidenceRef.current);
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    if (isStreaming) {
      loop();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isStreaming]);

  const startStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: WEBCAM_CONSTRAINTS,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      wsRef.current = new DetectionWebSocket({
        onResult: (result) => {
          setLastResult(result);
          onDetection?.(result);
        },
        onStatusChange: setConnectionStatus,
        onError: (error) => console.error("WebSocket error:", error),
      });

      wsRef.current.connect();
      setIsStreaming(true);
    } catch (error) {
      console.error("Failed to start webcam:", error);
    }
  }, [onDetection]);

  const stopStream = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    wsRef.current?.disconnect();
    wsRef.current = null;

    setIsStreaming(false);
    setLastResult(null);
    setConnectionStatus("disconnected");
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    connectionStatus,
    lastResult,
    fps,
    startStream,
    stopStream,
    setConfidence,
  };
}
