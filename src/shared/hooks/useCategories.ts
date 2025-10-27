/**
 * useCategories Hook
 * Manages user categories (default + custom)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getUserCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type UserCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@/shared/lib/api';

interface UseCategoriesResult {
  categories: UserCategory[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addCategory: (input: CreateCategoryInput) => Promise<UserCategory>;
  editCategory: (id: string, input: UpdateCategoryInput) => Promise<UserCategory>;
  removeCategory: (id: string) => Promise<void>;
}

/**
 * Hook for managing user categories
 */
export function useCategories(userId: string | undefined): UseCategoriesResult {
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!userId) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserCategories(userId);
      setCategories(data);
    } catch (err) {
      console.error('[useCategories] Error fetching categories:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Add category
  const addCategory = useCallback(
    async (input: CreateCategoryInput): Promise<UserCategory> => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      try {
        const newCategory = await createCategory(userId, input);
        setCategories(prev => [...prev, newCategory]);
        return newCategory;
      } catch (err) {
        console.error('[useCategories] Error adding category:', err);
        throw err;
      }
    },
    [userId]
  );

  // Edit category
  const editCategory = useCallback(
    async (id: string, input: UpdateCategoryInput): Promise<UserCategory> => {
      try {
        const updatedCategory = await updateCategory(id, input);
        setCategories(prev =>
          prev.map(cat => (cat.id === id ? updatedCategory : cat))
        );
        return updatedCategory;
      } catch (err) {
        console.error('[useCategories] Error editing category:', err);
        throw err;
      }
    },
    []
  );

  // Remove category
  const removeCategory = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('[useCategories] Error removing category:', err);
      throw err;
    }
  }, []);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
  };
}

/**
 * Get category names only (for backward compatibility)
 */
export function useCategoryNames(userId: string | undefined): string[] {
  const { categories } = useCategories(userId);
  return categories.map(cat => cat.name);
}

/**
 * Get categories formatted for UI components
 */
export function useCategoriesForUI(userId: string | undefined) {
  const { categories, isLoading, error } = useCategories(userId);

  const formattedCategories = categories.map(cat => ({
    id: cat.name,
    label: cat.name,
    icon: cat.icon,
    color: cat.color,
    isDefault: cat.is_default,
  }));

  return {
    categories: formattedCategories,
    isLoading,
    error,
  };
}

