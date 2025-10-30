import { Smartphone, Globe, Chrome } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DeviceType, DEVICES } from "./types";

interface DeviceSelectorProps {
  selectedDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
}

const ICON_MAP = {
  Smartphone,
  Globe,
  Chrome
};

export function DeviceSelector({ selectedDevice, onDeviceChange }: DeviceSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-foreground">Device</h3>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {Object.values(DEVICES).map((device) => {
          const Icon = ICON_MAP[device.icon as keyof typeof ICON_MAP];
          const isSelected = selectedDevice === device.id;
          
          return (
            <Button
              key={device.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onDeviceChange(device.id)}
              className="flex flex-col items-center gap-2 h-auto py-3 transition-colors duration-300"
            >
              <Icon className="h-5 w-5" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-medium">{device.name}</span>
                <span className="text-[10px] opacity-70">{device.description}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

