import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

interface AdminLoginScreenProps {
  onComplete: (userData: any) => void;
  onBack: () => void;
}

export function AdminLoginScreen({ onComplete, onBack }: AdminLoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔐 [AdminLoginScreen] handleLogin called");

    if (!email || !password) {
      toast.error("Заполните все поля");
      return;
    }

    setIsLoading(true);
    console.log("🔐 [AdminLoginScreen] Starting login process...");

    try {
      const supabase = createClient();
      console.log("🔐 [AdminLoginScreen] Supabase client created");

      // Вход через Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        toast.error("Неверный email или пароль");
        setIsLoading(false);
        return;
      }

      if (!data.session) {
        toast.error("Не удалось войти в систему");
        setIsLoading(false);
        return;
      }

      console.log("🔐 [AdminLoginScreen] Session created, fetching profile from DB...");

      // Получаем профиль пользователя напрямую из БД (как PWA пользователи)
      // Это быстрее и надежнее чем через Edge Function
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        toast.error("Ошибка загрузки профиля");
        setIsLoading(false);
        return;
      }

      if (!profileData) {
        console.error("Profile not found for user:", data.user.id);
        toast.error("Профиль не найден");
        setIsLoading(false);
        return;
      }

      console.log("🔐 [AdminLoginScreen] Profile loaded:", profileData.email, "role:", profileData.role);

      // 🔒 SECURITY: Проверка роли - только super_admin может войти в админ-панель
      if (profileData.role !== 'super_admin') {
        toast.error("Доступ запрещен", {
          description: "У вас нет прав доступа к панели администратора"
        });
        // Выходим из системы
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      // Формируем userData в том же формате что и раньше
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: profileData.name,
        role: profileData.role,
        diaryData: {
          name: profileData.diary_name,
          emoji: profileData.diary_emoji
        },
        language: profileData.language,
        notificationSettings: profileData.notification_settings,
        createdAt: profileData.created_at,
        profile: {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role,
          diaryName: profileData.diary_name,
          diaryEmoji: profileData.diary_emoji,
          language: profileData.language,
          notificationSettings: profileData.notification_settings,
          onboardingCompleted: profileData.onboarding_completed,
          createdAt: profileData.created_at
        }
      };

      console.log("🔐 [AdminLoginScreen] Admin login successful:", userData.email, "role:", userData.role);
      toast.success("Вход выполнен успешно");

      // Вызываем onComplete для перехода к админ-панели
      console.log("🔐 [AdminLoginScreen] Calling onComplete...");
      onComplete(userData);
      console.log("🔐 [AdminLoginScreen] onComplete called");

    } catch (error) {
      console.error("Login error:", error);
      toast.error("Ошибка входа. Попробуйте снова.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="space-y-4 text-center pb-6">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="absolute top-6 left-6 w-10 h-10 rounded-full bg-muted hover:bg-accent/10 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>

            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-foreground">Панель администратора</CardTitle>
              <CardDescription>
                Вход только для супер-администратора
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-foreground">
                  Email
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-12"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-foreground">
                  Пароль
                </label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 pr-12"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-accent hover:bg-accent/90 text-white mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Вход...
                  </div>
                ) : (
                  "Войти"
                )}
              </Button>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div className="text-muted-foreground">
                    <p className="mb-1">Защищенный доступ</p>
                    <p>
                      Только для пользователей с ролью{" "}
                      <span className="text-foreground font-semibold">
                        super_admin
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-muted-foreground">
          <p>
            Нет доступа?{" "}
            <button
              onClick={onBack}
              className="text-accent hover:underline font-semibold"
            >
              Вернуться на главную
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
