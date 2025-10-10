import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "sonner";
import { checkSession, signOut } from "./utils/auth";
import { updateUserProfile } from "./utils/api";
import { isPWAEnabled, logPWADebugInfo } from "./utils/pwaUtils";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { OnboardingScreen2 } from "./components/OnboardingScreen2";
import { OnboardingScreen3 } from "./components/OnboardingScreen3";
import { OnboardingScreen4 } from "./components/OnboardingScreen4";
import { AuthScreen } from "./components/AuthScreen";
import { AdminLoginScreen } from "./components/AdminLoginScreen";
import { AchievementHomeScreen } from "./components/screens/AchievementHomeScreen";
import { HistoryScreen } from "./components/screens/HistoryScreen";
import { AchievementsScreen } from "./components/screens/AchievementsScreen";
import { ReportsScreen } from "./components/screens/ReportsScreen";
import { SettingsScreen } from "./components/screens/SettingsScreen";
import { AdminDashboard } from "./components/screens/AdminDashboard";
import { InstallPrompt } from "./components/InstallPrompt";
import { PWAHead } from "./components/PWAHead";
import { PWAStatus } from "./components/PWAStatus";
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt";
import { PWASplash } from "./components/PWASplash";

const appTranslations = {
  ru: {
    home: "Дневник Достижений",
    history: "История", 
    achievements: "Достижения",
    reports: "AI Обзоры",
    settings: "Настройки"
  },
  en: {
    home: "Achievement Diary",
    history: "History",
    achievements: "Achievements", 
    reports: "AI Reports",
    settings: "Settings"
  },
  es: {
    home: "Diario de Logros",
    history: "Historia",
    achievements: "Logros",
    reports: "Informes AI", 
    settings: "Configuración"
  },
  de: {
    home: "Erfolgstagenbuch",
    history: "Geschichte",
    achievements: "Erfolge",
    reports: "AI Berichte",
    settings: "Einstellungen"
  },
  fr: {
    home: "Journal des Réussites",
    history: "Historique",
    achievements: "Réalisations",
    reports: "Rapports AI",
    settings: "Paramètres"
  },
  zh: {
    home: "成就日记",
    history: "历史",
    achievements: "成就",
    reports: "AI 报告", 
    settings: "设置"
  },
  ja: {
    home: "成果日記",
    history: "履歴",
    achievements: "実績",
    reports: "AI レポート",
    settings: "設定"
  }
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ru");
  const [activeTab, setActiveTab] = useState("home");
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showAuth, setShowAuth] = useState(false); // Для показа экрана входа/регистрации
  const [diaryData, setDiaryData] = useState({ name: "", emoji: "🏆" });
  const [firstEntry, setFirstEntry] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [showAuthAfterEntry, setShowAuthAfterEntry] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false); // Нужен ли онбординг после регистрации
  const [notificationSettings, setNotificationSettings] = useState({
    selectedTime: 'none' as 'none' | 'morning' | 'evening' | 'both',
    morningTime: '08:00',
    eveningTime: '21:00',
    permissionGranted: false
  });
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Проверка сессии при загрузке
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Проверка админского роута через query параметры
  useEffect(() => {
    const checkAdminRoute = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isAdmin = urlParams.get('view') === 'admin';
      setIsAdminRoute(isAdmin);
      
      // Если админский роут и нет пользователя, показываем авторизацию
      if (isAdmin && !userData?.id && !isCheckingSession) {
        setShowAdminAuth(true);
      } else if (isAdmin && userData?.id) {
        setShowAdminAuth(false);
      }
    };
    
    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    
    // Также слушаем изменения hash для поддержки навигации
    window.addEventListener('hashchange', checkAdminRoute);
    
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, [userData, isCheckingSession]);

  // PWA: Регистрация Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  // PWA: Инициализация pwa-enabled при первой загрузке
  useEffect(() => {
    const pwaEnabled = localStorage.getItem('pwa-enabled');
    if (pwaEnabled === null) {
      // Первая загрузка - устанавливаем PWA как включенную по умолчанию
      localStorage.setItem('pwa-enabled', 'true');
      console.log('✅ PWA initialized as enabled (default)');
    } else {
      console.log('ℹ️ PWA status from localStorage:', pwaEnabled);
    }
    
    // Логируем детальную информацию о PWA для отладки
    logPWADebugInfo();
  }, []);

  // PWA: Обработка события beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e);
      
      // ВАЖНО: Проверяем включена ли PWA в админ-панели
      if (!isPWAEnabled()) {
        console.log('❌ PWA disabled by admin - not showing install prompt');
        return;
      }
      
      console.log('✅ PWA enabled - preparing to show install prompt');
      
      // Проверяем, показывали ли мы уже приглашение
      const installPromptShown = localStorage.getItem('installPromptShown');
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      console.log('Install prompt shown before:', installPromptShown);
      console.log('Is app in standalone mode:', isStandalone);
      
      // Показываем только если еще не показывали и приложение не установлено
      if (!installPromptShown && !isStandalone) {
        console.log('🎉 Will show install prompt in 3 seconds...');
        setTimeout(() => {
          console.log('📱 Showing InstallPrompt now!');
          setShowInstallPrompt(true);
        }, 3000); // Задержка 3 секунды после загрузки
      } else {
        console.log('ℹ️ Not showing prompt:', {
          alreadyShown: !!installPromptShown,
          isStandalone: isStandalone
        });
      }
    };

    // Логируем что мы начинаем слушать событие
    console.log('🎧 Starting to listen for beforeinstallprompt event...');
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Проверяем поддержку PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    console.log('PWA Support Check:', {
      isStandalone,
      isIOSSafari,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasBeforeInstallPrompt: 'onbeforeinstallprompt' in window
    });

    return () => {
      console.log('🔇 Stopped listening for beforeinstallprompt');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Функция установки PWA
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    localStorage.setItem('installPromptShown', 'true');
  };

  // Функция закрытия приглашения установки
  const handleInstallClose = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('installPromptShown', 'true');
  };

  const checkExistingSession = async () => {
    try {
      const result = await checkSession();
      
      if (result.success && result.user && result.profile) {
        console.log('Existing session found:', result.user.id);
        
        // Загружаем данные пользователя
        setUserData({
          id: result.user.id,
          email: result.user.email,
          name: result.profile.name,
          diaryData: {
            name: result.profile.diaryName,
            emoji: result.profile.diaryEmoji
          },
          language: result.profile.language,
          notificationSettings: result.profile.notificationSettings,
          onboardingCompleted: result.profile.onboardingCompleted,
          createdAt: result.profile.createdAt
        });
        
        setDiaryData({
          name: result.profile.diaryName || 'Мой дневник',
          emoji: result.profile.diaryEmoji || '🏆'
        });
        
        setSelectedLanguage(result.profile.language || 'ru');
        setNotificationSettings(result.profile.notificationSettings || {
          selectedTime: 'none',
          morningTime: '08:00',
          eveningTime: '21:00',
          permissionGranted: false
        });
        
        // Проверяем завершен ли онбординг
        if (result.profile.onboardingCompleted) {
          console.log('✅ Onboarding already completed');
          setOnboardingComplete(true);
          setNeedsOnboarding(false);
        } else {
          console.log('⚠️ User needs to complete onboarding');
          setOnboardingComplete(false);
          setNeedsOnboarding(true);
          setCurrentStep(2); // Начинаем со 2 шага (пропускаем выбор языка)
        }
      } else {
        console.log('No existing session - showing auth screen');
        // Нет сессии - показываем экран входа/регистрации
        setShowAuth(true);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setShowAuth(true);
    } finally {
      setIsCheckingSession(false);
    }
  };

  // Функция выхода
  const handleLogout = async () => {
    try {
      await signOut();
      
      // Сброс состояния
      setActiveTab("home");
      setCurrentStep(1);
      setOnboardingComplete(false);
      setNeedsOnboarding(false);
      setDiaryData({ name: "", emoji: "🏆" });
      setFirstEntry("");
      setUserData(null);
      setShowAuthAfterEntry(false);
      setShowAuth(true); // Показываем экран входа после выхода
      setNotificationSettings({
        selectedTime: 'none',
        morningTime: '08:00',
        eveningTime: '21:00',
        permissionGranted: false
      });
      
      console.log('User logged out - showing auth screen');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Функция для обработки выбора языка (шаг 1 -> шаг 2)
  const handleLanguageSelected = (language: string) => {
    setSelectedLanguage(language);
    setCurrentStep(2);
  };

  // Функция для обработки Skip на шаге 1 (WelcomeScreen)
  const handleWelcomeSkip = () => {
    console.log('Skip clicked on WelcomeScreen - showing auth');
    setShowAuth(true);
    setCurrentStep(1); // Остаемся на 1 шаге на случай возврата
  };

  // Функция для перехода из второго онбординга к третьему (шаг 2 -> шаг 3)
  const handleOnboarding2Next = () => {
    setCurrentStep(3);
  };

  // Функция для пропуска второ��о онбординга - переход к третьему (шаг 2 -> шаг 3)
  const handleOnboarding2Skip = () => {
    setCurrentStep(3);
  };

  // Функция для завершения третьего онбординга и перехода к четвертому (шаг 3 -> шаг 4)
  const handleOnboarding3Next = async (diaryName: string, emoji: string) => {
    setDiaryData({ name: diaryName, emoji });
    
    // Если пользователь уже авторизован, сохраняем изменения
    if (userData?.id) {
      try {
        await updateUserProfile(userData.id, {
          diaryName,
          diaryEmoji: emoji
        });
        console.log('Diary settings saved');
      } catch (error) {
        console.error('Error saving diary settings:', error);
      }
    }
    
    setCurrentStep(4);
  };

  // Функция для пропуска третьего онбординга - переход к четвертому (шаг 3 -> шаг 4)
  const handleOnboarding3Skip = () => {
    setDiaryData({ name: "Мой дневник", emoji: "🏆" });
    setCurrentStep(4);
  };

  // Функция для завершения четвертого онбординга (шаг 4 -> проверка авторизации)
  const handleOnboarding4Next = async (entry: string, settings: any) => {
    setFirstEntry(entry);
    setNotificationSettings(settings);
    
    // Если пользователь уже авторизован, сохраняем настройки и завершаем онбординг
    if (userData?.id) {
      try {
        await updateUserProfile(userData.id, {
          notificationSettings: settings,
          onboardingCompleted: true // Помечаем онбординг как завершенный
        });
        console.log('✅ Onboarding completed and saved');
        
        // Обновляем userData
        setUserData({
          ...userData,
          onboardingCompleted: true,
          notificationSettings: settings
        });
        
        setOnboardingComplete(true);
        setNeedsOnboarding(false);
      } catch (error) {
        console.error('Error saving onboarding data:', error);
        // Даже если сохранение не удалось, завершаем онбординг локально
        setOnboardingComplete(true);
      }
    } else {
      // Если есть запись и пользователь не авторизован, показываем экран авторизации
      if (entry.trim()) {
        setTimeout(() => {
          setShowAuthAfterEntry(true);
        }, 1000);
      } else {
        // Нет записи и нет пользователя - показываем обычную авторизацию
        setShowAuth(true);
      }
    }
  };

  // Функция для пропуска четвертого онбординга (шаг 4 -> завершено)
  const handleOnboarding4Skip = async () => {
    // Если пользователь авторизован, помечаем онбординг как завершенный
    if (userData?.id) {
      try {
        await updateUserProfile(userData.id, {
          onboardingCompleted: true
        });
        console.log('✅ Onboarding skipped and marked as completed');
        
        setUserData({
          ...userData,
          onboardingCompleted: true
        });
      } catch (error) {
        console.error('Error marking onboarding as completed:', error);
      }
    }
    
    setOnboardingComplete(true);
    setNeedsOnboarding(false);
  };

  // Функция для завершения авторизации после записи
  const handleAuthAfterEntryComplete = async (data: any) => {
    setUserData(data);
    
    // Если есть данные из онбординга, обновляем профиль и помечаем онбординг завершенным
    if (data.id && (diaryData.name || notificationSettings.selectedTime !== 'none')) {
      try {
        await updateUserProfile(data.id, {
          diaryName: diaryData.name || 'Мой дневник',
          diaryEmoji: diaryData.emoji || '🏆',
          notificationSettings: notificationSettings,
          language: selectedLanguage,
          onboardingCompleted: true // Помечаем онбординг как завершенный
        });
        console.log('✅ Onboarding data saved and marked as completed');
        
        // Обновляем userData
        setUserData({
          ...data,
          onboardingCompleted: true
        });
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      }
    }
    
    setShowAuthAfterEntry(false);
    setOnboardingComplete(true);
    setNeedsOnboarding(false);
  };



  // Функция для возврата с авторизации к записи
  const handleAuthAfterEntryBack = () => {
    setShowAuthAfterEntry(false);
    // Остаемся на том же шаге 4, пользователь может изменить запись
  };

  // Функция для завершения обычной авторизации (Skip или Logout)
  const handleAuthComplete = async (data: any) => {
    console.log('Auth completed:', data);
    setUserData(data);
    setShowAuth(false);
    
    // Проверяем нужен ли онбординг
    if (data.onboardingCompleted === false || data.onboardingCompleted === undefined) {
      console.log('⚠️ User needs onboarding - starting from step 2');
      setNeedsOnboarding(true);
      setOnboardingComplete(false);
      setCurrentStep(2); // Начинаем со 2 шага
      setSelectedLanguage(data.language || 'ru');
    } else {
      console.log('✅ User already completed onboarding');
      setOnboardingComplete(true);
      setNeedsOnboarding(false);
      
      // Загружаем данные профиля
      setDiaryData({
        name: data.diaryData?.name || data.diaryName || 'Мой дневник',
        emoji: data.diaryData?.emoji || data.diaryEmoji || '🏆'
      });
      setSelectedLanguage(data.language || 'ru');
      if (data.notificationSettings) {
        setNotificationSettings(data.notificationSettings);
      }
    }
  };

  // Функция для возврата с экрана авторизации
  const handleAuthBack = () => {
    setShowAuth(false);
    // Возвращаемся к онбордингу на шаг 1
    setCurrentStep(1);
  };

  // Функция для навигации по шагам через прогресс-бар
  const handleStepNavigation = (step: number) => {
    if (step <= currentStep || step === 1) {
      setCurrentStep(step);
    }
  };

  const getScreenTitle = () => {
    const translations = appTranslations[selectedLanguage as keyof typeof appTranslations] || appTranslations.ru;
    switch (activeTab) {
      case "home": return translations.home;
      case "history": return translations.history;
      case "achievements": return translations.achievements;
      case "reports": return translations.reports;
      case "settings": return translations.settings;
      default: return translations.home;
    }
  };

  // Функция для завершения админской авторизации
  const handleAdminAuthComplete = async (data: any) => {
    setUserData(data);
    setShowAdminAuth(false);
    
    // Проверяем права супер-админа
    if (data.email !== "diary@leadshunter.biz") {
      alert('У вас нет прав доступа к панели администратора');
      window.history.replaceState({}, '', window.location.pathname);
      setIsAdminRoute(false);
    }
  };

  const renderActiveScreen = () => {
    // Админский роут обрабатывается выше, до онбординга
    // Здесь только обычные экраны приложения
    switch (activeTab) {
      case "home": return <AchievementHomeScreen diaryData={diaryData} firstEntry={firstEntry} userData={userData} />;
      case "history": return <HistoryScreen userData={userData} />;
      case "achievements": return <AchievementsScreen userData={userData} />;
      case "reports": return <ReportsScreen userData={userData} />;
      case "settings": return <SettingsScreen userData={userData} onLogout={handleLogout} />;
      default: return <AchievementHomeScreen diaryData={diaryData} firstEntry={firstEntry} userData={userData} />;
    }
  };

  // Показываем загрузку во время проверки сессии
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center max-w-md mx-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="!text-[15px] text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // ВАЖНО: Проверяем админский роут ДО проверки онбординга
  if (isAdminRoute) {
    // Если не авторизован, показываем защищенную страницу входа для админа
    if (!userData?.id) {
      return (
        <AdminLoginScreen 
          onComplete={handleAdminAuthComplete}
          onBack={() => {
            window.history.replaceState({}, '', window.location.pathname);
            setIsAdminRoute(false);
            setShowAdminAuth(false);
          }}
        />
      );
    }
    
    // Если авторизован, показываем админ-пане��ь (БЕЗ max-w-md для десктопной версии)
    return (
      <div className="min-h-screen bg-background">
        <AdminDashboard 
          userData={userData} 
          onLogout={async () => {
            // Выход из системы
            await signOut();
            
            // Очищаем userData но ОСТАЕМСЯ на админском роуте
            setUserData(null);
            setShowAdminAuth(true);
            
            // НЕ удаляем ?view=admin - остаемся на админской странице
            console.log('Admin logged out, showing login screen');
          }} 
        />
      </div>
    );
  }

  // Показываем экран авторизации если нет сессии И не нужен онбординг
  if (showAuth && !needsOnboarding) {
    return (
      <div className="max-w-md mx-auto overflow-hidden">
        <AuthScreen 
          onComplete={handleAuthComplete}
          onBack={handleAuthBack}
          showTopBar={true}
          contextText="Добро пожаловать!"
        />
      </div>
    );
  }

  // Показываем онбординг до завершения (только для обычных пользователей, не для админа)
  if (!onboardingComplete) {
    return (
      <div className="max-w-md mx-auto overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 1 && !userData?.id && (
            <motion.div
              key="step1"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <WelcomeScreen 
                onNext={handleLanguageSelected}
                onSkip={handleWelcomeSkip}
                currentStep={1}
                totalSteps={4}
                onStepClick={handleStepNavigation}
              />
            </motion.div>
          )}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden"
            >
              {/* Верхняя часть - уходит вверх */}
              <motion.div
                initial={{ y: 0 }}
                exit={{ y: -400 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
                className="absolute inset-0"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 60%)' }}
              >
                <OnboardingScreen2 
                  selectedLanguage={selectedLanguage}
                  onNext={handleOnboarding2Next}
                  onSkip={handleOnboarding2Skip}
                  currentStep={2}
                  totalSteps={4}
                  onStepClick={handleStepNavigation}
                />
              </motion.div>
              
              {/* Нижняя левая часть - уходит влево */}
              <motion.div
                initial={{ x: 0 }}
                exit={{ x: -400 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
                className="absolute inset-0"
                style={{ clipPath: 'polygon(0 60%, 50% 60%, 50% 100%, 0 100%)' }}
              >
                <OnboardingScreen2 
                  selectedLanguage={selectedLanguage}
                  onNext={handleOnboarding2Next}
                  onSkip={handleOnboarding2Skip}
                  currentStep={2}
                  totalSteps={4}
                  onStepClick={handleStepNavigation}
                />
              </motion.div>
              
              {/* Нижняя правая часть - уходит вправо */}
              <motion.div
                initial={{ x: 0 }}
                exit={{ x: 400 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
                className="absolute inset-0"
                style={{ clipPath: 'polygon(50% 60%, 100% 60%, 100% 100%, 50% 100%)' }}
              >
                <OnboardingScreen2 
                  selectedLanguage={selectedLanguage}
                  onNext={handleOnboarding2Next}
                  onSkip={handleOnboarding2Skip}
                  currentStep={2}
                  totalSteps={4}
                  onStepClick={handleStepNavigation}
                />
              </motion.div>
              
              {/* Основной экран для входящей анимации */}
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <OnboardingScreen2 
                  selectedLanguage={selectedLanguage}
                  onNext={handleOnboarding2Next}
                  onSkip={handleOnboarding2Skip}
                  currentStep={2}
                  totalSteps={4}
                  onStepClick={handleStepNavigation}
                />
              </motion.div>
            </motion.div>
          )}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden"
            >
              {/* Верхняя часть - уходит вверх */}
              <motion.div
                initial={{ y: 0 }}
                exit={{ y: -400 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
                className="absolute inset-0"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 60%)' }}
              >
                <OnboardingScreen3 
                  selectedLanguage={selectedLanguage}
                  onNext={handleOnboarding3Next}
                  onSkip={handleOnboarding3Skip}
                  currentStep={3}
                  totalSteps={4}
                  onStepClick={handleStepNavigation}
                />
              </motion.div>
              
              {/* Нижняя левая часть - уходит влево */}
              <motion.div
                initial={{ x: 0 }}
                exit={{ x: -400 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
                className="absolute inset-0"
                style={{ clipPath: 'polygon(0 60%, 50% 60%, 50% 100%, 0 100%)' }}
              >
                <OnboardingScreen3 
                  selectedLanguage={selectedLanguage}
                  onNext={handleOnboarding3Next}
                  onSkip={handleOnboarding3Skip}
                  currentStep={3}
                  totalSteps={4}
                  onStepClick={handleStepNavigation}
                />
              </motion.div>
              
              {/* Нижняя правая часть - уходит вправо */}
              <motion.div
                initial={{ x: 0 }}
                exit={{ x: 400 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
                className="absolute inset-0"
                style={{ clipPath: 'polygon(50% 60%, 100% 60%, 100% 100%, 50% 100%)' }}
              >
                <OnboardingScreen3 
                  selectedLanguage={selectedLanguage}
                  onNext={handleOnboarding3Next}
                  onSkip={handleOnboarding3Skip}
                  currentStep={3}
                  totalSteps={4}
                  onStepClick={handleStepNavigation}
                />
              </motion.div>
              
              {/* Основной экран для входящей анимации */}
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <OnboardingScreen3 
                  selectedLanguage={selectedLanguage}
                  onNext={handleOnboarding3Next}
                  onSkip={handleOnboarding3Skip}
                  currentStep={3}
                  totalSteps={4}
                  onStepClick={handleStepNavigation}
                />
              </motion.div>
            </motion.div>
          )}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden"
            >
              {/* Верхняя часть - уходит вверх */}
              <motion.div
                initial={{ y: 0 }}
                exit={{ y: -400 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
                className="absolute inset-0"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 60%)' }}
              >
                <OnboardingScreen4 
                  selectedLanguage={selectedLanguage}
                  onNext={handleOnboarding4Next}
                  onSkip={handleOnboarding4Skip}
                  currentStep={4}
                  totalSteps={4}
                  onStepClick={handleStepNavigation}
                />
              </motion.div>
              
              {/* Нижняя левая часть - уходит влево */}
              <motion.div
                initial={{ x: 0 }}
                exit={{ x: -400 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
                className="absolute inset-0"
                style={{ clipPath: 'polygon(0 60%, 50% 60%, 50% 100%, 0 100%)' }}
              >
                <OnboardingScreen4 
                  selectedLanguage={selectedLanguage}
                  onNext={handleOnboarding4Next}
                  onSkip={handleOnboarding4Skip}
                  currentStep={4}
                  totalSteps={4}
                  onStepClick={handleStepNavigation}
                />
              </motion.div>
              
              {/* Нижняя правая часть - уходит вправо */}
              <motion.div
                initial={{ x: 0 }}
                exit={{ x: 400 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
                className="absolute inset-0"
                style={{ clipPath: 'polygon(50% 60%, 100% 60%, 100% 100%, 50% 100%)' }}
              >
                <OnboardingScreen4 
                  selectedLanguage={selectedLanguage}
                  onNext={handleOnboarding4Next}
                  onSkip={handleOnboarding4Skip}
                  currentStep={4}
                  totalSteps={4}
                  onStepClick={handleStepNavigation}
                />
              </motion.div>
              
              {/* Основной экран для входящей анимации */}
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <OnboardingScreen4 
                  selectedLanguage={selectedLanguage}
                  onNext={handleOnboarding4Next}
                  onSkip={handleOnboarding4Skip}
                  currentStep={4}
                  totalSteps={4}
                  onStepClick={handleStepNavigation}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Auth Screen after first entry */}
        <AnimatePresence>
          {showAuthAfterEntry && (
            <motion.div
              key="auth-after-entry"
              className="absolute inset-0 z-50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <AuthScreen 
                onComplete={handleAuthAfterEntryComplete}
                onBack={handleAuthAfterEntryBack}
                showTopBar={false}
                contextText="Сохраним твои успехи?"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative overflow-x-hidden scrollbar-hide">
      {/* PWA Head Meta Tags */}
      <PWAHead />

      {/* PWA Splash Screen */}
      <PWASplash />

      {/* Main Content */}
      <main className="min-h-screen overflow-x-hidden scrollbar-hide">
        {renderActiveScreen()}
      </main>

      {/* Bottom Navigation - скрываем на админ панели */}
      {!isAdminRoute && (
        <MobileBottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      )}

      {/* Toast Notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-family-primary)',
          }
        }}
      />

      {/* Install Prompt */}
      {showInstallPrompt && (
        <InstallPrompt 
          onClose={handleInstallClose}
          onInstall={handleInstallClick}
        />
      )}

      {/* PWA Status - показывает когда приложение установлено */}
      <PWAStatus />

      {/* PWA Update Prompt - показывает когда доступно обновление */}
      <PWAUpdatePrompt />
    </div>
  );
}