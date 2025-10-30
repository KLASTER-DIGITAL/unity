import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import type React from 'react';
import { Component, type ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { captureException } from '@/shared/lib/monitoring';

type ErrorBoundaryProps = {
	children: ReactNode;
	fallback?: ReactNode;
	onReset?: () => void;
	showHomeButton?: boolean;
};

type ErrorBoundaryState = {
	hasError: boolean;
	error: Error | null;
	errorInfo: React.ErrorInfo | null;
};

/**
 * ErrorBoundary компонент для перехвата ошибок рендеринга
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * @example С кастомным fallback
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		// Обновляем состояние при ошибке
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Логируем ошибку
		console.error('🔴 [ErrorBoundary] Caught error:', error);
		console.error('🔴 [ErrorBoundary] Error info:', errorInfo);

		// Сохраняем информацию об ошибке в состояние
		this.setState({
			error,
			errorInfo,
		});

		// Отправляем в Sentry
		captureException(error, {
			contexts: {
				react: {
					componentStack: errorInfo.componentStack,
				},
			},
			tags: {
				errorBoundary: 'ErrorBoundary',
			},
		});
	}

	handleReset = () => {
		// Сбрасываем состояние ошибки
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});

		// Вызываем кастомный обработчик если есть
		if (this.props.onReset) {
			this.props.onReset();
		}
	};

	handleReload = () => {
		window.location.reload();
	};

	handleGoHome = () => {
		window.location.href = '/';
	};

	render() {
		if (this.state.hasError) {
			// Если передан кастомный fallback, используем его
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Иначе показываем дефолтный UI
			return (
				<div className="flex min-h-screen items-center justify-center bg-muted p-4">
					<Card className="w-full max-w-2xl">
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="rounded-full bg-red-100 p-3">
									<AlertTriangle className="h-6 w-6 text-red-600" />
								</div>
								<div>
									<CardTitle className="text-2xl">Что-то пошло не так</CardTitle>
									<CardDescription className="mt-1">
										Произошла ошибка при отображении этой страницы
									</CardDescription>
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-4">
							{/* Сообщение об ошибке */}
							{this.state.error && (
								<div className="rounded-lg border border-red-200 bg-red-50 p-4">
									<p className="mb-1 font-medium text-red-900 text-sm">Ошибка:</p>
									<p className="font-mono text-red-700 text-sm">{this.state.error.message}</p>
								</div>
							)}

							{/* Component stack (только в dev режиме) */}
							{__DEV__ && this.state.errorInfo && (
								<details className="rounded-lg border border-border bg-muted p-4">
									<summary className="cursor-pointer font-medium text-foreground text-sm">
										Технические детали (для разработчиков)
									</summary>
									<pre className="mt-2 max-h-64 overflow-auto text-foreground text-xs">
										{this.state.errorInfo.componentStack}
									</pre>
								</details>
							)}

							{/* Рекомендации */}
							<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
								<p className="mb-2 font-medium text-blue-900 text-sm">Что можно сделать:</p>
								<ul className="list-inside list-disc space-y-1 text-blue-700 text-sm">
									<li>Попробуйте обновить страницу</li>
									<li>Очистите кэш браузера</li>
									<li>Вернитесь на главную страницу</li>
									{__DEV__ && <li>Проверьте консоль браузера для деталей</li>}
								</ul>
							</div>
						</CardContent>

						<CardFooter className="flex gap-3">
							<Button className="flex-1" onClick={this.handleReset} variant="outline">
								<RefreshCw className="mr-2 h-4 w-4" />
								Попробовать снова
							</Button>

							<Button className="flex-1" onClick={this.handleReload} variant="outline">
								<RefreshCw className="mr-2 h-4 w-4" />
								Обновить страницу
							</Button>

							{this.props.showHomeButton && (
								<Button className="flex-1" onClick={this.handleGoHome} variant="default">
									<Home className="mr-2 h-4 w-4" />
									На главную
								</Button>
							)}
						</CardFooter>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}

/**
 * Компактный ErrorBoundary для использования внутри других компонентов
 */
export class CompactErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('🔴 [CompactErrorBoundary] Caught error:', error);
		console.error('🔴 [CompactErrorBoundary] Error info:', errorInfo);
		this.setState({ error, errorInfo });

		// Отправляем в Sentry
		captureException(error, {
			contexts: {
				react: {
					componentStack: errorInfo.componentStack,
				},
			},
			tags: {
				errorBoundary: 'CompactErrorBoundary',
			},
		});
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null, errorInfo: null });
		if (this.props.onReset) {
			this.props.onReset();
		}
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4">
					<div className="flex items-start gap-3">
						<AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
						<div className="min-w-0 flex-1">
							<p className="font-medium text-red-900 text-sm">Ошибка отображения</p>
							{this.state.error && (
								<p className="mt-1 font-mono text-red-700 text-xs">{this.state.error.message}</p>
							)}
							<Button className="mt-2" onClick={this.handleReset} size="sm" variant="outline">
								<RefreshCw className="mr-1 h-3 w-3" />
								Попробовать снова
							</Button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
