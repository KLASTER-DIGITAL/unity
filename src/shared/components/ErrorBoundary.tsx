import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { captureException } from '@/shared/lib/monitoring';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  showHomeButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

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
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
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
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-900 mb-1">
                    Ошибка:
                  </p>
                  <p className="text-sm text-red-700 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Component stack (только в dev режиме) */}
              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="p-4 bg-gray-100 border border-gray-200 rounded-lg">
                  <summary className="text-sm font-medium text-gray-900 cursor-pointer">
                    Технические детали (для разработчиков)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-700 overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Рекомендации */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Что можно сделать:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Попробуйте обновить страницу</li>
                  <li>Очистите кэш браузера</li>
                  <li>Вернитесь на главную страницу</li>
                  {import.meta.env.DEV && (
                    <li>Проверьте консоль браузера для деталей</li>
                  )}
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Попробовать снова
              </Button>

              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Обновить страницу
              </Button>

              {this.props.showHomeButton && (
                <Button
                  onClick={this.handleGoHome}
                  variant="default"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-900">
                Ошибка отображения
              </p>
              {this.state.error && (
                <p className="text-xs text-red-700 mt-1 font-mono">
                  {this.state.error.message}
                </p>
              )}
              <Button
                onClick={this.handleReset}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
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

