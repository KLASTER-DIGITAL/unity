import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getEntries, deleteEntry, updateEntry, type DiaryEntry } from "@/shared/lib/api";
import { toast } from "sonner";
import { useTranslation } from "@/shared/lib/i18n";
import { MediaPreview } from "@/features/mobile/media"; // ✅ NEW: Import MediaPreview
import { LottiePreloaderCompact } from "@/shared/components/LottiePreloader";
import {
  Search,
  Filter,
  Calendar,
  Heart,
  Briefcase,
  DollarSign,
  Users,
  Sparkles,
  Trash2,
  MoreVertical,
  X,
  Edit,
  Save,
  CheckCircle2
} from "lucide-react";

interface HistoryScreenProps {
  userData?: any;
}

// Иконки для категорий
const CATEGORY_ICONS: { [key: string]: any } = {
  'Семья': Users,
  'Работа': Briefcase,
  'Финансы': DollarSign,
  'Благодарность': Heart,
  'Здоровье': Sparkles,
  'Личное развитие': Sparkles,
  'Творчество': Sparkles,
  'Отношения': Heart
};

// Цвета для sentiment
const SENTIMENT_COLORS = {
  positive: 'bg-[var(--ios-green)]/10 text-[var(--ios-green)]',
  neutral: 'bg-[var(--ios-blue)]/10 text-[var(--ios-blue)]',
  negative: 'bg-[var(--ios-orange)]/10 text-[var(--ios-orange)]'
};

export function HistoryScreen({ userData }: HistoryScreenProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Получаем переводы для языка пользователя
  const { t } = useTranslation();

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [searchQuery, selectedCategory, selectedSentiment, entries]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      // ✅ FIXED: userData has structure {user: {...}, profile: {...}}
      const userId = userData?.user?.id || userData?.id || "anonymous";
      console.log("[HISTORY] Loading entries for user:", userId);
      const data = await getEntries(userId, 100);

      console.log("Loaded entries for history:", data);
      setEntries(data);
      setFilteredEntries(data);
    } catch (error) {
      console.error("Error loading entries:", error);
      toast.error("Не удалось загрузить записи");
    } finally {
      setIsLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    // Поиск по тексту
    if (searchQuery.trim()) {
      filtered = filtered.filter(entry =>
        entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Фильтр по категории
    if (selectedCategory) {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }

    // Фильтр по sentiment
    if (selectedSentiment) {
      filtered = filtered.filter(entry => entry.sentiment === selectedSentiment);
    }

    setFilteredEntries(filtered);
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setEditText(entry.text);
    setEditCategory(entry.category);
    setSelectedEntry(null);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry || !editText.trim()) {
      toast.error(t('entry_text_required', 'Текст записи не может быть пустым'));
      return;
    }

    try {
      setIsSaving(true);

      const updates: Partial<DiaryEntry> = {
        text: editText.trim(),
        category: editCategory
      };

      const updatedEntry = await updateEntry(editingEntry.id, updates);

      // Обновляем запись в списке
      setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...updatedEntry } : e));

      setEditingEntry(null);
      setEditText("");
      setEditCategory("");

      // Показываем success modal
      setSuccessMessage("Запись успешно обновлена!");
      setShowSuccessModal(true);

      // Автоматически закрываем через 2 секунды
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error updating entry:", error);
      toast.error("Не удалось обновить запись");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Удалить эту запись?")) return;

    try {
      const userId = userData?.user?.id || userData?.id || "anonymous";
      await deleteEntry(entryId, userId);

      setEntries(prev => prev.filter(e => e.id !== entryId));
      setSelectedEntry(null);

      // Показываем success modal
      setSuccessMessage("Запись успешно удалена!");
      setShowSuccessModal(true);

      // Автоматически закрываем через 2 секунды
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Не удалось удалить запись");
    }
  };

  const categories = Array.from(new Set((entries || []).map(e => e.category)));

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden scrollbar-hide">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 pt-16 pb-4 transition-colors duration-300">
        <h1 className="!text-[28px] !font-semibold text-foreground mb-4">
          {t('historyTitle', 'История')}
        </h1>

        {/* Search and Filters in one row */}
        <div className="flex gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по записям..."
              className="w-full pl-11 pr-4 py-3 bg-muted border border-border rounded-[12px] !text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-accent/10 text-accent rounded-[12px] !text-[14px] !font-medium hover:bg-accent/20 transition-colors flex-shrink-0"
          >
            <Filter className="h-5 w-5" strokeWidth={2} />
            {(selectedCategory || selectedSentiment) && (
              <span className="bg-accent text-white px-2 py-0.5 rounded-full !text-[12px]">
                {(selectedCategory ? 1 : 0) + (selectedSentiment ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card border-b border-border overflow-hidden transition-colors duration-300"
          >
            <div className="px-6 py-4">
              {/* Categories */}
              <div className="mb-4">
                <p className="!text-[13px] !font-medium text-muted-foreground mb-2">
                  Категория
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-[8px] !text-[13px] transition-colors ${
                      !selectedCategory
                        ? 'bg-accent text-white'
                        : 'bg-muted text-foreground hover:bg-accent/10'
                    }`}
                  >
                    Все
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-[8px] !text-[13px] transition-colors ${
                        selectedCategory === cat
                          ? 'bg-accent text-white'
                          : 'bg-muted text-foreground hover:bg-accent/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sentiment */}
              <div>
                <p className="!text-[13px] !font-medium text-muted-foreground mb-2">
                  Настроение
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSentiment(null)}
                    className={`px-3 py-1.5 rounded-[8px] !text-[13px] transition-colors ${
                      !selectedSentiment
                        ? 'bg-accent text-white'
                        : 'bg-muted text-foreground hover:bg-accent/10'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    onClick={() => setSelectedSentiment('positive')}
                    className={`px-3 py-1.5 rounded-[8px] !text-[13px] transition-colors ${
                      selectedSentiment === 'positive'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20'
                    }`}
                  >
                    Позитив
                  </button>
                  <button
                    onClick={() => setSelectedSentiment('neutral')}
                    className={`px-3 py-1.5 rounded-[8px] !text-[13px] transition-colors ${
                      selectedSentiment === 'neutral'
                        ? 'bg-primary text-white'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    Нейтрал
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Bar - REMOVED per user request */}

      {/* Entries List */}
      <div className="px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LottiePreloaderCompact
              showMessage={false}
              minDuration={1000}
              size="md"
            />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-accent" strokeWidth={2} />
            </div>
            <h3 className="!text-[18px] !font-semibold text-foreground mb-2">
              {t('no_entries_found', 'Записей не найдено')}
            </h3>
            <p className="!text-[14px] text-muted-foreground">
              {searchQuery || selectedCategory || selectedSentiment
                ? t('try_change_filters', 'Попробуйте изменить фильтры')
                : t('create_first_entry', 'Создайте первую запись')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredEntries.map((entry, index) => {
                const CategoryIcon = CATEGORY_ICONS[entry.category] || Sparkles;
                const entryDate = new Date(entry.createdAt);
                const dateStr = new Intl.DateTimeFormat('ru', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(entryDate);

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-[16px] p-4 border border-border hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent/10 rounded-[8px] flex items-center justify-center">
                          <CategoryIcon className="h-5 w-5 text-accent" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="!text-[14px] !font-semibold text-foreground dark:text-white">
                            {entry.category}
                          </p>
                          <p className="!text-[12px] text-muted-foreground">
                            {dateStr}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="p-1 hover:bg-accent/10 rounded-[6px] transition-colors"
                      >
                        <MoreVertical className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
                      </button>
                    </div>

                    {/* ✅ FIX: Media Preview в 1 ряд (above text, like ClickUp) */}
                    {entry.media && entry.media.length > 0 && (
                      <div className="mb-3">
                        <MediaPreview
                          media={entry.media}
                          editable={false}
                          layout={entry.media.length > 1 ? 'row' : 'grid'}
                        />
                      </div>
                    )}

                    <p className="!text-[15px] text-foreground dark:text-white leading-[22px] mb-3">
                      {entry.text}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-[6px] !text-[11px] !font-medium border ${SENTIMENT_COLORS[entry.sentiment]} border-current/30`}>
                        {entry.sentiment === 'positive' ? '😊 Позитив' : entry.sentiment === 'neutral' ? '😐 Нейтрал' : '😔 Грусть'}
                      </span>
                      {(entry.tags || []).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground rounded-[6px] !text-[11px] border border-muted-foreground/30 dark:border-muted-foreground/50">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Entry Actions Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300 max-h-[85vh]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="!text-[18px] !font-semibold text-foreground">Действия</h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1 hover:bg-accent/10 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-foreground" strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleEditEntry(selectedEntry)}
                  className="w-full flex items-center gap-3 p-3 text-foreground hover:bg-accent/10 rounded-[12px] transition-colors"
                >
                  <Edit className="h-5 w-5" strokeWidth={2} />
                  <span className="!text-[15px] !font-medium">Редактировать</span>
                </button>

                <button
                  onClick={() => handleDeleteEntry(selectedEntry.id)}
                  className="w-full flex items-center gap-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-[12px] transition-colors"
                >
                  <Trash2 className="h-5 w-5" strokeWidth={2} />
                  <span className="!text-[15px] !font-medium">Удалить запись</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Entry Modal */}
      <AnimatePresence>
        {editingEntry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={!isSaving ? () => setEditingEntry(null) : undefined}
              className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300 max-h-[85vh]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="!text-[18px] !font-semibold text-foreground">Редактировать запись</h3>
                <button
                  onClick={() => !isSaving && setEditingEntry(null)}
                  disabled={isSaving}
                  className="p-1 hover:bg-accent/10 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-foreground" strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Text Input */}
                <div>
                  <label className="block !text-[13px] !font-medium text-muted-foreground mb-2">
                    {t('entry_text', 'Текст записи')}
                  </label>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    disabled={isSaving}
                    rows={6}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-[12px] !text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-colors resize-none disabled:opacity-50"
                    placeholder={t('describe_achievement', 'Опишите ваше достижение...')}
                  />
                </div>

                {/* Category Select */}
                <div>
                  <label className="block !text-[13px] !font-medium text-muted-foreground mb-2">
                    Категория
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-[12px] !text-[15px] text-foreground outline-none focus:border-accent transition-colors disabled:opacity-50"
                  >
                    <option value="Другое">Другое</option>
                    <option value="Семья">Семья</option>
                    <option value="Работа">Работа</option>
                    <option value="Финансы">Финансы</option>
                    <option value="Благодарность">Благодарность</option>
                    <option value="Здоровье">Здоровье</option>
                    <option value="Личное развитие">Личное развитие</option>
                    <option value="Творчество">Творчество</option>
                    <option value="Отношения">Отношения</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => !isSaving && setEditingEntry(null)}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-muted text-foreground rounded-[12px] !text-[15px] !font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving || !editText.trim()}
                    className="flex-1 px-4 py-3 bg-accent text-white rounded-[12px] !text-[15px] !font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      "Сохранение..."
                    ) : (
                      <>
                        <Save className="h-4 w-4" strokeWidth={2} />
                        Сохранить
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-modal bg-card p-8 rounded-[24px] max-w-[320px] w-[90%] mx-auto shadow-xl border border-border transition-colors duration-300"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--ios-green)]/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-[var(--ios-green)]" strokeWidth={2} />
                </div>

                <h3 className="!text-[20px] !font-semibold text-foreground">
                  Успешно!
                </h3>

                <p className="!text-[15px] text-muted-foreground">
                  {successMessage}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
