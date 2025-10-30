/**
 * RTL Provider component
 *
 * Automatically applies RTL direction based on current language
 */

import type React from 'react';
import { createContext, type ReactNode, useContext, useEffect } from 'react';
import { useTranslationContext } from '../TranslationProvider';
import {
  applyDocumentDirection,
  getRTLConfig,
  getTextDirection,
  type RTLConfig,
  type TextDirection,
} from './RTLDetector';

type RTLContextValue = {
  direction: TextDirection;
  isRTL: boolean;
  config: RTLConfig;
};

const RTLContext = createContext<RTLContextValue | null>(null);

type RTLProviderProps = {
  children: ReactNode;
  /**
   * Override language (useful for testing)
   */
  language?: string;
  /**
   * Disable automatic document direction update
   */
  disableDocumentUpdate?: boolean;
};

/**
 * RTL Provider component
 *
 * Wraps the app and provides RTL context based on current language
 *
 * @example
 * <TranslationProvider>
 *   <RTLProvider>
 *     <App />
 *   </RTLProvider>
 * </TranslationProvider>
 */
export const RTLProvider: React.FC<RTLProviderProps> = ({
  children,
  language: overrideLanguage,
  disableDocumentUpdate = false,
}) => {
  const { currentLanguage } = useTranslationContext();
  const language = overrideLanguage || currentLanguage;

  const direction = getTextDirection(language);
  const config = getRTLConfig(language);

  // Apply direction to document
  useEffect(() => {
    if (!disableDocumentUpdate) {
      applyDocumentDirection(direction);
      console.log(`📐 RTL: Applied ${direction} direction for language: ${language}`);
    }
  }, [direction, language, disableDocumentUpdate]);

  const value: RTLContextValue = {
    direction,
    isRTL: direction === 'rtl',
    config,
  };

  return (
    <RTLContext.Provider value={value}>
      <div className={config.directionClass} dir={direction}>
        {children}
      </div>
    </RTLContext.Provider>
  );
};

/**
 * Hook to access RTL context
 *
 * @example
 * const { direction, isRTL } = useRTL();
 *
 * return (
 *   <div className={isRTL ? 'text-right' : 'text-left'}>
 *     Content
 *   </div>
 * );
 */
export const useRTL = (): RTLContextValue => {
  const context = useContext(RTLContext);

  if (!context) {
    throw new Error('useRTL must be used within RTLProvider');
  }

  return context;
};

/**
 * HOC to add RTL support to a component
 *
 * @example
 * const MyComponent = withRTL(({ direction, isRTL }) => {
 *   return <div>Direction: {direction}</div>;
 * });
 */
export function withRTL<P extends object>(
  Component: React.ComponentType<P & RTLContextValue>
): React.FC<P> {
  return (props: P) => {
    const rtl = useRTL();
    return <Component {...props} {...rtl} />;
  };
}

/**
 * RTL-aware div component
 *
 * @example
 * <RTLDiv className="p-4">
 *   Content automatically adjusts to RTL
 * </RTLDiv>
 */
export const RTLDiv: React.FC<{
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style = {} }) => {
  const { direction } = useRTL();

  return (
    <div className={className} dir={direction} style={style}>
      {children}
    </div>
  );
};

/**
 * RTL-aware text component
 *
 * Automatically detects text direction based on content
 *
 * @example
 * <RTLText>مرحبا</RTLText> // Automatically RTL
 * <RTLText>Hello</RTLText> // Automatically LTR
 */
export const RTLText: React.FC<{
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Force specific direction (overrides auto-detection)
   */
  forceDirection?: TextDirection;
}> = ({ children, className = '', style = {}, forceDirection }) => {
  const { direction: contextDirection } = useRTL();

  // Use forced direction or context direction
  const direction = forceDirection || contextDirection;

  return (
    <span className={className} dir={direction} style={style}>
      {children}
    </span>
  );
};
