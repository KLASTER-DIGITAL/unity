import { Toaster } from "sonner";
import { TranslationProvider } from "@/shared/lib/i18n";
import { TranslationManager } from "@/shared/lib/i18n";

// Admin screens - using feature flags
import { AdminLoginScreen } from "@/features/admin/auth";
import { AdminDashboard } from "@/features/admin/dashboard";

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
            <AdminLoginScreen 
              onComplete={onAuthComplete}
              onBack={onBack}
            />
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
          <AdminDashboard 
            userData={userData} 
            onLogout={onLogout}
          />
          <Toaster position="top-center" />
        </div>
      </TranslationManager>
    </TranslationProvider>
  );
}

