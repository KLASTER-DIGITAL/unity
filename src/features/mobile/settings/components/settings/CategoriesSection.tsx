/**
 * SettingsScreen - Categories Section Component
 * Manages user categories (default + custom)
 */

import { Tag } from "lucide-react";
import { SettingsRow, SettingsSection } from "../SettingsRow";

interface CategoriesSectionProps {
  onCategoriesClick: () => void;
  t: any;
}

export function CategoriesSection({
  onCategoriesClick,
  t
}: CategoriesSectionProps) {
  return (
    <SettingsSection title={t.personalization || "Персонализация"}>
      <SettingsRow
        icon={Tag}
        iconColor="text-[var(--ios-orange)]"
        iconBgColor="bg-[var(--ios-orange)]/10"
        title={t.categories || "Мои категории"}
        description={t.categoriesDescription || "Управление категориями записей"}
        onClick={onCategoriesClick}
      />
    </SettingsSection>
  );
}

