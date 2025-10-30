import type React from 'react';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface LoadingIndicatorProps {
	size?: 'sm' | 'md' | 'lg';
	text?: string;
	className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
	size = 'md',
	text,
	className = '',
}) => {
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8',
	};

	// Если есть текст, показываем skeleton с текстом
	if (text) {
		return (
			<div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
				<Skeleton className={`${sizeClasses[size]} rounded-full`} />
				<p className="text-muted-foreground text-xs md:text-sm">{text}</p>
			</div>
		);
	}

	// Если нет текста, показываем только skeleton
	return (
		<div className={className}>
			<Skeleton className={`${sizeClasses[size]} rounded-full`} />
		</div>
	);
};

export default LoadingIndicator;
