import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getEntries, deleteEntry, type DiaryEntry } from "../../utils/api";
import { toast } from "sonner";
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
  X
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
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-blue-100 text-blue-700',
  negative: 'bg-orange-100 text-orange-700'
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

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [searchQuery, selectedCategory, selectedSentiment, entries]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const userId = userData?.id || "anonymous";
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
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Удалить эту запись?")) return;

    try {
      const userId = userData?.id || "anonymous";
      await deleteEntry(entryId, userId);
      
      setEntries(prev => prev.filter(e => e.id !== entryId));
      setSelectedEntry(null);
      
      toast.success("Запись удалена");
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Не удалось удалить запись");
    }
  };

  const categories = Array.from(new Set(entries.map(e => e.category)));

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden scrollbar-hide">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 pt-16 pb-4">
        <h1 className="!text-[28px] !font-semibold text-foreground mb-4">
          История записей
        </h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по записям..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-border rounded-[12px] !text-[15px] outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Filters Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-[10px] !text-[14px] !font-medium"
        >
          <Filter className="w-4 h-4" />
          Фильтры
          {(selectedCategory || selectedSentiment) && (
            <span className="bg-accent text-white px-2 py-0.5 rounded-full !text-[12px]">
              {(selectedCategory ? 1 : 0) + (selectedSentiment ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-border overflow-hidden"
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
                        : 'bg-gray-100 text-foreground hover:bg-gray-200'
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
                          : 'bg-gray-100 text-foreground hover:bg-gray-200'
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
                        : 'bg-gray-100 text-foreground hover:bg-gray-200'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    onClick={() => setSelectedSentiment('positive')}
                    className={`px-3 py-1.5 rounded-[8px] !text-[13px] transition-colors ${
                      selectedSentiment === 'positive'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    Позитив
                  </button>
                  <button
                    onClick={() => setSelectedSentiment('neutral')}
                    className={`px-3 py-1.5 rounded-[8px] !text-[13px] transition-colors ${
                      selectedSentiment === 'neutral'
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
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

      {/* Stats Bar */}
      <div className="bg-accent/5 px-6 py-3 flex items-center justify-between">
        <p className="!text-[13px] text-muted-foreground">
          Найдено записей: <span className="!font-semibold text-foreground">{filteredEntries.length}</span>
        </p>
        {(selectedCategory || selectedSentiment || searchQuery) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory(null);
              setSelectedSentiment(null);
            }}
            className="!text-[13px] text-accent !font-medium"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Entries List */}
      <div className="px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="!text-[14px] text-muted-foreground">Загрузка...</p>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-accent" />
            </div>
            <h3 className="!text-[18px] !font-semibold text-foreground mb-2">
              Записей не найдено
            </h3>
            <p className="!text-[14px] text-muted-foreground">
              {searchQuery || selectedCategory || selectedSentiment
                ? "Попробуйте изменить фильтры"
                : "Создайте первую запись"}
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
                    className="bg-white rounded-[16px] p-4 border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent/10 rounded-[8px] flex items-center justify-center">
                          <CategoryIcon className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="!text-[14px] !font-semibold text-foreground">
                            {entry.category}
                          </p>
                          <p className="!text-[12px] text-muted-foreground">
                            {dateStr}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="p-1 hover:bg-gray-100 rounded-[6px] transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    <p className="!text-[15px] text-foreground leading-[22px] mb-3">
                      {entry.text}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-[6px] !text-[11px] !font-medium ${SENTIMENT_COLORS[entry.sentiment]}`}>
                        {entry.sentiment === 'positive' ? '😊 Позитив' : entry.sentiment === 'neutral' ? '😐 Нейтрал' : '😔 Грусть'}
                      </span>
                      {entry.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-[6px] !text-[11px]">
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
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-20 left-0 right-0 z-50 bg-white rounded-t-[24px] p-6 max-w-md mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="!text-[18px] !font-semibold">Действия</h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleDeleteEntry(selectedEntry.id)}
                  className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-[12px] transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="!text-[15px] !font-medium">Удалить запись</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
