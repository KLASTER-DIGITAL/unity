import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Zap, HardDrive, Wifi } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memory: number; // MB
  loadTime: number; // ms
  networkSpeed: 'slow' | 'medium' | 'fast';
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PerformanceMonitor({
  enabled = false,
  position = 'top-right'
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    loadTime: 0,
    networkSpeed: 'fast'
  });

  useEffect(() => {
    if (!enabled) return;

    // FPS counter
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setMetrics(prev => ({ ...prev, fps }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    // Memory usage (if available)
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = Math.round(
          (performance as any).memory.usedJSHeapSize / 1024 / 1024
        );
        setMetrics(prev => ({ ...prev, memory }));
      }
    };

    const memoryInterval = setInterval(measureMemory, 1000);

    // Load time
    const loadTime = Math.round(performance.now());
    setMetrics(prev => ({ ...prev, loadTime }));

    // Network speed (rough estimate)
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      const networkSpeed = 
        effectiveType === '4g' ? 'fast' :
        effectiveType === '3g' ? 'medium' : 'slow';
      setMetrics(prev => ({ ...prev, networkSpeed }));
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(memoryInterval);
    };
  }, [enabled]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 50) return 'text-green-500';
    if (memory < 100) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getNetworkColor = (speed: string) => {
    if (speed === 'fast') return 'text-green-500';
    if (speed === 'medium') return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed ${positionClasses[position]} z-[9999] pointer-events-none`}
      >
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-xs font-mono space-y-2 min-w-[160px]">
          {/* FPS */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>FPS</span>
            </div>
            <span className={`font-bold ${getFPSColor(metrics.fps)}`}>
              {metrics.fps}
            </span>
          </div>

          {/* Memory */}
          {metrics.memory > 0 && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Memory</span>
              </div>
              <span className={`font-bold ${getMemoryColor(metrics.memory)}`}>
                {metrics.memory}MB
              </span>
            </div>
          )}

          {/* Load Time */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Load</span>
            </div>
            <span className="font-bold text-blue-400">
              {(metrics.loadTime / 1000).toFixed(2)}s
            </span>
          </div>

          {/* Network */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              <span>Network</span>
            </div>
            <span className={`font-bold ${getNetworkColor(metrics.networkSpeed)}`}>
              {metrics.networkSpeed}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

