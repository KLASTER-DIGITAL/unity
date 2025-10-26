import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformMode } from "./types";

interface PlatformToggleProps {
  platformMode: PlatformMode;
  onPlatformChange: (mode: PlatformMode) => void;
}

export function PlatformToggle({ platformMode, onPlatformChange }: PlatformToggleProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-foreground">Platform Mode</h3>
      <div className="flex gap-2">
        <Button
          variant={platformMode === "web" ? "default" : "outline"}
          size="sm"
          onClick={() => onPlatformChange("web")}
          className="flex items-center gap-2 transition-colors duration-300"
        >
          <Monitor className="h-4 w-4" />
          <span>Web (PWA)</span>
        </Button>
        <Button
          variant={platformMode === "react-native" ? "default" : "outline"}
          size="sm"
          onClick={() => onPlatformChange("react-native")}
          className="flex items-center gap-2 transition-colors duration-300"
        >
          <Smartphone className="h-4 w-4" />
          <span>React Native</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {platformMode === "web" 
          ? "Testing PWA mode with current implementation" 
          : "Simulating React Native mode (Q2 2026 migration)"}
      </p>
    </div>
  );
}

