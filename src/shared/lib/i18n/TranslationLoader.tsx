import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from './useTranslation';

type TranslationLoaderProps = {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	showError?: boolean;
	showRetry?: boolean;
	minLoadingTime?: number;
};

export const TranslationLoader: React.FC<TranslationLoaderProps> = ({
	children,
	fallback,
	showError = true,
	showRetry = true,
	minLoadingTime = 500,
}) => {
	const { isLoading, error, refreshTranslations, isLoaded } = useTranslation();
	const [showMinLoading, setShowMinLoading] = React.useState(false);

	// Показываем минимальное время загрузки для лучшего UX
	useEffect(() => {
		if (isLoading) {
			setShowMinLoading(true);
			const timer = setTimeout(() => {
				setShowMinLoading(false);
			}, minLoadingTime);

			return () => clearTimeout(timer);
		}
	}, [isLoading, minLoadingTime]);

	useEffect(() => {
		if (error) {
			console.error('Translation loading error:', error);
		}
	}, [error]);

	// Показываем загрузку
	if (isLoading || showMinLoading) {
		return (
			fallback || (
				<div className="flex items-center justify-center p-8">
					<div className="text-center">
						<Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
						<p className="text-muted-foreground text-sm">
							{isLoaded ? 'Updating translations...' : 'Loading translations...'}
						</p>
					</div>
				</div>
			)
		);
	}

	// Показываем ошибку
	if (error && showError) {
		return (
			<Alert className="m-4" variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription className="flex items-center justify-between">
					<span>
						Failed to load translations. Using fallback language.
						<br />
						<span className="text-xs opacity-75">Error: {error}</span>
					</span>
					{showRetry && (
						<Button className="ml-2" onClick={refreshTranslations} size="sm" variant="outline">
							<RefreshCw className="mr-1 h-4 w-4" />
							Retry
						</Button>
					)}
				</AlertDescription>
			</Alert>
		);
	}

	return <>{children}</>;
};

// Компонент для индикатора загрузки переводов
export const TranslationLoadingIndicator: React.FC<{
	showText?: boolean;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}> = ({ showText = true, size = 'sm', className = '' }) => {
	const { isLoading } = useTranslation();

	if (!isLoading) {
		return null;
	}

	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8',
	};

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
			{showText && <span className="text-muted-foreground text-xs">Loading...</span>}
		</div>
	);
};

// Компонент для отладки переводов
export const TranslationDebugInfo: React.FC<{
	show?: boolean;
}> = ({ show = false }) => {
	const { currentLanguage, isLoading, error, isLoaded } = useTranslation();

	if (!show || process.env.NODE_ENV !== 'development') {
		return null;
	}

	return (
		<div className="fixed right-4 bottom-4 z-50 max-w-xs rounded bg-black/80 p-2 text-white text-xs">
			<div>Language: {currentLanguage}</div>
			<div>Loading: {isLoading ? 'Yes' : 'No'}</div>
			<div>Loaded: {isLoaded ? 'Yes' : 'No'}</div>
			{error && <div className="text-red-400">Error: {error}</div>}
		</div>
	);
};
