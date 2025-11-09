/**
 * SettingsScreen - Categories Section Component
 * Manages user categories (default + custom)
 */

import { Tag } from 'lucide-react';
import { SettingsRow, SettingsSection } from '../SettingsRow';

type CategoriesSectionProps = {
	onCategoriesClick: () => void;
	t: any;
};

export function CategoriesSection({ onCategoriesClick, t }: CategoriesSectionProps) {
	return (
		<SettingsSection title={t.personalization || 'Персонализация'}>
			<SettingsRow
				description={t.categoriesDescription || 'Управление категориями записей'}
				icon={Tag}
				iconBgColor="bg-(--ios-orange)/10"
				iconColor="text-(--ios-orange)"
				onClick={onCategoriesClick}
				title={t.categories || 'Мои категории'}
			/>
		</SettingsSection>
	);
}
