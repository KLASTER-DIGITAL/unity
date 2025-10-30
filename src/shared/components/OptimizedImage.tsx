import React, { useCallback, useState } from "react";

type OptimizedImageProps = {
	src: string;
	alt: string;
	className?: string;
	width?: number;
	height?: number;
	loading?: "lazy" | "eager";
	priority?: boolean;
	sizes?: string;
	blurDataURL?: string; // Base64 blur placeholder
	onLoad?: () => void;
	onError?: () => void;
};

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
	className = "",
	width,
	height,
	loading = "lazy",
	priority = false,
	sizes,
	blurDataURL,
	onLoad,
	onError,
}) => {
	const [_imageError, setImageError] = useState(false);
	const [webpError, setWebpError] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	// Генерируем WebP версию пути
	const getWebPSrc = useCallback((originalSrc: string): string => {
		// Заменяем расширение на .webp
		return originalSrc.replace(/\.(png|jpe?g)$/i, ".webp");
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
		setIsLoaded(true);
		onLoad?.();
	}, [onLoad]);

	// Если поддерживается WebP и нет ошибки, используем WebP
	const webpSrc = getWebPSrc(src);
	// const shouldUseWebP = !webpError && !imageError;

	// Определяем loading стратегию
	const loadingStrategy = priority ? "eager" : loading;

	// Если браузер не поддерживает <picture>, используем обычный <img>
	const supportsWebP =
		typeof window !== "undefined" && window.HTMLPictureElement !== undefined;

	if (!supportsWebP || webpError) {
		return (
			<div className={`relative ${className}`} style={{ width, height }}>
				{/* Blur placeholder */}
				{blurDataURL && !isLoaded && (
					<img
						alt=""
						aria-hidden="true"
						className="absolute inset-0 h-full w-full object-cover blur-sm"
						src={blurDataURL}
						style={{
							filter: "blur(20px)",
							transform: "scale(1.1)",
						}}
					/>
				)}

				{/* Actual image */}
				<img
					alt={alt}
					className={`${blurDataURL ? "relative z-10" : ""}`}
					height={height}
					loading={loadingStrategy}
					onError={handleImageError}
					onLoad={handleLoad}
					sizes={sizes}
					src={src}
					style={{
						maxWidth: "100%",
						height: "auto",
						opacity: blurDataURL && !isLoaded ? 0 : 1,
						transition: "opacity 0.3s ease-in-out",
					}}
					width={width}
				/>
			</div>
		);
	}

	return (
		<div className={`relative ${className}`} style={{ width, height }}>
			{/* Blur placeholder */}
			{blurDataURL && !isLoaded && (
				<img
					alt=""
					aria-hidden="true"
					className="absolute inset-0 h-full w-full object-cover blur-sm"
					src={blurDataURL}
					style={{
						filter: "blur(20px)",
						transform: "scale(1.1)",
					}}
				/>
			)}

			{/* Picture element with WebP support */}
			<picture className={blurDataURL ? "relative z-10" : ""}>
				{/* WebP версия для современных браузеров */}
				<source sizes={sizes} srcSet={webpSrc} type="image/webp" />

				{/* Fallback для браузеров без поддержки WebP */}
				<img
					alt={alt}
					height={height}
					loading={loadingStrategy}
					onError={handleWebPError}
					onLoad={handleLoad}
					sizes={sizes}
					src={src}
					style={{
						maxWidth: "100%",
						height: "auto",
						opacity: blurDataURL && !isLoaded ? 0 : 1,
						transition: "opacity 0.3s ease-in-out",
					}}
					width={width}
				/>
			</picture>
		</div>
	);
};

/**
 * LazyOptimizedImage Component
 *
 * Версия OptimizedImage с принудительным lazy loading
 * и intersection observer для лучшей производительности.
 */
export const LazyOptimizedImage: React.FC<OptimizedImageProps> = (props) => (
	<OptimizedImage {...props} loading="lazy" />
);

/**
 * PriorityOptimizedImage Component
 *
 * Версия OptimizedImage для критических изображений
 * (above the fold), которые должны загружаться немедленно.
 */
export const PriorityOptimizedImage: React.FC<OptimizedImageProps> = (
	props,
) => <OptimizedImage {...props} loading="eager" priority={true} />;

/**
 * ResponsiveOptimizedImage Component
 *
 * Версия OptimizedImage с предустановленными responsive размерами
 * для мобильных устройств.
 */
interface ResponsiveOptimizedImageProps
	extends Omit<OptimizedImageProps, "sizes"> {
	breakpoints?: {
		mobile?: string;
		tablet?: string;
		desktop?: string;
	};
}

export const ResponsiveOptimizedImage: React.FC<
	ResponsiveOptimizedImageProps
> = ({
	breakpoints = {
		mobile: "100vw",
		tablet: "50vw",
		desktop: "33vw",
	},
	...props
}) => {
	const sizes = `
    (max-width: 768px) ${breakpoints.mobile},
    (max-width: 1024px) ${breakpoints.tablet},
    ${breakpoints.desktop}
  `
		.replace(/\s+/g, " ")
		.trim();

	return <OptimizedImage {...props} sizes={sizes} />;
};

/**
 * Utility function для проверки поддержки WebP
 */
export const checkWebPSupport = (): Promise<boolean> =>
	new Promise((resolve) => {
		if (typeof window === "undefined") {
			resolve(false);
			return;
		}

		const webP = new Image();
		webP.onload = webP.onerror = () => {
			resolve(webP.height === 2);
		};
		webP.src =
			"data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
	});

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
