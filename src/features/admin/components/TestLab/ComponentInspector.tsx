import { Info, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { DEVICES, type DeviceType, type PlatformMode } from './types';

type ComponentInspectorProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDevice: DeviceType;
  platformMode: PlatformMode;
  previewUrl: string;
};

export function ComponentInspector({
  isOpen,
  onClose,
  selectedDevice,
  platformMode,
  previewUrl,
}: ComponentInspectorProps) {
  if (!isOpen) {
    return null;
  }

  const device = DEVICES[selectedDevice];

  return (
    <div className="w-80 overflow-auto border-border border-l bg-card p-4 transition-colors duration-300">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Inspector</h3>
        </div>
        <Button onClick={onClose} size="icon" variant="ghost">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Device Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-muted-foreground text-xs uppercase">Device</h4>
          <div className="space-y-1 rounded-lg bg-muted/50 p-3 transition-colors duration-300">
            <p className="font-medium text-foreground text-sm">{device.name}</p>
            <p className="text-muted-foreground text-xs">{device.description}</p>
            <div className="mt-2 flex gap-4">
              <div>
                <p className="text-muted-foreground text-xs">Width</p>
                <p className="font-mono text-foreground text-sm">{device.width}px</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Height</p>
                <p className="font-mono text-foreground text-sm">{device.height}px</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Mode */}
        <div className="space-y-2">
          <h4 className="font-medium text-muted-foreground text-xs uppercase">Platform</h4>
          <div className="rounded-lg bg-muted/50 p-3 transition-colors duration-300">
            <p className="font-medium text-foreground text-sm">
              {platformMode === 'web' ? 'Web (PWA)' : 'React Native'}
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              {platformMode === 'web'
                ? 'Current PWA implementation'
                : 'Simulated React Native mode'}
            </p>
          </div>
        </div>

        {/* Preview URL */}
        <div className="space-y-2">
          <h4 className="font-medium text-muted-foreground text-xs uppercase">Preview URL</h4>
          <div className="rounded-lg bg-muted/50 p-3 transition-colors duration-300">
            <p className="break-all font-mono text-foreground text-xs">{previewUrl}</p>
          </div>
        </div>

        {/* Breakpoints */}
        <div className="space-y-2">
          <h4 className="font-medium text-muted-foreground text-xs uppercase">Breakpoints</h4>
          <div className="space-y-2 rounded-lg bg-muted/50 p-3 transition-colors duration-300">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">320px</span>
              <span className="font-mono text-foreground">iPhone SE</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">375px</span>
              <span className="font-mono text-foreground">iPhone 13/14</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">390px</span>
              <span className="font-mono text-foreground">iPhone 14 Pro</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">430px</span>
              <span className="font-mono text-foreground">iPhone 14 Pro Max</span>
            </div>
          </div>
        </div>

        {/* Testing Tips */}
        <div className="space-y-2">
          <h4 className="font-medium text-muted-foreground text-xs uppercase">Testing Tips</h4>
          <div className="space-y-2 rounded-lg bg-muted/50 p-3 transition-colors duration-300">
            <p className="text-foreground text-xs">• Test touch targets (min 44x44px)</p>
            <p className="text-foreground text-xs">• Check responsive typography</p>
            <p className="text-foreground text-xs">• Verify dark mode transitions</p>
            <p className="text-foreground text-xs">• Test iOS safe areas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
