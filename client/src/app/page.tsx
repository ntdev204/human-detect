"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ImageUploader } from "@/components/ImageUploader";
import { ComponentSkeleton } from "@/components/ui/ComponentSkeleton";
import { DetectionResult } from "@/types";
import { Camera, Upload, Cpu, Zap, Activity } from "lucide-react";

const WebcamDetector = dynamic(
  () => import("@/components/WebcamDetector").then((m) => m.WebcamDetector),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false,
  },
);

const preloadWebcam = () => {
  if (typeof window !== "undefined") {
    void import("@/components/WebcamDetector");
  }
};

export default function HomePage() {
  const [totalDetections, setTotalDetections] = useState(0);

  const handleDetection = useCallback((result: DetectionResult) => {
    if (result.has_person) {
      setTotalDetections((prev) => prev + result.count);
    }
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30">
      <Header totalDetections={totalDetections} />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 gap-1">
              <Zap className="h-3 w-3" />
              Real-time AI Detection
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Detect Humans in Images & Video
            </h2>
            <p className="mt-3 text-muted-foreground">
              Upload an image or use your webcam for real-time human detection
              powered by YOLOv8 deep learning model.
            </p>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Image
              </TabsTrigger>
              <TabsTrigger
                value="webcam"
                className="gap-2"
                onMouseEnter={preloadWebcam}
                onFocus={preloadWebcam}
              >
                <Camera className="h-4 w-4" />
                Webcam
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="upload" className="m-0">
                <ImageUploader onDetection={handleDetection} />
              </TabsContent>

              <TabsContent value="webcam" className="m-0">
                <WebcamDetector onDetection={handleDetection} />
              </TabsContent>
            </div>
          </Tabs>

          <div className="grid gap-4 sm:grid-cols-3">
            <InfoCard
              icon={<Cpu className="h-5 w-5 text-blue-500" />}
              bgColor="bg-blue-500/10"
              title="YOLOv8 Model"
              description="State-of-the-art detection"
            />
            <InfoCard
              icon={<Zap className="h-5 w-5 text-green-500" />}
              bgColor="bg-green-500/10"
              title="Real-time"
              description="WebSocket streaming"
            />
            <InfoCard
              icon={<Activity className="h-5 w-5 text-orange-500" />}
              bgColor="bg-orange-500/10"
              title="High Accuracy"
              description="Custom trained model"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  bgColor: string;
  title: string;
  description: string;
}

function InfoCard({ icon, bgColor, title, description }: InfoCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}
        >
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
