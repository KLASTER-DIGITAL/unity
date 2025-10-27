/**
 * CategoriesModal - Manage user categories
 * Simplified design matching LanguageModal
 */

import { motion } from "motion/react";
import { X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCategories } from "@/shared/hooks/useCategories";
import { toast } from "sonner";

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
  t: any;
}

// Emoji picker - 21 emojis (3 rows x 7 columns)
const EMOJI_OPTIONS = [
  "✨", "💼", "🎯", "💪", "📚", "🎨", "🏃",
  "🧘", "🍎", "💰", "🎵", "🎮", "📱", "✈️",
  "🏠", "👨‍👩‍👧", "🐕", "🌱", "🔧", "🎓", "❤️"
];

export function CategoriesModal({ isOpen, onClose, userId, t }: CategoriesModalProps) {
  const { categories, isLoading, addCategory, removeCategory } = useCategories(userId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: "✨",
    color: "var(--gradient-neutral-1-start)" // Default color (not used in UI)
  });

  const customCategories = categories.filter(c => !c.is_default);
  const customCount = customCategories.length;
  const maxCategories = 20;

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error("Введите название категории");
      return;
    }

    if (customCount >= maxCategories) {
      toast.error(`Максимум ${maxCategories} пользовательских категорий`);
      return;
    }

    try {
      await addCategory(formData);
      toast.success("Категория добавлена");
      setShowAddForm(false);
      setFormData({ name: "", icon: "✨", color: "var(--gradient-blue-1-start)" });
    } catch (error: any) {
      toast.error(error.message || "Ошибка при добавлении категории");
    }
  };

  const handleDelete = async (categoryId: string, isDefault: boolean) => {
    if (isDefault) {
      toast.error("Нельзя удалить системную категорию");
      return;
    }

    if (!confirm("Удалить категорию? Это действие нельзя отменить.")) {
      return;
    }

    try {
      await removeCategory(categoryId);
      toast.success("Категория удалена");
    } catch (error: any) {
      toast.error(error.message || "Ошибка при удалении категории");
    }
  };

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
          <h3 className="text-title-3 text-foreground">{t.categories || "Мои категории"}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <p className="text-footnote text-muted-foreground mb-4">
          Управляйте категориями для ваших записей ({customCount}/{maxCategories})
        </p>

        {/* Add Category Button */}
        {!showAddForm && customCount < maxCategories && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 p-4 mb-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <Plus className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Добавить категорию</span>
          </button>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-muted/50 rounded-xl border border-border">
            <input
              type="text"
              placeholder="Название категории"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={30}
              className="w-full px-4 py-3 mb-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Emoji Picker - 3 rows x 7 columns */}
            <div className="mb-3">
              <p className="text-footnote text-muted-foreground mb-2">Выберите иконку</p>
              <div
                className="w-full gap-1"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)'
                }}
              >
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`text-3xl p-2 rounded-lg transition-colors ${
                      formData.icon === emoji ? 'bg-primary/20' : 'hover:bg-muted'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all"
              >
                Сохранить
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: "", icon: "✨", color: "var(--gradient-neutral-1-start)" });
                }}
                className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Categories List - Only custom categories */}
        <div className="space-y-2">
          {customCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-footnote">
                У вас пока нет пользовательских категорий
              </p>
              <p className="text-muted-foreground text-footnote mt-1">
                Нажмите "Добавить категорию" чтобы создать свою
              </p>
            </div>
          ) : (
            customCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-accent/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{category.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(category.id, category.is_default)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}

