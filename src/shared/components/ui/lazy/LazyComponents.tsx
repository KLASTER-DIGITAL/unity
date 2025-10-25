import { Suspense, lazy } from "react";
import { LottiePreloaderCompact } from "@/shared/components/LottiePreloader";

// Lazy load тяжелых UI компонентов для оптимизации производительности

// 3D и анимированные компоненты (тяжелые для рендеринга)
const Card3D = lazy(() => import("../shadcn-io/3d-card").then(module => ({ default: module.CardContainer })));
const AnimatedModal = lazy(() => import("../shadcn-io/animated-modal").then(module => ({ default: module.Modal })));
const AnimatedTooltip = lazy(() => import("../shadcn-io/animated-tooltip").then(module => ({ default: module.AnimatedTooltip })));
const BackgroundGradient = lazy(() => import("../shadcn-io/background-gradient").then(module => ({ default: module.BackgroundGradient })));
const MagneticButton = lazy(() => import("../shadcn-io/magnetic-button").then(module => ({ default: module.MagneticButton })));
const MotionHighlight = lazy(() => import("../shadcn-io/motion-highlight").then(module => ({ default: module.MotionHighlight })));
const ShimmeringText = lazy(() => import("../shadcn-io/shimmering-text").then(module => ({ default: module.ShimmeringText })));
const Sparkles = lazy(() => import("../shadcn-io/sparkles").then(module => ({ default: module.SparklesCore })));

// Сложные интерактивные компоненты
const ColorPicker = lazy(() => import("../shadcn-io/color-picker").then(module => ({ default: module.ColorPicker })));
const Counter = lazy(() => import("../shadcn-io/counter").then(module => ({ default: module.Counter })));
const Gantt = lazy(() => import("../shadcn-io/gantt").then(module => ({ default: module.Gantt })));
const Rating = lazy(() => import("../shadcn-io/rating").then(module => ({ default: module.Rating })));
const Terminal = lazy(() => import("../shadcn-io/terminal").then(module => ({ default: module.Terminal })));

// Простые компоненты (можно загружать сразу)
import { Pill } from "../shadcn-io/pill";
import { Status } from "../shadcn-io/status";
import { Tabs } from "../shadcn-io/tabs";

// Loading компонент для UI элементов с Lottie анимацией
const UILoadingFallback = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center p-4 rounded-lg ${className}`}>
    <LottiePreloaderCompact message="Загрузка..." size="sm" />
  </div>
);

// Wrapper Components with Suspense

// 3D и анимированные компоненты
export const Lazy3DCard = (props: any) => (
  <Suspense fallback={<UILoadingFallback className="h-64" />}>
    <Card3D {...props} />
  </Suspense>
);

export const LazyAnimatedModal = (props: any) => (
  <Suspense fallback={<UILoadingFallback />}>
    <AnimatedModal {...props} />
  </Suspense>
);

export const LazyAnimatedTooltip = (props: any) => (
  <Suspense fallback={<UILoadingFallback className="h-8" />}>
    <AnimatedTooltip {...props} />
  </Suspense>
);

export const LazyBackgroundGradient = (props: any) => (
  <Suspense fallback={<UILoadingFallback />}>
    <BackgroundGradient {...props} />
  </Suspense>
);

export const LazyMagneticButton = (props: any) => (
  <Suspense fallback={<UILoadingFallback className="h-12" />}>
    <MagneticButton {...props} />
  </Suspense>
);

export const LazyMotionHighlight = (props: any) => (
  <Suspense fallback={<UILoadingFallback />}>
    <MotionHighlight {...props} />
  </Suspense>
);

export const LazyShimmeringText = (props: any) => (
  <Suspense fallback={<UILoadingFallback className="h-8" />}>
    <ShimmeringText {...props} />
  </Suspense>
);

export const LazySparkles = (props: any) => (
  <Suspense fallback={<UILoadingFallback />}>
    <Sparkles {...props} />
  </Suspense>
);

// Интерактивные компоненты
export const LazyColorPicker = (props: any) => (
  <Suspense fallback={<UILoadingFallback className="h-32" />}>
    <ColorPicker {...props} />
  </Suspense>
);

export const LazyCounter = (props: any) => (
  <Suspense fallback={<UILoadingFallback className="h-16" />}>
    <Counter {...props} />
  </Suspense>
);

export const LazyGantt = (props: any) => (
  <Suspense fallback={<UILoadingFallback className="h-64" />}>
    <Gantt {...props} />
  </Suspense>
);

export const LazyRating = (props: any) => (
  <Suspense fallback={<UILoadingFallback className="h-8" />}>
    <Rating {...props} />
  </Suspense>
);

export const LazyTerminal = (props: any) => (
  <Suspense fallback={<UILoadingFallback className="h-64" />}>
    <Terminal {...props} />
  </Suspense>
);

// Preload функции для критических компонентов
export const preloadComponents = {
  card3d: () => import("../shadcn-io/3d-card"),
  animatedModal: () => import("../shadcn-io/animated-modal"),
  colorPicker: () => import("../shadcn-io/color-picker"),
  gantt: () => import("../shadcn-io/gantt"),
  terminal: () => import("../shadcn-io/terminal")
};

// Hook для preloading компонентов при hover
export const useComponentPreload = () => {
  const preloadOnHover = (componentType: keyof typeof preloadComponents) => {
    return {
      onMouseEnter: () => preloadComponents[componentType](),
      onFocus: () => preloadComponents[componentType]()
    };
  };

  return { preloadOnHover };
};

// Экспорт всех компонентов
export {
  // Lazy компоненты
  Lazy3DCard as Card3D,
  LazyAnimatedModal as AnimatedModal,
  LazyAnimatedTooltip as AnimatedTooltip,
  LazyBackgroundGradient as BackgroundGradient,
  LazyMagneticButton as MagneticButton,
  LazyMotionHighlight as MotionHighlight,
  LazyShimmeringText as ShimmeringText,
  LazySparkles as Sparkles,
  LazyColorPicker as ColorPicker,
  LazyCounter as Counter,
  LazyGantt as Gantt,
  LazyRating as Rating,
  LazyTerminal as Terminal,
  
  // Простые компоненты (не lazy)
  Pill,
  Status,
  Tabs
};

// Экспорт для обратной совместимости
export default {
  Card3D: Lazy3DCard,
  AnimatedModal: LazyAnimatedModal,
  AnimatedTooltip: LazyAnimatedTooltip,
  BackgroundGradient: LazyBackgroundGradient,
  MagneticButton: LazyMagneticButton,
  MotionHighlight: LazyMotionHighlight,
  ShimmeringText: LazyShimmeringText,
  Sparkles: LazySparkles,
  ColorPicker: LazyColorPicker,
  Counter: LazyCounter,
  Gantt: LazyGantt,
  Rating: LazyRating,
  Terminal: LazyTerminal,
  Pill,
  Status,
  Tabs,
  preloadComponents,
  useComponentPreload
};
