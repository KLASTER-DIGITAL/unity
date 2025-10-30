import { Info, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DeviceType, PlatformMode, DEVICES } from "./types";

interface ComponentInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDevice: DeviceType;
  platformMode: PlatformMode;
  previewUrl: string;
}

export function ComponentInspector({
  isOpen,
  onClose,
  selectedDevice,
  platformMode,
  previewUrl
}: ComponentInspectorProps) {
  if (!isOpen) return null;

  const device = DEVICES[selectedDevice];

  return (
    <div className="w-80 bg-card border-l border-border p-4 overflow-auto transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Inspector</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Device Info */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase">Device</h4>
          <div className="bg-muted/50 rounded-lg p-3 space-y-1 transition-colors duration-300">
            <p className="text-sm font-medium text-foreground">{device.name}</p>
            <p className="text-xs text-muted-foreground">{device.description}</p>
            <div className="flex gap-4 mt-2">
              <div>
                <p className="text-xs text-muted-foreground">Width</p>
                <p className="text-sm font-mono text-foreground">{device.width}px</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Height</p>
                <p className="text-sm font-mono text-foreground">{device.height}px</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Mode */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase">Platform</h4>
          <div className="bg-muted/50 rounded-lg p-3 transition-colors duration-300">
            <p className="text-sm font-medium text-foreground">
              {platformMode === "web" ? "Web (PWA)" : "React Native"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {platformMode === "web" 
                ? "Current PWA implementation" 
                : "Simulated React Native mode"}
            </p>
          </div>
        </div>

        {/* Preview URL */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase">Preview URL</h4>
          <div className="bg-muted/50 rounded-lg p-3 transition-colors duration-300">
            <p className="text-xs font-mono text-foreground break-all">{previewUrl}</p>
          </div>
        </div>

        {/* Breakpoints */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase">Breakpoints</h4>
          <div className="bg-muted/50 rounded-lg p-3 space-y-2 transition-colors duration-300">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">320px</span>
              <span className="text-foreground font-mono">iPhone SE</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">375px</span>
              <span className="text-foreground font-mono">iPhone 13/14</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">390px</span>
              <span className="text-foreground font-mono">iPhone 14 Pro</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">430px</span>
              <span className="text-foreground font-mono">iPhone 14 Pro Max</span>
            </div>
          </div>
        </div>

        {/* Testing Tips */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase">Testing Tips</h4>
          <div className="bg-muted/50 rounded-lg p-3 space-y-2 transition-colors duration-300">
            <p className="text-xs text-foreground">
              • Test touch targets (min 44x44px)
            </p>
            <p className="text-xs text-foreground">
              • Check responsive typography
            </p>
            <p className="text-xs text-foreground">
              • Verify dark mode transitions
            </p>
            <p className="text-xs text-foreground">
              • Test iOS safe areas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

