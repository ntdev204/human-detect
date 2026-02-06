import { useState, useCallback, useRef, useEffect } from "react";
import { detectImage, DetectionResult, DetectionError } from "@/lib/api";

export function useImageDetection(
  onDetection?: (result: DetectionResult) => void,
) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    abortControllerRef.current?.abort();

    setSelectedFile(file);
    setResult(null);
    setError(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const clearImage = useCallback(() => {
    abortControllerRef.current?.abort();

    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  }, []);

  const drawDetections = useCallback((url: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = url;
  }, []);

  const detect = useCallback(
    async (confidence: number) => {
      if (!selectedFile) return;

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const detectionResult = await detectImage(
          selectedFile,
          confidence,
          abortControllerRef.current.signal,
        );
        setResult(detectionResult);
        onDetection?.(detectionResult);
      } catch (err) {
        if (
          err instanceof DetectionError &&
          err.message === "Detection cancelled"
        ) {
          return;
        }
        setError(err instanceof Error ? err.message : "Detection failed");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedFile, onDetection],
  );

  useEffect(() => {
    if (result && previewUrl) {
      drawDetections(previewUrl);
    }
  }, [result, previewUrl, drawDetections]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    selectedFile,
    previewUrl,
    result,
    isLoading,
    error,
    canvasRef,
    handleFileSelect,
    clearImage,
    detect,
    setError,
  };
}
