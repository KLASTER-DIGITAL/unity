import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { projectId, publicAnonKey } from "@/utils/supabase/info";

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

    if (!email || !password) {
      toast.error("Заполните все поля");
      return;
    }

    // Проверка что email супер-админа
    if (email !== "diary@leadshunter.biz") {
      toast.error("У вас нет прав доступа к панели администратора");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Вход через Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        toast.error("Неверный email или пароль");
        return;
      }

      if (!data.session) {
        toast.error("Не удалось войти в систему");
        return;
      }

      // Получаем профиль пользователя
      let profileData;
      try {
        const profileResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-9729c493/profiles/${data.user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (profileResponse.ok) {
          const response = await profileResponse.json();
          if (response.success) {
            profileData = response;
          }
        }
      } catch (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      // Если профиль не найден, создаем профиль по умолчанию для супер-админа
      if (!profileData) {
        console.log("Creating default admin profile");
        profileData = {
          success: true,
          profile: {
            name: "Admin",
            role: "super_admin", // ✅ FIX: Add role
            diaryName: "Admin Diary",
            diaryEmoji: "🏆",
            language: "ru",
            notificationSettings: {
              selectedTime: "none",
              morningTime: "08:00",
              eveningTime: "21:00",
              permissionGranted: false
            },
            createdAt: new Date().toISOString()
          }
        };
      }

      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: profileData.profile.name,
        role: profileData.profile.role || 'super_admin', // ✅ FIX: Add role
        diaryData: {
          name: profileData.profile.diaryName,
          emoji: profileData.profile.diaryEmoji
        },
        language: profileData.profile.language,
        notificationSettings: profileData.profile.notificationSettings,
        createdAt: profileData.profile.createdAt,
        profile: {
          ...profileData.profile,
          role: profileData.profile.role || 'super_admin' // ✅ FIX: Add role to profile
        }
      };

      console.log("Admin login successful:", userData.email, "role:", userData.role);
      toast.success("Вход выполнен успешно");

      onComplete(userData);

    } catch (error) {
      console.error("Login error:", error);
      toast.error("Ошибка входа. Попробуйте снова.");
    } finally {
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
                  placeholder="diary@leadshunter.biz"
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
                      Только для пользователя с email{" "}
                      <span className="text-foreground font-semibold">
                        diary@leadshunter.biz
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
