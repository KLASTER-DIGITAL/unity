import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DeviceSelector } from "./DeviceSelector";
import { PlatformToggle } from "./PlatformToggle";
import { LivePreview } from "./LivePreview";
import { ComponentInspector } from "./ComponentInspector";
import { DeviceType, PlatformMode, DEFAULT_TEST_LAB_STATE } from "./types";

const STORAGE_KEY = "unity-admin-test-lab-state";

export function TestLab() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(
    DEFAULT_TEST_LAB_STATE.selectedDevice
  );
  const [platformMode, setPlatformMode] = useState<PlatformMode>(
    DEFAULT_TEST_LAB_STATE.platformMode
  );
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setSelectedDevice(parsed.selectedDevice || DEFAULT_TEST_LAB_STATE.selectedDevice);
        setPlatformMode(parsed.platformMode || DEFAULT_TEST_LAB_STATE.platformMode);
      } catch (error) {
        console.error("Failed to parse saved Test Lab state:", error);
      }
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    const state = {
      selectedDevice,
      platformMode,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [selectedDevice, platformMode]);

  const handleDeviceChange = (device: DeviceType) => {
    setSelectedDevice(device);
  };

  const handlePlatformChange = (mode: PlatformMode) => {
    setPlatformMode(mode);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Test Lab</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Test PWA responsiveness across different devices and browsers
          </p>
        </div>
        <Button
          variant={isInspectorOpen ? "default" : "outline"}
          size="sm"
          onClick={() => setIsInspectorOpen(!isInspectorOpen)}
          className="flex items-center gap-2 transition-colors duration-300"
        >
          <Info className="h-4 w-4" />
          <span>Inspector</span>
        </Button>
      </div>

      {/* Controls */}
      <div className="space-y-4 bg-card border border-border rounded-lg p-4 transition-colors duration-300">
        <DeviceSelector 
          selectedDevice={selectedDevice} 
          onDeviceChange={handleDeviceChange} 
        />
        <PlatformToggle 
          platformMode={platformMode} 
          onPlatformChange={handlePlatformChange} 
        />
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex gap-4 min-h-0">
        <LivePreview
          selectedDevice={selectedDevice}
          platformMode={platformMode}
          previewUrl={DEFAULT_TEST_LAB_STATE.previewUrl}
        />
        <ComponentInspector
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          selectedDevice={selectedDevice}
          platformMode={platformMode}
          previewUrl={DEFAULT_TEST_LAB_STATE.previewUrl}
        />
      </div>
    </div>
  );
}

