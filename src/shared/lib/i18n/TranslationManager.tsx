import React, { useEffect, useState } from 'react';
import { TranslationLoader } from './loader';
import { useTranslationContext } from './TranslationProvider';
import { LottiePreloader } from '@/shared/components/LottiePreloader';

interface TranslationManagerProps {
  children: React.ReactNode;
  preloadLanguages?: string[];
  onLanguageChange?: (language: string) => void;
  validateCacheOnMount?: boolean;
}

export const TranslationManager: React.FC<TranslationManagerProps> = ({
  children,
  preloadLanguages = ['en'],
  onLanguageChange,
  validateCacheOnMount = true
}) => {
  const { currentLanguage, changeLanguage, isLoading, error, isLoaded } = useTranslationContext();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('TranslationManager: Initializing...');
        
        // Валидация кэша при запуске
        if (validateCacheOnMount) {
          console.log('TranslationManager: Validating cache...');
          await TranslationLoader.validateCache();
        }
        
        // Предзагрузка дополнительных языков
        if (preloadLanguages.length > 0) {
          console.log(`TranslationManager: Preloading languages: ${preloadLanguages.join(', ')}`);
          await TranslationLoader.preloadLanguages(preloadLanguages);
        }
        
        console.log('TranslationManager: Initialization complete');
        setIsInitialized(true);
        setInitError(null);
      } catch (error) {
        console.error('TranslationManager initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
        setIsInitialized(true); // Все равно продолжаем работу
      }
    };

    initialize();
  }, [preloadLanguages, validateCacheOnMount]);

  useEffect(() => {
    onLanguageChange?.(currentLanguage);
  }, [currentLanguage, onLanguageChange]);

  // Показываем загрузку только при первой инициализации
  if (!isInitialized) {
    return (
      <LottiePreloader
        showMessage={false}
        minDuration={5000}
        size="lg"
      />
    );
  }

  // Показываем ошибку инициализации
  if (initError && !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Initialization Error</h2>
          <p className="text-muted-foreground mb-4">
            We had trouble setting up the app, but we'll try to continue with basic functionality.
          </p>
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
            {initError}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Хук для отслеживания состояния инициализации
export const useTranslationManager = () => {
  const { currentLanguage, isLoading, error, isLoaded } = useTranslationContext();
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // Эмулируем состояние инициализации
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return {
    isInitializing,
    isReady: !isInitializing && isLoaded && !error,
    currentLanguage,
    isLoading,
    error,
    isLoaded
  };
};

// Компонент для обертки с безопасной миграцией
export const SafeTranslationProvider: React.FC<{
  children: React.ReactNode;
  useNewSystem?: boolean;
}> = ({ children, useNewSystem = true }) => {
  // В будущем здесь будет логика для переключения между старой и новой системами
  if (useNewSystem) {
    return (
      <TranslationManager preloadLanguages={['en']}>
        {children}
      </TranslationManager>
    );
  }
  
  return <>{children}</>;
};