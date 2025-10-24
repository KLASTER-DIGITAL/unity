import { toast } from "sonner";
import { triggerHapticFeedback } from "./PermissionUtils";

interface MediaUploadParams {
  userId: string;
  selectAndUploadMedia: (userId: string) => Promise<void>;
  uploadedMedia: any[];
}

/**
 * Handle media upload
 */
export async function handleMediaUpload({
  userId,
  selectAndUploadMedia,
  uploadedMedia
}: MediaUploadParams) {
  if (!userId || userId === 'anonymous') {
    toast.error("Необходимо авторизоваться", {
      description: "Войдите в аккаунт для загрузки медиа"
    });
    return;
  }

  try {
    await selectAndUploadMedia(userId);
    
    if (uploadedMedia.length > 0) {
      toast.success("Медиа загружено!");

      // Haptic feedback
      triggerHapticFeedback(50);
    }
  } catch (error: any) {
    console.error('Media upload error:', error);
    
    const errorMessage = error.message || 'Неизвестная ошибка';
    
    // Показываем понятное сообщение
    if (errorMessage.includes('Файл слишком большой')) {
      toast.error("Файл слишком большой", {
        description: "Максимальный размер файла - 10 MB",
        duration: 5000
      });
    } else if (errorMessage.includes('Неподдерживаемый формат')) {
      toast.error("Неподдерживаемый формат", {
        description: "Поддерживаются только изображения и видео",
        duration: 5000
      });
    } else if (errorMessage.includes('Failed to load image') || errorMessage.includes('Не удалось загрузить')) {
      toast.error("Ошибка загрузки изображения", {
        description: "Файл может быть поврежден. Попробуйте другой файл.",
        duration: 5000
      });
    } else {
      toast.error("Ошибка загрузки", {
        description: errorMessage,
        duration: 5000
      });
    }
  }
}

interface FilesDroppedParams {
  userId: string;
  files: File[];
}

/**
 * Handle drag & drop files
 */
export async function handleFilesDropped({
  userId,
  files
}: FilesDroppedParams) {
  if (!userId || userId === 'anonymous') {
    toast.error("Необходимо авторизоваться", {
      description: "Войдите в аккаунт для загрузки медиа"
    });
    return;
  }

  try {
    // TODO: Implement batch upload for drag & drop
    toast.info("Drag & drop загрузка в разработке");

    // Haptic feedback
    triggerHapticFeedback(50);
  } catch (error: any) {
    console.error('Drag & drop upload error:', error);
    toast.error("Ошибка загрузки", {
      description: error.message || 'Попробуйте еще раз'
    });
  }
}

