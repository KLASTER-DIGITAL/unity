/**
 * ProfileEditModal Component for UNITY-v2
 * 
 * Features:
 * - Edit user name
 * - Upload avatar image
 * - Image preview with crop
 * - BottomSheet UI
 * - iOS Design System compliance
 * 
 * @author UNITY Team
 * @date 2025-10-19
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Camera, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { updateUserProfile } from '@/shared/lib/api';
import { uploadMedia } from '@/shared/lib/api';
import { compressImage } from '@/utils/imageCompression';
import { createClient } from '@/utils/supabase/client';

// Дефолтное фото для аватара
const DEFAULT_AVATAR_URL = 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  onProfileUpdated?: (updatedProfile: any) => void;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}: ProfileEditModalProps) {
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle avatar file selection
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Неверный формат файла', {
        description: 'Пожалуйста, выберите изображение'
      });
      return;
    }

    // Validate file size (max 15MB - современные телефоны делают большие фото)
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Файл слишком большой', {
        description: 'Максимальный размер: 15 МБ'
      });
      return;
    }

    try {
      setIsUploading(true);

      console.log(`📸 [AVATAR] Original file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      // Compress image with aggressive settings for large files
      const compressedFile = await compressImage(
        file,
        512, // maxWidth
        file.size > 5 * 1024 * 1024 ? 0.7 : 0.8 // quality - lower for large files
      );

      console.log(`📸 [AVATAR] Compressed: ${(compressedFile.size / 1024).toFixed(2)}KB`);

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile);
      setAvatarUrl(previewUrl);
      setAvatarFile(compressedFile);

      toast.success('Фото выбрано', {
        description: 'Нажмите "Сохранить" для применения изменений'
      });
    } catch (error) {
      console.error('Error processing avatar:', error);
      toast.error('Ошибка обработки фото', {
        description: 'Попробуйте другое изображение'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!profile?.id) {
      toast.error('Ошибка', { description: 'ID пользователя не найден' });
      return;
    }

    // Validate name
    if (!name.trim()) {
      toast.error('Введите имя', {
        description: 'Имя не может быть пустым'
      });
      return;
    }

    // Validate email
    if (!email.trim() || !email.includes('@')) {
      toast.error('Неверный email', {
        description: 'Введите корректный email адрес'
      });
      return;
    }

    try {
      setIsSaving(true);

      let uploadedAvatarUrl = profile.avatar;

      // Upload avatar if changed
      if (avatarFile) {
        try {
          console.log('📸 [PROFILE] Uploading avatar...');
          const mediaFile = await uploadMedia(avatarFile, profile.id);
          console.log('📸 [PROFILE] Upload response:', mediaFile);

          if (mediaFile && mediaFile.url) {
            uploadedAvatarUrl = mediaFile.url;
            console.log('📸 [PROFILE] Avatar URL set:', uploadedAvatarUrl);
          } else {
            console.warn('📸 [PROFILE] No URL in response:', mediaFile);
            toast.error('Ошибка загрузки фото', {
              description: 'Не удалось получить URL фото. Профиль будет сохранен без нового фото'
            });
          }
        } catch (uploadError: any) {
          console.error('📸 [PROFILE] Avatar upload error:', uploadError);
          toast.error('Ошибка загрузки фото', {
            description: uploadError.message || 'Профиль будет сохранен без нового фото'
          });
        }
      }

      // Update email if changed (via Supabase Auth)
      const emailChanged = email.trim() !== profile.email;
      if (emailChanged) {
        try {
          const supabase = createClient();
          const { error: emailError } = await supabase.auth.updateUser({
            email: email.trim()
          });

          if (emailError) {
            throw emailError;
          }

          toast.info('Подтвердите новый email', {
            description: 'Мы отправили письмо для подтверждения на новый адрес'
          });
        } catch (emailError) {
          console.error('Email update error:', emailError);
          toast.error('Ошибка смены email', {
            description: 'Не удалось изменить email. Попробуйте позже'
          });
          // Don't return - continue with profile update
        }
      }

      // Update profile in database
      const updatedProfile = await updateUserProfile(profile.id, {
        name: name.trim(),
        avatar: uploadedAvatarUrl,
        email: email.trim(), // Update email in profiles table
      });

      toast.success('Профиль обновлен', {
        description: emailChanged
          ? 'Изменения сохранены. Проверьте email для подтверждения'
          : 'Изменения успешно сохранены'
      });

      // Notify parent component
      if (onProfileUpdated) {
        onProfileUpdated(updatedProfile);
      }

      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Ошибка сохранения', {
        description: 'Попробуйте еще раз'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle remove avatar
  const handleRemoveAvatar = async () => {
    if (!profile?.id) {
      toast.error('Ошибка', { description: 'ID пользователя не найден' });
      return;
    }

    try {
      setIsSaving(true);

      // Update profile in database with empty avatar
      const updatedProfile = await updateUserProfile(profile.id, {
        avatar: '', // Remove avatar
      });

      console.log('✅ Avatar removed from database:', updatedProfile);

      // Update local state immediately
      setAvatarUrl('');
      setAvatarFile(null);

      // Notify parent component for real-time update
      if (onProfileUpdated) {
        onProfileUpdated(updatedProfile);
      }

      toast.success('Фото удалено', {
        description: 'Изменения сохранены'
      });
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Ошибка удаления фото', {
        description: 'Попробуйте еще раз'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset to original values
    setName(profile?.name || '');
    setEmail(profile?.email || '');
    setAvatarUrl(profile?.avatar || '');
    setAvatarFile(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSaving ? handleCancel : undefined}
            className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300 max-h-[95vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-title-3 text-foreground">Редактировать профиль</h2>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="p-1 hover:bg-accent/10 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Avatar Section - Improved Design from 21st.dev */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  {/* Remove Button (only if avatar exists) - MOVED TO TOP RIGHT */}
                  <AnimatePresence>
                    {avatarUrl && !isUploading && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 z-10 p-2 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:bg-destructive/90 active:scale-95 transition-all ring-4 ring-background"
                        aria-label="Remove photo"
                        title="Удалить фото"
                      >
                        <X className="h-4 w-4" strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Avatar with hover effect */}
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-border transition-all duration-300 group-hover:border-primary/50">
                      <AvatarImage src={avatarUrl || DEFAULT_AVATAR_URL} alt={name} className="object-cover" />
                      <AvatarFallback className="bg-muted">
                        <img src={DEFAULT_AVATAR_URL} alt="Default avatar" className="h-full w-full object-cover" />
                      </AvatarFallback>
                    </Avatar>

                    {/* Hover overlay - clickable to upload */}
                    <div
                      className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 text-white animate-spin" strokeWidth={2} />
                      ) : (
                        <Camera className="h-8 w-8 text-white" strokeWidth={2} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {avatarUrl ? 'Изменить фото профиля' : 'Добавить фото профиля'}
                  </p>
                  <p className="text-xs font-normal text-muted-foreground">
                    JPG, PNG или GIF • Макс. 15 МБ
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Имя
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите ваше имя"
                    disabled={isSaving}
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    {name.length}/50 символов
                  </p>
                </div>

                {/* Email (Editable) */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    maxLength={100}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground">
                    {email !== profile?.email
                      ? 'После смены email потребуется подтверждение'
                      : 'Введите новый email для изменения'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with action buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isUploading || !name.trim()}
                className="flex-1"
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
              aria-label="Select avatar image"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

