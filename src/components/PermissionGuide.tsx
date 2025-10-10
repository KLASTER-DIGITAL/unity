import { motion, AnimatePresence } from "motion/react";
import { Mic, Camera, AlertCircle, X } from "lucide-react";

interface PermissionGuideProps {
  type: 'microphone' | 'camera';
  isOpen: boolean;
  onClose: () => void;
}

export function PermissionGuide({ type, isOpen, onClose }: PermissionGuideProps) {
  const isMicrophone = type === 'microphone';
  const Icon = isMicrophone ? Mic : Camera;
  const title = isMicrophone ? 'Доступ к микрофону' : 'Доступ к камере';
  const description = isMicrophone 
    ? 'Для записи голосовых сообщений необходимо разрешить доступ к микрофону'
    : 'Для загрузки фото и видео необходимо разрешить доступ к камере';
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 pb-24 scrollbar-hide"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-[20px] p-6 max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-accent" />
          </div>

          {/* Title */}
          <h3 className="text-center mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-center text-muted-foreground mb-6">
            {description}
          </p>

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="!text-[13px] text-accent !font-semibold">1</span>
              </div>
              <div className="flex-1">
                <p className="!text-[14px] !font-normal text-foreground">
                  Найдите иконку {isMicrophone ? '🎤' : '📷'} в адресной строке браузера
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="!text-[13px] text-accent !font-semibold">2</span>
              </div>
              <div className="flex-1">
                <p className="!text-[14px] !font-normal text-foreground">
                  Нажмите на неё и выберите <strong>"Разрешить"</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="!text-[13px] text-accent !font-semibold">3</span>
              </div>
              <div className="flex-1">
                <p className="!text-[14px] !font-normal text-foreground">
                  Обновите страницу и попробуйте снова
                </p>
              </div>
            </div>
          </div>

          {/* Browser-specific hints */}
          <div className="bg-gray-50 rounded-[12px] p-4 mb-4">
            <p className="!text-[12px] !font-semibold text-gray-700 mb-2">
              💡 Подсказка:
            </p>
            <p className="!text-[12px] !font-normal text-gray-600">
              В Chrome и Safari иконка разрешений находится слева от адреса сайта. 
              В Firefox - справа от адресной строки.
            </p>
          </div>

          {/* Note */}
          <div className="bg-blue-50 border border-blue-100 rounded-[12px] p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="!text-[13px] !font-normal text-accent">
                Ваши данные в безопасности. Мы используем {isMicrophone ? 'микрофон' : 'камеру'} только для указанных функций и не храним записи на серверах.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full bg-accent text-white py-3 rounded-[12px] hover:bg-accent/90 transition-colors"
          >
            Понятно
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
