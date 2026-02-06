"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  User,
  UserX,
  X,
} from "lucide-react";
import NextImage from "next/image";
import { DetectionResult } from "@/lib/api";
import { useImageDetection } from "@/hooks/useImageDetection";

interface ImageUploaderProps {
  onDetection?: (result: DetectionResult) => void;
}

export function ImageUploader({ onDetection }: ImageUploaderProps) {
  const {
    selectedFile,
    previewUrl,
    result,
    isLoading,
    error,
    canvasRef,
    handleFileSelect,
    clearImage,
    detect,
    // setError,
  } = useImageDetection(onDetection);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confidence, setConfidence] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);

  // UI Handlers that are specific to drag-and-drop interaction
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClear = () => {
    clearImage();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Image Upload
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload Area */}
        {!previewUrl ? (
          <div
            className={`relative aspect-video w-full cursor-pointer rounded-lg border-2 border-dashed transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
              <div className="text-center">
                <p className="font-medium">
                  Drop an image here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, WebP
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {result ? (
              <canvas
                ref={canvasRef}
                className="h-full w-full object-contain"
              />
            ) : (
              <NextImage
                src={previewUrl}
                alt="Preview"
                fill
                className="object-contain"
                unoptimized
              />
            )}
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Detection Status */}
        {result && (
          <div className="flex items-center justify-center gap-4 rounded-lg bg-muted/50 p-4">
            {result.has_person ? (
              <>
                <User className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-semibold text-green-500">Đây là người</p>
                  <p className="text-sm text-muted-foreground">
                    Có người trong ảnh
                  </p>
                </div>
              </>
            ) : (
              <>
                <UserX className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-semibold">KHÔNG PHẢI LÀ NGƯỜI</p>
                  <p className="text-sm text-muted-foreground">
                    Không tìm thấy người trong ảnh
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confidence Threshold</span>
              <span className="font-mono">
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[confidence]}
              onValueChange={([v]) => setConfidence(v)}
              min={0.1}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          <Button
            onClick={() => detect(confidence)}
            disabled={!selectedFile || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                Detect Humans
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
