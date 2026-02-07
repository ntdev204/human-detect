import { useState, useCallback, useRef, useEffect } from "react";
import { detectBase64, DetectionResult } from "@/lib/api";
import {
  DEFAULT_CONFIDENCE,
  POLLING_INTERVAL_MS,
  IMAGE_QUALITY,
  WEBCAM_CONSTRAINTS,
} from "@/lib/constants";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export function useWebcamDetection(
  onDetection?: (result: DetectionResult) => void,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const frameCount = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

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

  const processFrame = useCallback(async () => {
    if (isProcessingRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0) return;

    isProcessingRef.current = true;

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/jpeg", IMAGE_QUALITY);

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const result = await detectBase64(
        imageData,
        confidenceRef.current,
        abortControllerRef.current.signal,
      );

      frameCount.current++;
      setLastResult(result);
      onDetection?.(result);
      setConnectionStatus("connected");
    } catch {
      // Ignore abort errors, log others silently
    } finally {
      isProcessingRef.current = false;
    }
  }, [onDetection]);

  const startStream = useCallback(async () => {
    try {
      setConnectionStatus("connecting");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: WEBCAM_CONSTRAINTS,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      pollingRef.current = setInterval(processFrame, POLLING_INTERVAL_MS);
      setIsStreaming(true);
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Failed to start webcam:", error);
      setConnectionStatus("error");
    }
  }, [processFrame]);

  const stopStream = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    abortControllerRef.current?.abort();

    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

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
