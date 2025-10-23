/**
 * SettingsScreen - PWA Install Modal Component
 */

import { motion } from "motion/react";
import { X } from "lucide-react";

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

export function PWAInstallModal({ isOpen, onClose, t }: PWAInstallModalProps) {
  if (!isOpen) return null;

  return (
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
          <h3 className="text-title-3 text-foreground">{t.installPWA || "Установить приложение"}</h3>
          <button
            onClick={onClose}
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
  );
}

