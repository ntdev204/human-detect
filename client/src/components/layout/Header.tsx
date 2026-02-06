"use client";

import { memo } from "react";
import { Cpu, Users, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  totalDetections: number;
}

export const Header = memo(function Header({ totalDetections }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Cpu className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Human Detection</h1>
            <p className="text-xs text-muted-foreground">Powered by YOLOv8</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-6 sm:flex">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-semibold">{totalDetections}</span>
                <span className="text-muted-foreground"> detected</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <Badge variant="outline" className="gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Online
              </Badge>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
});
