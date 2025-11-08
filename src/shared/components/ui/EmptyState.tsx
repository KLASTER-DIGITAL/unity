import { FileQuestion, Inbox, Search, Sparkles } from 'lucide-react';
import type React from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';

type EmptyStateProps = {
	/**
	 * Icon to display (default: Inbox)
	 */
	icon?: 'inbox' | 'search' | 'sparkles' | 'file-question';

	/**
	 * Title text
	 */
	title: string;

	/**
	 * Description text
	 */
	description?: string;

	/**
	 * Primary action button
	 */
	action?: {
		label: string;
		onClick: () => void;
		variant?: 'default' | 'outline' | 'secondary';
	};

	/**
	 * Secondary action button
	 */
	secondaryAction?: {
		label: string;
		onClick: () => void;
	};

	/**
	 * Custom className for container
	 */
	className?: string;

	/**
	 * Show as compact version (smaller padding, no card)
	 */
	compact?: boolean;
};

const ICONS = {
	inbox: Inbox,
	search: Search,
	sparkles: Sparkles,
	'file-question': FileQuestion,
};

/**
 * EmptyState Component
 *
 * Universal empty state component for all screens
 * Provides consistent UX when no data is available
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="inbox"
 *   title="Нет записей"
 *   description="Создайте первую запись чтобы начать"
 *   action={{
 *     label: "Создать запись",
 *     onClick: () => navigate('/create')
 *   }}
 * />
 * ```
 */
export function EmptyState({
	icon = 'inbox',
	title,
	description,
	action,
	secondaryAction,
	className = '',
	compact = false,
}: EmptyStateProps) {
	const Icon = ICONS[icon];

	const content = (
		<div
			className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-12'}`}
		>
			{/* Icon */}
			<div
				className={`mb-4 flex items-center justify-center rounded-full bg-muted ${compact ? 'h-16 w-16' : 'h-20 w-20'}`}
			>
				<Icon className={`text-muted-foreground ${compact ? 'h-8 w-8' : 'h-10 w-10'}`} />
			</div>

			{/* Title */}
			<h3 className={`mb-2 font-semibold text-foreground ${compact ? 'text-lg' : 'text-xl'}`}>
				{title}
			</h3>

			{/* Description */}
			{description && (
				<p className={`mb-6 max-w-md text-muted-foreground ${compact ? 'text-sm' : 'text-base'}`}>
					{description}
				</p>
			)}

			{/* Actions */}
			{(action || secondaryAction) && (
				<div className="flex flex-col gap-3 sm:flex-row">
					{action && (
						<Button onClick={action.onClick} variant={action.variant || 'default'}>
							{action.label}
						</Button>
					)}
					{secondaryAction && (
						<Button onClick={secondaryAction.onClick} variant="outline">
							{secondaryAction.label}
						</Button>
					)}
				</div>
			)}
		</div>
	);

	if (compact) {
		return <div className={className}>{content}</div>;
	}

	return (
		<Card className={`border-dashed transition-colors duration-300 ${className}`}>
			<CardContent className="p-0">{content}</CardContent>
		</Card>
	);
}

/**
 * Preset EmptyState components for common use cases
 */

export const EmptyStateNoEntries: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
	<EmptyState
		action={onCreate ? { label: 'Создать запись', onClick: onCreate } : undefined}
		description="Создайте первую запись чтобы начать отслеживать свои достижения"
		icon="inbox"
		title="Нет записей"
	/>
);

export const EmptyStateNoResults: React.FC<{ onClear?: () => void }> = ({ onClear }) => (
	<EmptyState
		action={
			onClear ? { label: 'Очистить фильтры', onClick: onClear, variant: 'outline' } : undefined
		}
		description="Попробуйте изменить параметры поиска или фильтры"
		icon="search"
		title="Ничего не найдено"
	/>
);

export const EmptyStateNoData: React.FC<{ title?: string; description?: string }> = ({
	title = 'Нет данных',
	description = 'Данные появятся здесь когда будут доступны',
}) => <EmptyState description={description} icon="file-question" title={title} />;
