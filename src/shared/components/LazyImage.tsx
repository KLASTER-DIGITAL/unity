import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { LottieLoadingIndicator } from './LottieLoadingIndicator';

type LazyImageProps = {
	src: string;
	alt: string;
	className?: string;
	placeholder?: string;
	threshold?: number;
	onLoad?: () => void;
	onError?: () => void;
};

export function LazyImage({
	src,
	alt,
	className = '',
	placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
	threshold = 0.1,
	onLoad,
	onError,
}: LazyImageProps) {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isInView, setIsInView] = useState(false);
	const [hasError, setHasError] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);

	// Intersection Observer for lazy loading
	useEffect(() => {
		if (!imgRef.current) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsInView(true);
						observer.disconnect();
					}
				});
			},
			{
				threshold,
				rootMargin: '50px', // Start loading 50px before entering viewport
			}
		);

		observer.observe(imgRef.current);

		return () => {
			observer.disconnect();
		};
	}, [threshold]);

	const handleLoad = () => {
		setIsLoaded(true);
		onLoad?.();
	};

	const handleError = () => {
		setHasError(true);
		onError?.();
	};

	return (
		<div className={`relative overflow-hidden ${className}`}>
			{/* Placeholder */}
			{!(isLoaded || hasError) && (
				<img
					alt=""
					className="absolute inset-0 h-full w-full object-cover blur-sm"
					src={placeholder}
				/>
			)}

			{/* Actual image */}
			<motion.img
				alt={alt}
				animate={{ opacity: isLoaded ? 1 : 0 }}
				className={`h-full w-full object-cover transition-opacity duration-300 ${
					isLoaded ? 'opacity-100' : 'opacity-0'
				}`}
				initial={{ opacity: 0 }}
				onError={handleError}
				onLoad={handleLoad}
				ref={imgRef}
				src={isInView ? src : placeholder}
				transition={{ duration: 0.3 }}
			/>

			{/* Error state */}
			{hasError && (
				<div className="absolute inset-0 flex items-center justify-center bg-muted dark:bg-card">
					<div className="text-center text-muted-foreground">
						<svg
							className="mx-auto mb-2 h-12 w-12"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							role="img"
							aria-label="Image failed to load"
						>
							<path
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
						</svg>
						<p className="text-sm">Не удалось загрузить</p>
					</div>
				</div>
			)}

			{/* Loading spinner */}
			{!(isLoaded || hasError) && isInView && (
				<div className="absolute inset-0 flex items-center justify-center">
					<LottieLoadingIndicator size="lg" />
				</div>
			)}
		</div>
	);
}
