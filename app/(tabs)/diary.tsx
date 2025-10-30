/**
 * Diary Tab Screen - History
 */

import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { EntryCard } from '../../app-shared/components/screens/history/EntryCard.native';
import { FiltersPanel } from '../../app-shared/components/screens/history/FiltersPanel.native';
import { SearchBar } from '../../app-shared/components/screens/history/SearchBar.native';
import { SkeletonEntryCard } from '../../app-shared/components/skeleton/SkeletonCard';
import { DesignTokens } from '../../app-shared/design-system/tokens';
import { type DiaryEntry, useEntries } from '../../app-shared/hooks/useEntries';
import { supabase } from '../../app-shared/lib/supabase/client';

export default function DiaryScreen() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Real data from Supabase
  const { entries, isLoading, refetch, deleteEntry } = useEntries(userId);

  // Get current user on mount
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  const getCurrentUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      } else {
        console.log('[DiaryScreen] No session, using test user');
        setUserId('c1b3e4f5-6789-4abc-def0-123456789abc'); // Valid UUID format
      }
    } catch (error) {
      console.error('[DiaryScreen] Error getting user:', error);
    }
  };

  // Filter entries when search/filters change
  useEffect(() => {
    filterEntries();
  }, [filterEntries]);

  const filterEntries = () => {
    let filtered = [...entries];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (entry) =>
          entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((entry) => entry.category === selectedCategory);
    }

    // Sentiment filter
    if (selectedSentiment) {
      filtered = filtered.filter((entry) => entry.sentiment === selectedSentiment);
    }

    setFilteredEntries(filtered);
  };

  const handleOpenActions = (entry: DiaryEntry) => {
    console.log('[DiaryScreen] Open actions for entry:', entry.id);
  };

  const handleDeleteEntry = async (entry: DiaryEntry) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await deleteEntry(entry.id);
      console.log('[DiaryScreen] Deleted entry:', entry.id);
    } catch (error) {
      console.error('[DiaryScreen] Error deleting entry:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Reload data
    await refetch();

    setIsRefreshing(false);
  };

  const categories = Array.from(new Set(entries.map((e) => e.category)));
  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedSentiment ? 1 : 0);

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>История</Text>
          <SearchBar
            activeFiltersCount={0}
            onSearchChange={() => {}}
            onToggleFilters={() => {}}
            searchQuery=""
            showFilters={false}
          />
        </View>

        {/* Skeleton Loaders */}
        <View style={styles.listContent}>
          <SkeletonEntryCard />
          <SkeletonEntryCard />
          <SkeletonEntryCard />
          <SkeletonEntryCard />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>История</Text>

        <SearchBar
          activeFiltersCount={activeFiltersCount}
          onSearchChange={setSearchQuery}
          onToggleFilters={() => setShowFilters(!showFilters)}
          searchQuery={searchQuery}
          showFilters={showFilters}
        />
      </View>

      {/* Filters Panel */}
      <FiltersPanel
        categories={categories}
        onCategoryChange={setSelectedCategory}
        onSentimentChange={setSelectedSentiment}
        selectedCategory={selectedCategory}
        selectedSentiment={selectedSentiment}
        showFilters={showFilters}
      />

      {/* Entries List */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>Записей не найдено</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory || selectedSentiment
                ? 'Попробуйте изменить фильтры'
                : 'Начните делиться своими достижениями!'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            colors={[DesignTokens.colors.primary]}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            tintColor={DesignTokens.colors.primary}
          />
        }
        renderItem={({ item, index }) => (
          <EntryCard
            entry={item}
            index={index}
            onDelete={handleDeleteEntry}
            onOpenActions={handleOpenActions}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  listContent: {
    padding: 24,
    paddingBottom: 120, // Space for floating bottom tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
