import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import { isPWAInstalled, isIOSSafari, getInstallInstructions } from "../../utils/pwaUtils";
import { useTranslations } from "../../utils/i18n";
import { updateUserProfile } from "../../utils/api";
import { 
  Settings, 
  Bell, 
  Palette, 
  Shield, 
  Crown, 
  Download,
  Upload,
  Trash2,
  HelpCircle,
  Mail,
  Star,
  ChevronRight,
  Moon,
  Smartphone,
  Globe,
  Calendar,
  LogOut,
  Info
} from "lucide-react";

interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag: string;
  is_active: boolean;
}

// Fallback языки на случай, если API недоступен
const fallbackLanguages: Language[] = [
  { id: '1', code: 'ru', name: 'Russian', native_name: 'Русский', flag: '🇷🇺', is_active: true },
  { id: '2', code: 'en', name: 'English', native_name: 'English', flag: '🇬🇧', is_active: true },
  { id: '3', code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸', is_active: true },
  { id: '4', code: 'de', name: 'German', native_name: 'Deutsch', flag: '🇩🇪', is_active: true },
  { id: '5', code: 'fr', name: 'French', native_name: 'Français', flag: '🇫🇷', is_active: true },
  { id: '6', code: 'zh', name: 'Chinese', native_name: '中文', flag: '🇨🇳', is_active: true },
  { id: '7', code: 'ja', name: 'Japanese', native_name: '日本語', flag: '🇯🇵', is_active: true },
];

interface SettingsScreenProps {
  userData?: any;
  onLogout?: () => void;
}

export function SettingsScreen({ userData, onLogout }: SettingsScreenProps) {
  // Получаем переводы для языка пользователя
  const t = useTranslations(userData?.language || 'ru');
  
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    achievements: true,
    motivational: false
  });

  const [privacy, setPrivacy] = useState({
    biometric: true,
    autoBackup: true,
    analytics: false
  });

  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languages, setLanguages] = useState<Language[]>(fallbackLanguages);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);

  // Загрузка языков из API
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch('/functions/v1/translations-api/languages');
        if (response.ok) {
          const data = await response.json();
          setLanguages(data);
        } else {
          console.error('Failed to load languages:', response.status);
          setLanguages(fallbackLanguages);
        }
      } catch (error) {
        console.error('Error loading languages:', error);
        setLanguages(fallbackLanguages);
      } finally {
        setIsLoadingLanguages(false);
      }
    };

    loadLanguages();
  }, []);

  // Проверяем возможность установки PWA
  useEffect(() => {
    const installed = isPWAInstalled();
    console.log('PWA installed:', installed);
    
    if (!installed) {
      setShowInstallButton(true);
      console.log('✅ Showing install button in settings');
    } else {
      console.log('ℹ️ PWA already installed - hiding install button');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 beforeinstallprompt caught in settings');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleLanguageChange = async (newLanguage: string) => {
    if (!userData?.id) return;
    
    try {
      await updateUserProfile(userData.id, { language: newLanguage });
      toast.success("Язык изменён!");
      setShowLanguageModal(false);
      // Перезагружаем страницу для применения нового языка
      window.location.reload();
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error("Ошибка при изменении языка");
    }
  };
  
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('No deferredPrompt available, showing instructions');
      
      const instructions = getInstallInstructions();
      
      toast.info('Инструкции по установке', {
        description: instructions,
        duration: 10000
      });
      return;
    }

    try {
      console.log('Prompting user to install PWA...');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        toast.success('Приложение устанавливается...');
        setShowInstallButton(false);
      } else {
        console.log('❌ User dismissed the install prompt');
        toast.info('Вы можете установить приложение позже');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during PWA install:', error);
      toast.error('Ошибка при установке приложения');
    }
  };
  
  // Данные пользователя для демонстрации
  const user = {
    name: userData?.name || "Пользователь",
    email: userData?.email || "user@example.com",
    avatar: userData?.avatar || null,
    location: "Москва, Россия"
  };

  const themes = [
    { id: "default", name: "По умолчанию", premium: false, color: "bg-gradient-to-br from-blue-500 to-purple-600" },
    { id: "dark", name: "Тёмная", premium: false, color: "bg-gradient-to-br from-gray-800 to-gray-900" },
    { id: "light", name: "Светлая", premium: false, color: "bg-gradient-to-br from-white to-gray-100" },
    { id: "sunset", name: "Закат", premium: true, color: "bg-gradient-to-br from-orange-400 to-pink-500" }
  ];

  return (
    <div className="pb-20 min-h-screen bg-gray-50 overflow-x-hidden scrollbar-hide">
      {/* Профиль пользователя */}
      <div className="bg-white p-6 border-b">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gray-800 text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg">{user.name}</h2>
              <p className="text-gray-600 text-sm">{user.location}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Уведомления */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t.notifications}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4>{t.dailyReminders}</h4>
                <p className="text-sm text-gray-600">{t.dailyReminders}</p>
              </div>
              <Switch 
                checked={notifications.dailyReminder}
                onCheckedChange={(checked) => setNotifications(prev => ({...prev, dailyReminder: checked}))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4>{t.weeklyReports}</h4>
                <p className="text-sm text-gray-600">{t.weeklyReports}</p>
              </div>
              <Switch 
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) => setNotifications(prev => ({...prev, weeklyReport: checked}))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4>{t.newAchievements}</h4>
                <p className="text-sm text-gray-600">{t.newAchievements}</p>
              </div>
              <Switch 
                checked={notifications.achievements}
                onCheckedChange={(checked) => setNotifications(prev => ({...prev, achievements: checked}))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4>{t.motivationalMessages}</h4>
                <p className="text-sm text-gray-600">{t.motivationalMessages}</p>
              </div>
              <Switch 
                checked={notifications.motivational}
                onCheckedChange={(checked) => setNotifications(prev => ({...prev, motivational: checked}))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Темы оформления */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t.themes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {themes.map(theme => (
                <div key={theme.id} className="text-center">
                  <div 
                    className={`w-16 h-16 rounded-lg mx-auto mb-2 cursor-pointer hover:scale-105 transition-transform ${theme.color}`}
                  >
                    {theme.premium && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs">{theme.name}</p>
                  {theme.premium && <Badge variant="outline" className="text-xs mt-1">Премиум</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Безопасность и приватность */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t.security}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4>Биометрическая защита</h4>
                <p className="text-sm text-gray-600">Face ID / Touch ID</p>
              </div>
              <Switch 
                checked={privacy.biometric}
                onCheckedChange={(checked) => setPrivacy(prev => ({...prev, biometric: checked}))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4>Автоматическое резервирование</h4>
                <p className="text-sm text-gray-600">Облачное сохранение данных</p>
              </div>
              <Switch 
                checked={privacy.autoBackup}
                onCheckedChange={(checked) => setPrivacy(prev => ({...prev, autoBackup: checked}))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4>Аналитика использования</h4>
                <p className="text-sm text-gray-600">Помогает улучшить приложение</p>
              </div>
              <Switch 
                checked={privacy.analytics}
                onCheckedChange={(checked) => setPrivacy(prev => ({...prev, analytics: checked}))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Дополнительные настройки */}
      <div className="p-4">
        <Card>
          <CardContent className="pt-6 space-y-3">
            {/* Установка PWA */}
            {showInstallButton && (
              <div 
                onClick={handleInstallClick}
                className="flex items-center justify-between cursor-pointer hover:bg-gradient-to-r hover:from-accent/5 hover:to-accent/10 p-3 rounded-lg border-2 border-accent/20 bg-accent/5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Smartphone className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <span className="text-gray-900 block !font-semibold">Установить приложение</span>
                    <span className="text-xs text-gray-600">Добавить на главный экран</span>
                  </div>
                </div>
                <Download className="h-4 w-4 text-accent" />
              </div>
            )}
            
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Upload className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-900">{t.importData}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg"
              onClick={() => setShowLanguageModal(true)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Globe className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-900">{t.appLanguage}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.currentLanguage}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-900">{t.firstDayOfWeek}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.monday}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Panel Link - только для супер-админа */}
      {userData?.email === "diary@leadshunter.biz" && (
        <div className="p-4">
          <Card className="border-2 border-accent bg-accent/5">
            <CardContent className="pt-6">
              <div 
                onClick={() => {
                  window.location.href = '?view=admin';
                }}
                className="flex items-center justify-between cursor-pointer hover:bg-accent/10 p-3 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent rounded-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-gray-900 block !font-semibold">Панель администратора</span>
                    <span className="text-xs text-gray-600">Управление приложением</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Поддержка */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">{t.support}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-900">{t.contactSupport}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Star className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-900">{t.rateApp}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <HelpCircle className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-900">{t.faq}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Опасная зона */}
      <div className="p-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">{t.dangerousZone}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-red-50 p-3 rounded-lg transition-colors"
              onClick={onLogout}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <LogOut className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-red-600">{t.logout}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-red-400" />
            </div>
            
            <div className="cursor-pointer hover:bg-red-50 p-3 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-red-600">{t.deleteAllData}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Версия приложения */}
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500">{t.appVersion}</p>
        <p className="text-xs text-gray-400">{t.appSubtitle}</p>
      </div>

      {/* Модальное окно выбора языка */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t.changeLanguage}</h3>
              <div className="space-y-2">
                {isLoadingLanguages ? (
                  <div className="p-3 text-center text-gray-500">Загрузка языков...</div>
                ) : (
                  languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                        userData?.language === lang.code ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="flex-1 text-left">{lang.native_name}</span>
                      {userData?.language === lang.code && (
                        <span className="text-blue-600 text-sm">✓</span>
                      )}
                    </button>
                  ))
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}