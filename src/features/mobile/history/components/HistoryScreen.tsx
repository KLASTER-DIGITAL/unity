import { useVirtualizer } from '@tanstack/react-virtual';
import { AnimatePresence } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
	type DiaryEntry,
	deleteEntry,
	getEntries,
	type MediaItem,
	updateEntry,
} from '@/shared/lib/api';
import { useTranslation } from '@/shared/lib/i18n';
import { debounce } from '@/shared/lib/utils/debounce';
import {
	DeleteConfirmModal,
	EditEntryModal,
	EmptyState,
	EntryActionsModal,
	EntryCard,
	EntryListSkeleton,
	FiltersPanel,
	filterEntries,
	type HistoryScreenProps,
	SearchBar,
	SuccessModal,
} from './history-screen';

export function HistoryScreen({ userData }: HistoryScreenProps) {
	const [entries, setEntries] = useState<DiaryEntry[]>([]);
	const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);
	const [showFilters, setShowFilters] = useState(false);
	const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
	const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
	const [editText, setEditText] = useState('');
	const [editCategory, setEditCategory] = useState('');
	const [editMedia, setEditMedia] = useState<MediaItem[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

	// Получаем переводы для языка пользователя
	const { t } = useTranslation();

	// ✅ OPTIMIZATION: Virtualization для улучшения INP при большом количестве записей (>20)
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: filteredEntries.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 200, // Примерная высота EntryCard (180-220px)
		overscan: 5, // Рендерим 5 дополнительных элементов сверху/снизу для плавности
	});

	// ✅ FIX: Define function BEFORE useEffect with useCallback
	const loadEntries = useCallback(async () => {
		try {
			setIsLoading(true);
			// ✅ FIXED: userData has structure {user: {...}, profile: {...}}
			const userId = userData?.user?.id || userData?.id || 'anonymous';
			console.log('[HISTORY] Loading entries for user:', userId);
			const data = await getEntries(userId, 100);

			console.log('Loaded entries for history:', data);
			setEntries(data);
			setFilteredEntries(data);
		} catch (error) {
			console.error('Error loading entries:', error);
			toast.error('Не удалось загрузить записи');
		} finally {
			setIsLoading(false);
		}
	}, [userData]);

	// ✅ FIX: useEffect AFTER function definition
	useEffect(() => {
		loadEntries();
	}, [loadEntries]);

	// ✅ OPTIMIZATION: Debounced filtering для улучшения INP (300ms delay)
	const debouncedFilterEntries = useMemo(
		() =>
			debounce((query: string, category: string | null, sentiment: string | null) => {
				const filtered = filterEntries(entries, query, category, sentiment);
				setFilteredEntries(filtered);
			}, 300),
		[entries]
	);

	useEffect(() => {
		debouncedFilterEntries(searchQuery, selectedCategory, selectedSentiment);
	}, [searchQuery, selectedCategory, selectedSentiment, debouncedFilterEntries]);

	const handleEditEntry = (entry: DiaryEntry) => {
		console.log('[HISTORY] Editing entry:', entry);
		console.log('[HISTORY] Entry media:', entry.media);
		setEditingEntry(entry);
		setEditText(entry.text);
		setEditCategory(entry.category);
		setEditMedia(entry.media || []);
		setSelectedEntry(null);
	};

	const handleSaveEdit = async () => {
		if (!(editingEntry && editText.trim())) {
			toast.error(t('entry_text_required', 'Текст записи не может быть пустым'));
			return;
		}

		try {
			setIsSaving(true);

			const updates: Partial<DiaryEntry> = {
				text: editText.trim(),
				category: editCategory,
				media: editMedia,
			};

			const updatedEntry = await updateEntry(editingEntry.id, updates);

			// Обновляем запись в списке
			setEntries((prev) =>
				prev.map((e) => (e.id === editingEntry.id ? { ...e, ...updatedEntry } : e))
			);

			setEditingEntry(null);
			setEditText('');
			setEditCategory('');
			setEditMedia([]);

			// Показываем success modal
			setSuccessMessage('Запись успешно обновлена!');
			setShowSuccessModal(true);

			// Автоматически закрываем через 2 секунды
			setTimeout(() => {
				setShowSuccessModal(false);
			}, 2000);
		} catch (error) {
			console.error('Error updating entry:', error);
			toast.error('Не удалось обновить запись');
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteEntry = (entryId: string) => {
		// Показываем красивое модальное окно подтверждения
		setEntryToDelete(entryId);
		setShowDeleteConfirm(true);
	};

	const confirmDelete = async () => {
		if (!entryToDelete) {
			return;
		}

		try {
			const userId = userData?.user?.id || userData?.id || 'anonymous';
			await deleteEntry(entryToDelete, userId);

			setEntries((prev) => prev.filter((e) => e.id !== entryToDelete));
			setSelectedEntry(null);
			setEntryToDelete(null);

			// Показываем success modal
			setSuccessMessage('Запись успешно удалена!');
			setShowSuccessModal(true);

			// Автоматически закрываем через 2 секунды
			setTimeout(() => {
				setShowSuccessModal(false);
			}, 2000);
		} catch (error) {
			console.error('Error deleting entry:', error);
			toast.error('Не удалось удалить запись');
		}
	};

	const categories = Array.from(new Set((entries || []).map((e) => e.category)));

	return (
		<div className="scrollbar-hide min-h-screen overflow-x-hidden bg-background pb-24">
			{/* Header */}
			<div className="border-border border-b bg-card px-6 pt-16 pb-4 transition-colors duration-300">
				<h1 className="mb-4 font-semibold! text-[28px]! text-foreground">
					{t('historyTitle', 'История')}
				</h1>

				<SearchBar
					activeFiltersCount={(selectedCategory ? 1 : 0) + (selectedSentiment ? 1 : 0)}
					onSearchChange={setSearchQuery}
					onToggleFilters={() => setShowFilters(!showFilters)}
					searchQuery={searchQuery}
					showFilters={showFilters}
				/>
			</div>

			<FiltersPanel
				categories={categories}
				onCategoryChange={setSelectedCategory}
				onSentimentChange={setSelectedSentiment}
				selectedCategory={selectedCategory}
				selectedSentiment={selectedSentiment}
				showFilters={showFilters}
			/>

			{/* Stats Bar - REMOVED per user request */}

			{/* ✅ OPTIMIZATION: Virtualized Entries List для улучшения INP */}
			<div className="px-6 py-4" ref={parentRef} style={{ height: '100vh', overflow: 'auto' }}>
				{isLoading ? (
					<EntryListSkeleton count={5} />
				) : filteredEntries.length === 0 ? (
					<EmptyState hasFilters={!!(searchQuery || selectedCategory || selectedSentiment)} />
				) : (
					<div
						style={{
							height: `${virtualizer.getTotalSize()}px`,
							width: '100%',
							position: 'relative',
						}}
					>
						<AnimatePresence mode="sync">
							{virtualizer.getVirtualItems().map((virtualItem) => {
								const entry = filteredEntries[virtualItem.index];
								return (
									<div
										data-index={virtualItem.index}
										key={entry.id}
										ref={virtualizer.measureElement}
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											transform: `translateY(${virtualItem.start}px)`,
										}}
									>
										<div className="mb-3">
											<EntryCard
												entry={entry}
												index={virtualItem.index}
												onOpenActions={setSelectedEntry}
											/>
										</div>
									</div>
								);
							})}
						</AnimatePresence>
					</div>
				)}
			</div>

			<EntryActionsModal
				entry={selectedEntry}
				onClose={() => setSelectedEntry(null)}
				onDelete={handleDeleteEntry}
				onEdit={handleEditEntry}
			/>

			<EditEntryModal
				editCategory={editCategory}
				editMedia={editMedia}
				editText={editText}
				isOpen={!!editingEntry}
				isSaving={isSaving}
				onCategoryChange={setEditCategory}
				onClose={() => setEditingEntry(null)}
				onMediaChange={setEditMedia}
				onSave={handleSaveEdit}
				onTextChange={setEditText}
				userId={userData.id}
			/>

			<DeleteConfirmModal
				isOpen={showDeleteConfirm}
				onClose={() => {
					setShowDeleteConfirm(false);
					setEntryToDelete(null);
				}}
				onConfirm={confirmDelete}
			/>

			<SuccessModal isOpen={showSuccessModal} message={successMessage} />
		</div>
	);
}

export default HistoryScreen;
