/**
 * Categories API Service
 * Handles user categories (default + custom)
 */

import { createClient } from "@/utils/supabase/client";

export type UserCategory = {
	id: string;
	user_id: string;
	name: string;
	icon: string;
	color: string;
	is_default: boolean;
	created_at: string;
	updated_at: string;
};

export type CreateCategoryInput = {
	name: string;
	icon?: string;
	color?: string;
};

export type UpdateCategoryInput = {
	name?: string;
	icon?: string;
	color?: string;
};

/**
 * Get all categories for a user (default + custom)
 */
export async function getUserCategories(
	userId: string,
): Promise<UserCategory[]> {
	console.log("[CATEGORIES] Fetching categories for user:", userId);

	const supabase = createClient();
	const { data, error } = await supabase
		.from("user_categories")
		.select("*")
		.eq("user_id", userId)
		.order("is_default", { ascending: false }) // Default categories first
		.order("created_at", { ascending: true });

	if (error) {
		console.error("[CATEGORIES] Error fetching categories:", error);
		throw error;
	}

	console.log("[CATEGORIES] Fetched categories:", data?.length || 0);
	return data || [];
}

/**
 * Create a new custom category
 */
export async function createCategory(
	userId: string,
	input: CreateCategoryInput,
): Promise<UserCategory> {
	console.log("[CATEGORIES] Creating category:", input);

	// Validate max categories (default 9 + max 20 custom = 29 total)
	const existingCategories = await getUserCategories(userId);
	const customCategories = existingCategories.filter((c) => !c.is_default);

	if (customCategories.length >= 20) {
		throw new Error("Достигнут лимит пользовательских категорий (20)");
	}

	const supabase = createClient();
	const { data, error } = await supabase
		.from("user_categories")
		.insert({
			user_id: userId,
			name: input.name,
			icon: input.icon || "✨",
			color: input.color || "var(--gradient-neutral-1-start)",
			is_default: false,
		})
		.select()
		.single();

	if (error) {
		console.error("[CATEGORIES] Error creating category:", error);

		// Handle unique constraint violation
		if (error.code === "23505") {
			throw new Error("Категория с таким названием уже существует");
		}

		throw error;
	}

	console.log("[CATEGORIES] Category created:", data);
	return data;
}

/**
 * Update a custom category
 */
export async function updateCategory(
	categoryId: string,
	input: UpdateCategoryInput,
): Promise<UserCategory> {
	console.log("[CATEGORIES] Updating category:", categoryId, input);

	const supabase = createClient();
	const { data, error } = await supabase
		.from("user_categories")
		.update({
			...(input.name && { name: input.name }),
			...(input.icon && { icon: input.icon }),
			...(input.color && { color: input.color }),
			updated_at: new Date().toISOString(),
		})
		.eq("id", categoryId)
		.eq("is_default", false) // Only allow updating custom categories
		.select()
		.single();

	if (error) {
		console.error("[CATEGORIES] Error updating category:", error);

		if (error.code === "23505") {
			throw new Error("Категория с таким названием уже существует");
		}

		throw error;
	}

	if (!data) {
		throw new Error("Нельзя редактировать системные категории");
	}

	console.log("[CATEGORIES] Category updated:", data);
	return data;
}

/**
 * Delete a custom category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
	console.log("[CATEGORIES] Deleting category:", categoryId);

	const supabase = createClient();
	const { error } = await supabase
		.from("user_categories")
		.delete()
		.eq("id", categoryId)
		.eq("is_default", false); // Only allow deleting custom categories

	if (error) {
		console.error("[CATEGORIES] Error deleting category:", error);
		throw error;
	}

	console.log("[CATEGORIES] Category deleted");
}

/**
 * Get category by name (case-insensitive)
 */
export async function getCategoryByName(
	userId: string,
	name: string,
): Promise<UserCategory | null> {
	const supabase = createClient();
	const { data, error } = await supabase
		.from("user_categories")
		.select("*")
		.eq("user_id", userId)
		.ilike("name", name)
		.single();

	if (error && error.code !== "PGRST116") {
		// PGRST116 = no rows returned
		console.error("[CATEGORIES] Error fetching category by name:", error);
		throw error;
	}

	return data;
}
