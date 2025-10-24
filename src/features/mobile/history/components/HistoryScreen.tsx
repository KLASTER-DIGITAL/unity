import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { getEntries, deleteEntry, updateEntry, type DiaryEntry } from "@/shared/lib/api";
import { toast } from "sonner";
import { useTranslation } from "@/shared/lib/i18n";
import { LottiePreloaderCompact } from "@/shared/components/LottiePreloader";
import {
  SearchBar,
  FiltersPanel,
  EntryCard,
  EntryActionsModal,
  EditEntryModal,
  SuccessModal,
  EmptyState,
  filterEntries,
  type HistoryScreenProps
} from "./history-screen";

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
    const filtered = filterEntries(entries, searchQuery, selectedCategory, selectedSentiment);
    setFilteredEntries(filtered);
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

        <SearchBar
          searchQuery={searchQuery}
          showFilters={showFilters}
          activeFiltersCount={(selectedCategory ? 1 : 0) + (selectedSentiment ? 1 : 0)}
          onSearchChange={setSearchQuery}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
      </div>

      <FiltersPanel
        showFilters={showFilters}
        categories={categories}
        selectedCategory={selectedCategory}
        selectedSentiment={selectedSentiment}
        onCategoryChange={setSelectedCategory}
        onSentimentChange={setSelectedSentiment}
      />

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
          <EmptyState hasFilters={!!(searchQuery || selectedCategory || selectedSentiment)} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredEntries.map((entry, index) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  index={index}
                  onOpenActions={setSelectedEntry}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <EntryActionsModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
      />

      <EditEntryModal
        isOpen={!!editingEntry}
        editText={editText}
        editCategory={editCategory}
        isSaving={isSaving}
        onClose={() => setEditingEntry(null)}
        onTextChange={setEditText}
        onCategoryChange={setEditCategory}
        onSave={handleSaveEdit}
      />

      <SuccessModal isOpen={showSuccessModal} message={successMessage} />
    </div>
  );
}
