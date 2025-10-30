/**
 * CategoriesModal - Manage user categories
 * Simplified design matching LanguageModal
 */

import { Plus, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCategories } from '@/shared/hooks/useCategories';

type CategoriesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
  t: any;
};

// Emoji picker - 21 emojis (3 rows x 7 columns)
const EMOJI_OPTIONS = [
  '✨',
  '💼',
  '🎯',
  '💪',
  '📚',
  '🎨',
  '🏃',
  '🧘',
  '🍎',
  '💰',
  '🎵',
  '🎮',
  '📱',
  '✈️',
  '🏠',
  '👨‍👩‍👧',
  '🐕',
  '🌱',
  '🔧',
  '🎓',
  '❤️',
];

export function CategoriesModal({ isOpen, onClose, userId, t }: CategoriesModalProps) {
  const { categories, isLoading, addCategory, removeCategory } = useCategories(userId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '✨',
    color: 'var(--gradient-neutral-1-start)', // Default color (not used in UI)
  });

  const customCategories = categories.filter((c) => !c.is_default);
  const customCount = customCategories.length;
  const maxCategories = 20;

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error('Введите название категории');
      return;
    }

    if (customCount >= maxCategories) {
      toast.error(`Максимум ${maxCategories} пользовательских категорий`);
      return;
    }

    try {
      await addCategory(formData);
      toast.success('Категория добавлена');
      setShowAddForm(false);
      setFormData({ name: '', icon: '✨', color: 'var(--gradient-blue-1-start)' });
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при добавлении категории');
    }
  };

  const handleDelete = async (categoryId: string, isDefault: boolean) => {
    if (isDefault) {
      toast.error('Нельзя удалить системную категорию');
      return;
    }

    if (!confirm('Удалить категорию? Это действие нельзя отменить.')) {
      return;
    }

    try {
      await removeCategory(categoryId);
      toast.success('Категория удалена');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении категории');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="modal-bottom-sheet z-modal mx-auto max-w-md overflow-y-auto border-border border-t bg-card p-modal transition-colors duration-300"
        exit={{ opacity: 0, y: 100 }}
        initial={{ opacity: 0, y: 100 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground text-title-3">{t.categories || 'Мои категории'}</h3>
          <button
            className="rounded-full p-1 transition-colors hover:bg-accent/10"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <p className="mb-4 text-footnote text-muted-foreground">
          Управляйте категориями для ваших записей ({customCount}/{maxCategories})
        </p>

        {/* Add Category Button */}
        {!showAddForm && customCount < maxCategories && (
          <button
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-border border-dashed p-4 transition-all hover:border-primary hover:bg-primary/5"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Добавить категорию</span>
          </button>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-4 rounded-xl border border-border bg-muted/50 p-4">
            <input
              className="mb-3 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={30}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Название категории"
              type="text"
              value={formData.name}
            />

            {/* Emoji Picker - 3 rows x 7 columns */}
            <div className="mb-3">
              <p className="mb-2 text-footnote text-muted-foreground">Выберите иконку</p>
              <div
                className="w-full gap-1"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                }}
              >
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    className={`rounded-lg p-2 text-3xl transition-colors ${
                      formData.icon === emoji ? 'bg-primary/20' : 'hover:bg-muted'
                    }`}
                    key={emoji}
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                disabled={isLoading}
                onClick={handleAdd}
              >
                Сохранить
              </button>
              <button
                className="flex-1 rounded-xl bg-muted px-4 py-2.5 font-medium text-foreground transition-all hover:bg-muted/80"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', icon: '✨', color: 'var(--gradient-neutral-1-start)' });
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Categories List - Only custom categories */}
        <div className="space-y-2">
          {customCategories.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-footnote text-muted-foreground">
                У вас пока нет пользовательских категорий
              </p>
              <p className="mt-1 text-footnote text-muted-foreground">
                Нажмите "Добавить категорию" чтобы создать свою
              </p>
            </div>
          ) : (
            customCategories.map((category) => (
              <div
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:bg-accent/5"
                key={category.id}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{category.name}</p>
                  </div>
                </div>
                <button
                  className="rounded-lg p-2 transition-colors hover:bg-destructive/10"
                  onClick={() => handleDelete(category.id, category.is_default)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}
