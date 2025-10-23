/**
 * SettingsScreen - Support Section Component
 */

import { MessageCircle, Star, Bug, HelpCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { SettingsRow, SettingsSection } from "../SettingsRow";
import { showFeedbackWidget } from "@/shared/lib/monitoring/sentry";

interface SupportSectionProps {
  onSupportClick: () => void;
  onRateAppClick: () => void;
  onFAQClick: () => void;
  onPWAInstallClick: () => void;
  t: any;
}

export function SupportSection({
  onSupportClick,
  onRateAppClick,
  onFAQClick,
  onPWAInstallClick,
  t
}: SupportSectionProps) {
  return (
    <SettingsSection title={t.support || "Поддержка"}>
      <SettingsRow
        icon={MessageCircle}
        iconColor="text-[var(--ios-blue)]"
        iconBgColor="bg-[var(--ios-blue)]/10"
        title={t.contactSupport || "Связаться с поддержкой"}
        description="Напишите нам"
        onClick={onSupportClick}
      />
      <SettingsRow
        icon={Star}
        iconColor="text-[var(--ios-yellow)]"
        iconBgColor="bg-[var(--ios-yellow)]/10"
        title={t.rateApp || "Оценить приложение"}
        description="Поделитесь отзывом"
        onClick={onRateAppClick}
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
        onClick={onFAQClick}
      />
      <SettingsRow
        icon={Smartphone}
        iconColor="text-[var(--ios-purple)]"
        iconBgColor="bg-[var(--ios-purple)]/10"
        title={t.installPWA || "Установить приложение"}
        description="PWA на главный экран"
        onClick={onPWAInstallClick}
      />
    </SettingsSection>
  );
}

