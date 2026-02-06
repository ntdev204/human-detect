"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, User, UserX } from "lucide-react";
import { DetectionResult } from "@/lib/api";
import { useWebcamDetection } from "@/hooks/useWebcamDetection";

interface WebcamDetectorProps {
  onDetection?: (result: DetectionResult) => void;
}

export function WebcamDetector({ onDetection }: WebcamDetectorProps) {
  const {
    videoRef,
    canvasRef,
    isStreaming,
    connectionStatus,
    lastResult,
    fps,
    startStream,
    stopStream,
    setConfidence,
  } = useWebcamDetection(onDetection);

  // Local confidence state for UI slider
  const [localConfidence, setLocalConfidence] = useState(0.5);

  // Sync confidence with hook
  // We use this pattern to separate UI state from Hook logic
  // hook's setConfidence updates the Ref used in the animation loop
  const handleConfidenceChange = useCallback(
    (value: number) => {
      setLocalConfidence(value);
      setConfidence(value);
    },
    [setConfidence],
  );

  const statusColor = {
    connecting: "bg-yellow-500",
    connected: "bg-green-500",
    disconnected: "bg-gray-500",
    error: "bg-red-500",
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Webcam Real-time
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <div
                className={`h-2 w-2 rounded-full ${statusColor[connectionStatus]}`}
              />
              {connectionStatus}
            </Badge>
            {isStreaming && <Badge variant="secondary">{fps} FPS</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video/Canvas Container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover ${
              isStreaming ? "opacity-0" : "opacity-100"
            }`}
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full object-cover ${
              isStreaming ? "opacity-100" : "opacity-0"
            }`}
          />

          {!isStreaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Camera className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Click Start to begin detection
              </p>
            </div>
          )}
        </div>

        {/* Detection Status */}
        {isStreaming && lastResult && (
          <div className="flex items-center justify-center gap-4 rounded-lg bg-muted/50 p-4">
            {lastResult.has_person ? (
              <>
                <User className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-semibold text-green-500">
                    Đây là người - Có người trong khung hình
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Webcam stream active
                  </p>
                </div>
              </>
            ) : (
              <>
                <UserX className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-semibold">No Person</p>
                  <p className="text-sm text-muted-foreground">
                    No humans detected in frame
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confidence Threshold</span>
              <span className="font-mono">
                {(localConfidence * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[localConfidence]}
              onValueChange={([v]) => handleConfidenceChange(v)}
              min={0.1}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            {!isStreaming ? (
              <Button onClick={startStream} className="w-full" size="lg">
                <Camera className="mr-2 h-4 w-4" />
                Start Detection
              </Button>
            ) : (
              <Button
                onClick={stopStream}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <CameraOff className="mr-2 h-4 w-4" />
                Stop Detection
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
