import { Suspense, lazy } from "react";
import { Toaster } from "sonner";
import { TranslationProvider } from "@/shared/lib/i18n";
import { TranslationManager } from "@/shared/lib/i18n";
import { LoadingScreen } from "@/shared/components/LoadingScreen";

// Admin screens - lazy loading для оптимизации производительности
const AdminLoginScreen = lazy(() => import("@/features/admin/auth").then(module => ({ default: module.AdminLoginScreen })));
const AdminDashboard = lazy(() => import("@/features/admin/dashboard").then(module => ({ default: module.AdminDashboard })));

interface AdminAppProps {
  userData: any;
  showAdminAuth: boolean;
  onAuthComplete: (userData: any) => void;
  onLogout: () => void;
  onBack: () => void;
}

export function AdminApp({
  userData,
  showAdminAuth,
  onAuthComplete,
  onLogout,
  onBack,
}: AdminAppProps) {
  // Show admin login if not authenticated
  if (showAdminAuth) {
    return (
      <TranslationProvider defaultLanguage="ru" fallbackLanguage="ru">
        <TranslationManager preloadLanguages={['en']}>
          <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<LoadingScreen />}>
              <AdminLoginScreen
                onComplete={onAuthComplete}
                onBack={onBack}
              />
            </Suspense>
            <Toaster position="top-center" />
          </div>
        </TranslationManager>
      </TranslationProvider>
    );
  }

  // Main admin dashboard
  return (
    <TranslationProvider defaultLanguage="ru" fallbackLanguage="ru">
      <TranslationManager preloadLanguages={['en']}>
        <div className="min-h-screen bg-gray-50">
          <Suspense fallback={<LoadingScreen />}>
            <AdminDashboard
              userData={userData}
              onLogout={onLogout}
            />
          </Suspense>
          <Toaster position="top-center" />
        </div>
      </TranslationManager>
    </TranslationProvider>
  );
}

