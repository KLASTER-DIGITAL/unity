import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import { isPWAInstalled, isIOSSafari, getInstallInstructions } from "../../utils/pwaUtils";
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

interface SettingsScreenProps {
  userData?: any;
  onLogout?: () => void;
}

export function SettingsScreen({ userData, onLogout }: SettingsScreenProps) {
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

  // Проверяем возможность установки PWA
  useEffect(() => {
    // Показываем кнопку только если приложение не установлено
    const installed = isPWAInstalled();
    console.log('PWA installed:', installed);
    
    if (!installed) {
      setShowInstallButton(true);
      console.log('✅ Showing install button in settings');
    } else {
      console.log('ℹ️ PWA already installed - hiding install button');
    }

    // Слушаем событие установки
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

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('No deferredPrompt available, showing instructions');
      
      // Получаем инструкции для текущего браузера
      const instructions = getInstallInstructions();
      
      // На iOS Safari показываем специальные инструкции
      if (isIOSSafari()) {
        toast.info(
          <div className="space-y-2">
            <p className="!text-[15px]">Для установки на iOS:</p>
            <ol className="list-decimal pl-4 space-y-1">
              {instructions.steps.map((step, i) => (
                <li key={i} className="!text-[13px] !font-normal">{step}</li>
              ))}
            </ol>
          </div>,
          { duration: 10000 }
        );
      } else {
        // Для других браузеров
        toast.info(
          <div className="space-y-2">
            <p className="!text-[15px]">Инструкция по установке ({instructions.platform}):</p>
            <ol className="list-decimal pl-4 space-y-1">
              {instructions.steps.map((step, i) => (
                <li key={i} className="!text-[13px] !font-normal">{step}</li>
              ))}
            </ol>
          </div>,
          { duration: 10000 }
        );
      }
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
      toast.error('Ошибка при установке. Попробуйте еще раз.');
    }
  };

  const user = {
    name: userData?.name || "Пользователь",
    email: userData?.email || "email@example.com",
    avatar: "",
    isPremium: false,
    joinedDate: userData?.createdAt 
      ? new Intl.DateTimeFormat('ru', { month: 'long', year: 'numeric' }).format(new Date(userData.createdAt))
      : "Недавно"
  };

  const themes = [
    { id: "light", name: "Светлая", premium: false, color: "bg-white border-2 border-gray-200" },
    { id: "dark", name: "Тёмная", premium: false, color: "bg-gray-900 border-2 border-gray-700" },
    { id: "purple", name: "Фиолетовая", premium: true, color: "bg-gradient-to-br from-purple-400 to-purple-600" },
    { id: "ocean", name: "Океан", premium: true, color: "bg-gradient-to-br from-blue-400 to-teal-500" },
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
              <p className="text-gray-600 text-sm">Москва, Россия</p>
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
              Уведомления
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4>Ежедневные напоминания</h4>
                <p className="text-sm text-gray-600">Напоминание записать достижение</p>
              </div>
              <Switch 
                checked={notifications.dailyReminder}
                onCheckedChange={(checked) => setNotifications(prev => ({...prev, dailyReminder: checked}))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4>Еженедельные отчёты</h4>
                <p className="text-sm text-gray-600">Сводка достижений за неделю</p>
              </div>
              <Switch 
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) => setNotifications(prev => ({...prev, weeklyReport: checked}))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4>Новые достижения</h4>
                <p className="text-sm text-gray-600">Уведомления о наградах</p>
              </div>
              <Switch 
                checked={notifications.achievements}
                onCheckedChange={(checked) => setNotifications(prev => ({...prev, achievements: checked}))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4>Мотивационные сообщения</h4>
                <p className="text-sm text-gray-600">Вдохновляющие цитаты</p>
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
              Темы оформления
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
              Безопасность и приватность
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
                <span className="text-gray-900">Импорт данных</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Globe className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-900">Язык приложения</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Русский</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-900">Первый день недели</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Понедельник</span>
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
            <CardTitle className="text-gray-900">Поддержка</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-900">Связаться с поддержкой</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Star className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-900">Оценить приложение</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <HelpCircle className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-900">Часто задаваемые вопросы</span>
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
            <CardTitle className="text-red-600">Опасная зона</CardTitle>
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
                <span className="text-red-600">Выйти</span>
              </div>
              <ChevronRight className="h-4 w-4 text-red-400" />
            </div>
            
            <div className="cursor-pointer hover:bg-red-50 p-3 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-red-600">Удалить все данные</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Версия приложения */}
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500">Дневник Достижений v1.0.0</p>
        <p className="text-xs text-gray-400">Твоя история успеха начинается здесь</p>
      </div>
    </div>
  );
}