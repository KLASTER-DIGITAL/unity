import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Smartphone, Monitor, Chrome, Apple } from "lucide-react";

interface PWAInstallModalProps {
  open: boolean;
  onClose: () => void;
}

export function PWAInstallModal({ open, onClose }: PWAInstallModalProps) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isDesktop = !isIOS && !isAndroid;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Установить приложение
          </DialogTitle>
          <DialogDescription>
            Установите UNITY на ваше устройство для быстрого доступа
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isIOS && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Apple className="h-5 w-5" />
                <h3 className="font-semibold">iOS Safari</h3>
              </div>
              <ol className="space-y-2 text-sm text-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Нажмите кнопку <strong>"Поделиться"</strong> (квадрат со стрелкой вверх) внизу экрана</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Прокрутите вниз и выберите <strong>"На экран Домой"</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Нажмите <strong>"Добавить"</strong> в правом верхнем углу</span>
                </li>
              </ol>
              <div className="bg-primary/10 p-3 rounded-lg text-sm text-primary">
                💡 После установки приложение появится на главном экране
              </div>
            </div>
          )}

          {isAndroid && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Chrome className="h-5 w-5" />
                <h3 className="font-semibold">Android Chrome</h3>
              </div>
              <ol className="space-y-2 text-sm text-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Нажмите кнопку <strong>меню</strong> (три точки) в правом верхнем углу</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Выберите <strong>"Установить приложение"</strong> или <strong>"Добавить на главный экран"</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Нажмите <strong>"Установить"</strong> в появившемся окне</span>
                </li>
              </ol>
              <div className="bg-green-500/10 p-3 rounded-lg text-sm text-green-700 dark:text-green-400">
                💡 Приложение будет работать как обычное Android приложение
              </div>
            </div>
          )}

          {isDesktop && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Monitor className="h-5 w-5" />
                <h3 className="font-semibold">Desktop</h3>
              </div>
              <ol className="space-y-2 text-sm text-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Найдите иконку <strong>"Установить"</strong> в адресной строке браузера</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Нажмите на иконку и выберите <strong>"Установить"</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Приложение откроется в отдельном окне</span>
                </li>
              </ol>
              <div className="bg-purple-500/10 p-3 rounded-lg text-sm text-purple-700 dark:text-purple-400">
                💡 Вы можете закрепить приложение на панели задач
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <h4 className="font-semibold text-sm mb-2">Преимущества установки:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✅ Быстрый доступ с главного экрана</li>
              <li>✅ Работает офлайн</li>
              <li>✅ Полноэкранный режим</li>
              <li>✅ Уведомления о новых достижениях</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Позже
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

