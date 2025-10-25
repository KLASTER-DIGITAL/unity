import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/shared/components/ui/button";
import { Crown, Check, X } from "lucide-react";
import { toast } from "sonner";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
}

export function PremiumModal({ open, onClose }: PremiumModalProps) {
  const premiumFeatures = [
    {
      title: "Премиум-темы",
      description: "Закат, Океан, Лес - эксклюзивные цветовые схемы",
      icon: "🎨"
    },
    {
      title: "Автоматическое резервирование",
      description: "Облачное сохранение данных каждый день",
      icon: "☁️"
    },
    {
      title: "Расширенный экспорт",
      description: "Экспорт в JSON, CSV и ZIP форматах",
      icon: "📦"
    },
    {
      title: "Приоритетная поддержка",
      description: "Ответ на ваши вопросы в течение 24 часов",
      icon: "⚡"
    },
    {
      title: "Расширенная аналитика",
      description: "Детальные отчеты и графики прогресса",
      icon: "📊"
    },
    {
      title: "Без рекламы",
      description: "Никаких отвлекающих баннеров и объявлений",
      icon: "🚫"
    }
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-responsive-sm">
                <Crown className="h-6 w-6 text-yellow-500" />
                <h3 className="text-title-2 text-foreground">UNITY Premium</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <p className="text-footnote text-muted-foreground mb-6">Получите максимум от вашего дневника достижений</p>

            <div className="space-y-6">
              {/* Pricing */}
              <div className="bg-linear-to-br from-yellow-500/10 to-orange-500/10 p-modal rounded-lg border-2 border-yellow-500/20">
                <div className="text-center">
                  <div className="text-large-title text-foreground">
                    $4.99
                    <span className="text-headline text-muted-foreground">/месяц</span>
                  </div>
                  <p className="text-footnote text-muted-foreground mt-2">
                    или $49.99/год (экономия 17%)
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="text-headline text-foreground">Что входит в Premium:</h4>
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-responsive-sm">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-700 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-responsive-sm">
                        <span className="text-headline">{feature.icon}</span>
                        <h5 className="text-footnote font-semibold">{feature.title}</h5>
                      </div>
                      <p className="text-caption-1 text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="space-y-3 pt-4">
                <Button
                  className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
                  onClick={() => {
                    toast.info("Функция покупки Premium будет доступна в следующей версии");
                    onClose();
                  }}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Получить Premium
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClose}
                >
                  Может быть позже
                </Button>
              </div>

              {/* Footer */}
              <div className="text-center text-caption-1 text-muted-foreground pt-2 border-t border-border">
                <p>✨ 7 дней бесплатно для новых пользователей</p>
                <p className="mt-1">Отмена подписки в любое время</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

