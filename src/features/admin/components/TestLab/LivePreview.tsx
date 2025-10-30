import { useEffect, useRef } from 'react';
import { Android } from '@/shared/components/ui/shadcn-io/android';
import { ChromeMobile } from '@/shared/components/ui/shadcn-io/chrome-mobile';
import { Iphone15Pro } from '@/shared/components/ui/shadcn-io/iphone-15-pro';
import { Safari } from '@/shared/components/ui/shadcn-io/safari';
import { YandexBrowser } from '@/shared/components/ui/shadcn-io/yandex-browser';
import { DEVICES, type DeviceType, type PlatformMode } from './types';

type LivePreviewProps = {
  selectedDevice: DeviceType;
  platformMode: PlatformMode;
  previewUrl: string;
};

export function LivePreview({ selectedDevice, platformMode, previewUrl }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const device = DEVICES[selectedDevice];

  useEffect(() => {
    // Send platform mode to iframe via postMessage
    const sendPlatformMode = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'PLATFORM_MODE_CHANGE', mode: platformMode },
          '*'
        );
      }
    };

    // Wait for iframe to load
    const timer = setTimeout(sendPlatformMode, 1000);
    return () => clearTimeout(timer);
  }, [platformMode]);

  // Render iframe content
  const renderIframe = () => (
    <iframe
      className="h-full w-full border-0"
      ref={iframeRef}
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      src={previewUrl}
      title="PWA Preview"
    />
  );

  // Render device mock based on selected device
  const renderDeviceMock = () => {
    const iframeContent = renderIframe();

    switch (selectedDevice) {
      case 'iphone-15-pro':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="relative" style={{ width: device.width, height: device.height }}>
              <Iphone15Pro
                className="absolute inset-0"
                height={device.height}
                width={device.width}
              />
              <div
                className="absolute overflow-hidden rounded-[40px]"
                style={{
                  top: '60px',
                  left: '20px',
                  width: device.width - 40,
                  height: device.height - 120,
                }}
              >
                {iframeContent}
              </div>
            </div>
          </div>
        );

      case 'android':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="relative" style={{ width: device.width, height: device.height }}>
              <Android className="absolute inset-0" height={device.height} width={device.width} />
              <div
                className="absolute overflow-hidden rounded-[30px]"
                style={{
                  top: '50px',
                  left: '15px',
                  width: device.width - 30,
                  height: device.height - 100,
                }}
              >
                {iframeContent}
              </div>
            </div>
          </div>
        );

      case 'safari':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="relative" style={{ width: device.width, height: device.height }}>
              <Safari
                className="absolute inset-0"
                height={device.height}
                url={previewUrl}
                width={device.width}
              />
              <div
                className="absolute overflow-hidden"
                style={{
                  top: '52px',
                  left: '1px',
                  width: device.width - 2,
                  height: device.height - 52,
                }}
              >
                {iframeContent}
              </div>
            </div>
          </div>
        );

      case 'chrome-mobile':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="relative" style={{ width: device.width, height: device.height }}>
              <ChromeMobile
                className="absolute inset-0"
                height={device.height}
                url={previewUrl}
                width={device.width}
              />
              <div
                className="absolute overflow-hidden"
                style={{
                  top: '52px',
                  left: '1px',
                  width: device.width - 2,
                  height: device.height - 52,
                }}
              >
                {iframeContent}
              </div>
            </div>
          </div>
        );

      case 'yandex-browser':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="relative" style={{ width: device.width, height: device.height }}>
              <YandexBrowser
                className="absolute inset-0"
                height={device.height}
                url={previewUrl}
                width={device.width}
              />
              <div
                className="absolute overflow-hidden"
                style={{
                  top: '52px',
                  left: '1px',
                  width: device.width - 2,
                  height: device.height - 52,
                }}
              >
                {iframeContent}
              </div>
            </div>
          </div>
        );

      default:
        return <div className="p-8">{iframeContent}</div>;
    }
  };

  return (
    <div className="flex-1 overflow-auto rounded-lg bg-muted/30 transition-colors duration-300">
      {renderDeviceMock()}
    </div>
  );
}
