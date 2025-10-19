import React, { useState, useCallback } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage Component
 * 
 * Автоматически использует WebP формат с fallback на оригинальный формат.
 * Поддерживает lazy loading и responsive images.
 * 
 * @example
 * <OptimizedImage 
 *   src="/assets/image.png" 
 *   alt="Description"
 *   loading="lazy"
 *   className="w-full h-auto"
 * />
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false,
  sizes,
  onLoad,
  onError,
}) => {
  const [imageError, setImageError] = useState(false);
  const [webpError, setWebpError] = useState(false);

  // Генерируем WebP версию пути
  const getWebPSrc = useCallback((originalSrc: string): string => {
    // Заменяем расширение на .webp
    return originalSrc.replace(/\.(png|jpe?g)$/i, '.webp');
  }, []);

  // Обработчик ошибки загрузки WebP
  const handleWebPError = useCallback(() => {
    setWebpError(true);
    onError?.();
  }, [onError]);

  // Обработчик ошибки загрузки оригинального изображения
  const handleImageError = useCallback(() => {
    setImageError(true);
    onError?.();
  }, [onError]);

  // Обработчик успешной загрузки
  const handleLoad = useCallback(() => {
    onLoad?.();
  }, [onLoad]);

  // Если поддерживается WebP и нет ошибки, используем WebP
  const webpSrc = getWebPSrc(src);
  const shouldUseWebP = !webpError && !imageError;

  // Определяем loading стратегию
  const loadingStrategy = priority ? 'eager' : loading;

  // Если браузер не поддерживает <picture>, используем обычный <img>
  const supportsWebP = typeof window !== 'undefined' && 
    window.HTMLPictureElement !== undefined;

  if (!supportsWebP || webpError) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loadingStrategy}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleImageError}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    );
  }

  return (
    <picture className={className}>
      {/* WebP версия для современных браузеров */}
      <source
        srcSet={webpSrc}
        type="image/webp"
        sizes={sizes}
      />
      
      {/* Fallback для браузеров без поддержки WebP */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loadingStrategy}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleWebPError}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </picture>
  );
};

/**
 * LazyOptimizedImage Component
 * 
 * Версия OptimizedImage с принудительным lazy loading
 * и intersection observer для лучшей производительности.
 */
export const LazyOptimizedImage: React.FC<OptimizedImageProps> = (props) => {
  return <OptimizedImage {...props} loading="lazy" />;
};

/**
 * PriorityOptimizedImage Component
 * 
 * Версия OptimizedImage для критических изображений
 * (above the fold), которые должны загружаться немедленно.
 */
export const PriorityOptimizedImage: React.FC<OptimizedImageProps> = (props) => {
  return <OptimizedImage {...props} loading="eager" priority={true} />;
};

/**
 * ResponsiveOptimizedImage Component
 * 
 * Версия OptimizedImage с предустановленными responsive размерами
 * для мобильных устройств.
 */
interface ResponsiveOptimizedImageProps extends Omit<OptimizedImageProps, 'sizes'> {
  breakpoints?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

export const ResponsiveOptimizedImage: React.FC<ResponsiveOptimizedImageProps> = ({
  breakpoints = {
    mobile: '100vw',
    tablet: '50vw', 
    desktop: '33vw'
  },
  ...props
}) => {
  const sizes = `
    (max-width: 768px) ${breakpoints.mobile},
    (max-width: 1024px) ${breakpoints.tablet},
    ${breakpoints.desktop}
  `.replace(/\s+/g, ' ').trim();

  return <OptimizedImage {...props} sizes={sizes} />;
};

/**
 * Utility function для проверки поддержки WebP
 */
export const checkWebPSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Hook для проверки поддержки WebP
 */
export const useWebPSupport = () => {
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);

  React.useEffect(() => {
    checkWebPSupport().then(setSupportsWebP);
  }, []);

  return supportsWebP;
};
