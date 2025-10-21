import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";
import { useTranslation } from "@/shared/lib/i18n";
import { updateUserProfile } from "@/shared/lib/api";
import { SettingsRow, SettingsSection } from "./SettingsRow";
import { Switch } from "@/shared/components/ui/switch";
import { ThemeToggle } from "@/shared/components/ui/ThemeToggle";
import { PremiumModal } from "./PremiumModal";
import { ProfileEditModal } from "./ProfileEditModal";
import { showFeedbackWidget } from "@/shared/lib/monitoring/sentry";

// Дефолтное фото для аватара
const DEFAULT_AVATAR_URL = 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png';
import {
  Bell,
  Star,
  Lock,
  Shield,
  Globe,
  HelpCircle,
  MessageCircle,
  LogOut,
  Edit2,
  User,
  Phone,
  Mail,
  Palette,
  Calendar,
  Download,
  Upload,
  Trash2,
  Smartphone,
  Crown,
  X,
  Bug
} from "lucide-react";

interface SettingsScreenProps {
  userData?: any;
  onLogout?: () => void;
  onProfileUpdate?: (updatedProfile: any) => void;
}

export function SettingsScreen({ userData, onLogout, onProfileUpdate }: SettingsScreenProps) {
  // Extract profile from userData (userData = { success, user, profile })
  const initialProfile = userData?.profile || userData;

  // Local state for profile (to update in real-time)
  const [profile, setProfile] = useState(initialProfile);

  const { t, changeLanguage } = useTranslation();

  // State для уведомлений
  const [notifications, setNotifications] = useState({
    dailyReminder: profile?.notificationSettings?.dailyReminder || false,
    weeklyReport: profile?.notificationSettings?.weeklyReport || false,
    achievements: profile?.notificationSettings?.achievements || false,
    motivational: profile?.notificationSettings?.motivational || false,
  });

  // State для настроек безопасности
  const [biometricEnabled, setBiometricEnabled] = useState(profile?.biometricEnabled || false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(profile?.backupEnabled || false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // State для модальных окон (Drawer - Bottom Sheets)
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showRateApp, setShowRateApp] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  // Динамическая загрузка языков из API
  const [languages, setLanguages] = useState([
    { code: 'ru', name: 'Russian', native_name: 'Русский', flag: '🇷🇺', is_active: true },
    { code: 'en', name: 'English', native_name: 'English', flag: '🇺🇸', is_active: true },
    { code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸', is_active: true },
    { code: 'de', name: 'German', native_name: 'Deutsch', flag: '🇩🇪', is_active: true },
    { code: 'fr', name: 'French', native_name: 'Français', flag: '🇫🇷', is_active: true },
    { code: 'zh', name: 'Chinese', native_name: '中文', flag: '🇨🇳', is_active: true },
    { code: 'ja', name: 'Japanese', native_name: '日本語', flag: '🇯🇵', is_active: true },
  ]);

  // Загрузка языков из API при монтировании
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-api/languages`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          }
        });
        if (response.ok) {
          const data = await response.json();
          const loadedLanguages = Array.isArray(data) ? data : (data.languages || []);
          // Фильтруем только активные языки
          const activeLanguages = loadedLanguages.filter((lang: any) => lang.is_active || lang.enabled);
          if (activeLanguages.length > 0) {
            setLanguages(activeLanguages);
            console.log('✅ Loaded languages from API:', activeLanguages.length);
          }
        }
      } catch (error) {
        console.error('Error loading languages:', error);
        // Используем fallback языки при ошибке
      }
    };

    loadLanguages();
  }, []);

  // Проверка поддержки WebAuthn для биометрии
  useEffect(() => {
    const checkBiometric = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvailable(available);
        } catch (error) {
          setBiometricAvailable(false);
        }
      }
    };
    checkBiometric();
  }, []);



  // Синхронизация локального профиля с userData
  useEffect(() => {
    const newProfile = userData?.profile || userData;
    if (newProfile && newProfile.id !== profile?.id) {
      console.log('🔄 [SettingsScreen] Syncing profile from userData:', newProfile);
      setProfile(newProfile);
    }
  }, [userData]);

  // Синхронизация state с userData при изменении профиля
  useEffect(() => {
    if (profile?.notificationSettings) {
      setNotifications({
        dailyReminder: profile.notificationSettings.dailyReminder || false,
        weeklyReport: profile.notificationSettings.weeklyReport || false,
        achievements: profile.notificationSettings.achievements || false,
        motivational: profile.notificationSettings.motivational || false,
      });
    }
    if (profile?.biometricEnabled !== undefined) {
      setBiometricEnabled(profile.biometricEnabled);
    }
    if (profile?.backupEnabled !== undefined) {
      setAutoBackupEnabled(profile.backupEnabled);
    }
  }, [profile?.id]); // Обновляем только при смене пользователя

  // Автосохранение уведомлений
  useEffect(() => {
    const saveNotifications = async () => {
      const userId = profile?.id;
      if (!userId) return;

      try {
        await updateUserProfile(userId, {
          notificationSettings: {
            ...profile.notificationSettings,
            ...notifications
          }
        });
        console.log('✅ Notifications saved:', notifications);
      } catch (error) {
        console.error('❌ Error saving notifications:', error);
      }
    };

    const timeoutId = setTimeout(saveNotifications, 1000);
    return () => clearTimeout(timeoutId);
  }, [notifications, profile?.id]);

  // Автосохранение настроек безопасности
  useEffect(() => {
    const saveSecurity = async () => {
      const userId = profile?.id;
      if (!userId) return;

      try {
        await updateUserProfile(userId, {
          biometricEnabled: biometricEnabled,
          backupEnabled: autoBackupEnabled
        });
        console.log('✅ Security settings saved');
      } catch (error) {
        console.error('❌ Error saving security settings:', error);
      }
    };

    const timeoutId = setTimeout(saveSecurity, 1000);
    return () => clearTimeout(timeoutId);
  }, [biometricEnabled, autoBackupEnabled, profile?.id]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };



  // Обработчик смены языка
  const handleLanguageChange = async (languageCode: string) => {
    try {
      const userId = profile?.id;
      if (userId) {
        // Сохраняем язык в базу данных
        await updateUserProfile(userId, { language: languageCode });
        console.log(`✅ Language "${languageCode}" saved to DB`);

        // Обновляем локальный профиль
        setProfile((prev: any) => ({ ...prev, language: languageCode }));

        // Вызываем onProfileUpdate если передан
        if (onProfileUpdate) {
          onProfileUpdate({ ...profile, language: languageCode });
        }
      }

      // Переключаем язык в i18n системе
      await changeLanguage(languageCode);

      toast.success(t('languageChanged', 'Язык изменен!'));
      setShowLanguage(false);
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error(t('languageChangeError', 'Ошибка при изменении языка'));
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header - User Name */}
      <div className="bg-card border-b border-border pt-12 pb-6 transition-colors duration-300">
        <h1 className="text-center text-lg font-semibold text-foreground">
          {profile?.name || 'Мой аккаунт'}
        </h1>
      </div>

      {/* Profile Section */}
      <div className="bg-card px-6 py-8 border-b border-border transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-primary/10">
              <AvatarImage src={profile?.avatar || DEFAULT_AVATAR_URL} alt={profile?.name} />
              <AvatarFallback className="bg-muted">
                <img src={DEFAULT_AVATAR_URL} alt="Default avatar" className="h-full w-full object-cover" />
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setShowEditProfile(true)}
              className="absolute bottom-0 right-0 p-2 bg-card rounded-full shadow-lg border border-border hover:bg-muted transition-colors"
              aria-label="Edit profile"
            >
              <Edit2 className="h-5 w-5 text-foreground" strokeWidth={2} />
            </button>
          </div>

          {/* User Info */}
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {profile?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Уведомления */}
      <SettingsSection title={t.notifications || "Уведомления"}>
        <SettingsRow
          icon={Bell}
          iconColor="text-[var(--ios-blue)]"
          iconBgColor="bg-[var(--ios-blue)]/10"
          title={t.dailyReminders || "Ежедневные напоминания"}
          description="Напоминания о записях"
          rightElement="switch"
          switchChecked={notifications.dailyReminder}
          onSwitchChange={(checked) => setNotifications(prev => ({...prev, dailyReminder: checked}))}
        />
        <SettingsRow
          icon={Calendar}
          iconColor="text-[var(--ios-purple)]"
          iconBgColor="bg-[var(--ios-purple)]/10"
          title={t.weeklyReports || "Еженедельные отчеты"}
          description="Статистика за неделю"
          rightElement="switch"
          switchChecked={notifications.weeklyReport}
          onSwitchChange={(checked) => setNotifications(prev => ({...prev, weeklyReport: checked}))}
        />
        <SettingsRow
          icon={Star}
          iconColor="text-[var(--ios-green)]"
          iconBgColor="bg-[var(--ios-green)]/10"
          title={t.newAchievements || "Новые достижения"}
          description="Уведомления о наградах"
          rightElement="switch"
          switchChecked={notifications.achievements}
          onSwitchChange={(checked) => setNotifications(prev => ({...prev, achievements: checked}))}
        />
        <SettingsRow
          icon={Crown}
          iconColor="text-[var(--ios-orange)]"
          iconBgColor="bg-[var(--ios-orange)]/10"
          title={t.motivationalMessages || "Мотивационные сообщения"}
          description="Мотивационные карточки"
          rightElement="switch"
          switchChecked={notifications.motivational}
          onSwitchChange={(checked) => setNotifications(prev => ({...prev, motivational: checked}))}
        />
      </SettingsSection>

      {/* Темы оформления - shadcn/ui стандарт */}
      <SettingsSection title={t.themes || "Темы оформления"}>
        <SettingsRow
          icon={Palette}
          iconColor="text-[var(--ios-purple)]"
          iconBgColor="bg-[var(--ios-purple)]/10"
          title={t.appearance || "Внешний вид"}
          description={t.appearanceDescription || "Переключение темы"}
          rightElement="custom"
          customRightElement={<ThemeToggle />}
        />
      </SettingsSection>

      {/* Безопасность и приватность */}
      <SettingsSection title={t.security || "Безопасность"}>
        <SettingsRow
          icon={Lock}
          iconColor="text-[var(--ios-blue)]"
          iconBgColor="bg-[var(--ios-blue)]/10"
          title={t.biometricProtection || "Биометрическая защита"}
          description={biometricAvailable ? "Доступно" : "Недоступно в браузере"}
          rightElement="switch"
          switchChecked={biometricEnabled}
          onSwitchChange={setBiometricEnabled}
          disabled={!biometricAvailable}
        />
        <SettingsRow
          icon={Shield}
          iconColor="text-[var(--ios-green)]"
          iconBgColor="bg-[var(--ios-green)]/10"
          title={t.autoBackup || "Автоматическое резервирование"}
          description={userData?.isPremium ? "Премиум функция" : "Требуется премиум"}
          rightElement="switch"
          switchChecked={autoBackupEnabled}
          onSwitchChange={(checked) => {
            if (!userData?.isPremium && checked) {
              setShowPremium(true);
            } else {
              setAutoBackupEnabled(checked);
            }
          }}
          onClick={() => {
            if (!userData?.isPremium) {
              setShowPremium(true);
            }
          }}
          disabled={!userData?.isPremium}
        />
      </SettingsSection>

      {/* Дополнительно */}
      <SettingsSection title={t.additional || "Дополнительно"}>
        <SettingsRow
          icon={Globe}
          iconColor="text-[var(--ios-indigo)]"
          iconBgColor="bg-[var(--ios-indigo)]/10"
          title={t.language || "Язык"}
          description={languages.find(l => l.code === profile?.language)?.native_name || 'Русский'}
          onClick={() => setShowLanguage(true)}
        />
        <SettingsRow
          icon={Calendar}
          iconColor="text-[var(--ios-blue)]"
          iconBgColor="bg-[var(--ios-blue)]/10"
          title={t.firstDayOfWeek || "Первый день недели"}
          description={userData?.firstDayOfWeek === 'monday' ? 'Понедельник' : 'Воскресенье'}
          onClick={() => toast.info('Feature coming soon')}
        />
        <SettingsRow
          icon={Download}
          iconColor="text-[var(--ios-green)]"
          iconBgColor="bg-[var(--ios-green)]/10"
          title={t.exportData || "Экспортировать данные"}
          description="JSON, CSV, ZIP"
          onClick={() => toast.info('Feature coming soon')}
        />
        <SettingsRow
          icon={Upload}
          iconColor="text-[var(--ios-purple)]"
          iconBgColor="bg-[var(--ios-purple)]/10"
          title={t.importData || "Импортировать данные"}
          description="Восстановить из файла"
          onClick={() => toast.info('Feature coming soon')}
        />
        <SettingsRow
          icon={Trash2}
          iconColor="text-[var(--ios-red)]"
          iconBgColor="bg-[var(--ios-red)]/10"
          title={t.deleteAllData || "Удалить все данные"}
          description="Необратимое действие"
          onClick={() => toast.error('Требуется подтверждение')}
        />
      </SettingsSection>

      {/* Поддержка */}
      <SettingsSection title={t.support || "Поддержка"}>
        <SettingsRow
          icon={MessageCircle}
          iconColor="text-[var(--ios-blue)]"
          iconBgColor="bg-[var(--ios-blue)]/10"
          title={t.contactSupport || "Связаться с поддержкой"}
          description="Напишите нам"
          onClick={() => setShowSupport(true)}
        />
        <SettingsRow
          icon={Star}
          iconColor="text-[var(--ios-yellow)]"
          iconBgColor="bg-[var(--ios-yellow)]/10"
          title={t.rateApp || "Оценить приложение"}
          description="Поделитесь отзывом"
          onClick={() => setShowRateApp(true)}
        />
        <SettingsRow
          icon={Bug}
          iconColor="text-[var(--ios-red)]"
          iconBgColor="bg-[var(--ios-red)]/10"
          title="Сообщить об ошибке"
          description="Помогите улучшить приложение"
          onClick={() => {
            try {
              // Открываем форму сразу в раскрытом состоянии
              showFeedbackWidget(true);
            } catch (error) {
              console.error('Failed to show feedback widget:', error);
              toast.error('Не удалось открыть форму обратной связи');
            }
          }}
        />
        <SettingsRow
          icon={HelpCircle}
          iconColor="text-[var(--ios-green)]"
          iconBgColor="bg-[var(--ios-green)]/10"
          title={t.faq || "FAQ"}
          description="Часто задаваемые вопросы"
          onClick={() => setShowFAQ(true)}
        />
        <SettingsRow
          icon={Smartphone}
          iconColor="text-[var(--ios-purple)]"
          iconBgColor="bg-[var(--ios-purple)]/10"
          title={t.installPWA || "Установить приложение"}
          description="PWA на главный экран"
          onClick={() => setShowPWAInstall(true)}
        />
      </SettingsSection>

      {/* Logout Button */}
      <div className="px-4 pt-6 pb-8">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-14 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-medium"
        >
          <LogOut className="h-5 w-5 mr-2" strokeWidth={2} />
          {t.logout || "Выйти"}
        </Button>
      </div>



      {/* FAQ Modal */}
      <AnimatePresence>
        {showFAQ && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFAQ(false)}
              className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-title-3 text-foreground">{t.faq || "FAQ"}</h3>
                <button
                  onClick={() => setShowFAQ(false)}
                  className="p-1 hover:bg-accent/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <p className="text-footnote text-muted-foreground mb-4">Часто задаваемые вопросы</p>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Как создать запись в дневнике?</AccordionTrigger>
                  <AccordionContent>
                    Нажмите кнопку "+" на главном экране, опишите ваше достижение или неудачу, и AI автоматически проанализирует запись.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Как работает AI-анализ?</AccordionTrigger>
                  <AccordionContent>
                    AI анализирует вашу запись, определяет тип события (достижение/неудача), эмоциональный тон и создает мотивационную карточку с советами.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Что такое мотивационные карточки?</AccordionTrigger>
                  <AccordionContent>
                    Это персонализированные сообщения от AI, которые помогают вам развивать полезные привычки на основе ваших записей.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Как получить премиум-доступ?</AccordionTrigger>
                  <AccordionContent>
                    Премиум-функции включают дополнительные темы, автоматическое резервирование и расширенную аналитику. Свяжитесь с поддержкой для подключения.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Как экспортировать данные?</AccordionTrigger>
                  <AccordionContent>
                    Перейдите в Настройки → Дополнительно → Экспортировать данные. Доступны форматы JSON, CSV и ZIP.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Contact Support Modal */}
      <AnimatePresence>
        {showSupport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupport(false)}
              className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-title-3 text-foreground">{t.contactSupport || "Связаться с поддержкой"}</h3>
                <button
                  onClick={() => setShowSupport(false)}
                  className="p-1 hover:bg-accent/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <p className="text-footnote text-muted-foreground mb-4">Напишите нам, и мы ответим в течение 24 часов</p>

              <div className="space-y-4">
                <div>
                  <label className="text-footnote font-medium text-foreground mb-1 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <label className="text-footnote font-medium text-foreground mb-1 block">
                    Тема обращения
                  </label>
                  <Input
                    type="text"
                    placeholder="Например: Проблема с AI-анализом"
                  />
                </div>
                <div>
                  <label className="text-footnote font-medium text-foreground mb-1 block">
                    Сообщение
                  </label>
                  <Textarea
                    placeholder="Опишите вашу проблему или вопрос..."
                    rows={6}
                  />
                </div>
                <Button
                  onClick={() => {
                    toast.success("Сообщение отправлено! Мы ответим в течение 24 часов.");
                    setShowSupport(false);
                  }}
                  className="w-full"
                >
                  Отправить
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Rate App Modal */}
      <AnimatePresence>
        {showRateApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRateApp(false)}
              className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-title-3 text-foreground">Оценить приложение</h3>
                <button
                  onClick={() => setShowRateApp(false)}
                  className="p-1 hover:bg-accent/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <p className="text-footnote text-muted-foreground mb-6">Ваше мнение помогает нам стать лучше</p>

              <div className="space-y-6">
                {/* Star Rating */}
                <div className="space-y-3">
                  <label className="text-footnote font-medium text-foreground">Ваша оценка</label>
                  <div className="flex gap-responsive-sm justify-center py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="transition-transform hover:scale-110"
                      >
                        <Star className="h-10 w-10 fill-yellow-400 text-yellow-400" />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-footnote text-muted-foreground">Отлично! 🎉</p>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="text-footnote font-medium text-foreground">Комментарий (необязательно)</label>
                  <Textarea
                    placeholder="Расскажите, что вам понравилось или что можно улучшить..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={() => {
                    toast.success("Спасибо за вашу оценку! ⭐");
                    setShowRateApp(false);
                  }}
                  className="w-full"
                >
                  Отправить отзыв
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLanguage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguage(false)}
              className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-title-3 text-foreground">{t.language || "Выбрать язык"}</h3>
                <button
                  onClick={() => setShowLanguage(false)}
                  className="p-1 hover:bg-accent/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <p className="text-footnote text-muted-foreground mb-4">Выберите язык интерфейса приложения</p>

              <div className="space-y-2">
                {languages.map(language => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      profile?.language === language.code
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-card border border-border hover:bg-accent/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{language.flag}</span>
                      <div className="text-left">
                        <p className="font-medium text-foreground">{language.native_name}</p>
                        <p className="text-sm text-muted-foreground">{language.name}</p>
                      </div>
                    </div>
                    {profile?.language === language.code && (
                      <div className="p-1.5 bg-primary rounded-full">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PWA Install Modal */}
      <AnimatePresence>
        {showPWAInstall && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPWAInstall(false)}
              className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-title-3 text-foreground">{t.installPWA || "Установить приложение"}</h3>
                <button
                  onClick={() => setShowPWAInstall(false)}
                  className="p-1 hover:bg-accent/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <p className="text-footnote text-muted-foreground mb-4">Добавьте UNITY на главный экран</p>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-headline text-blue-900 mb-2">iOS (Safari)</h4>
                  <ol className="list-decimal list-inside space-y-1 text-footnote text-blue-800">
                    <li>Нажмите кнопку "Поделиться" внизу экрана</li>
                    <li>Выберите "На экран Домой"</li>
                    <li>Нажмите "Добавить"</li>
                  </ol>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-headline text-green-900 mb-2">Android (Chrome)</h4>
                  <ol className="list-decimal list-inside space-y-1 text-footnote text-green-800">
                    <li>Нажмите меню (три точки) в правом верхнем углу</li>
                    <li>Выберите "Установить приложение"</li>
                    <li>Нажмите "Установить"</li>
                  </ol>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Преимущества PWA</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-purple-800">
                    <li>Работает офлайн</li>
                    <li>Быстрая загрузка</li>
                    <li>Иконка на главном экране</li>
                    <li>Полноэкранный режим</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Premium Modal */}
      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        profile={{
          id: profile?.id || '',
          name: profile?.name || '',
          email: profile?.email || '',
          avatar: profile?.avatar || '',
        }}
        onProfileUpdated={(updatedProfile) => {
          console.log('✅ Profile updated in SettingsScreen:', updatedProfile);
          // Update local state immediately for real-time display
          setProfile(updatedProfile);
          // Update global state in App.tsx
          if (onProfileUpdate) {
            onProfileUpdate(updatedProfile);
          }
        }}
      />
    </div>
  );
}

