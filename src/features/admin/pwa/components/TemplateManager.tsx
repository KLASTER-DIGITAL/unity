/**
 * Template Manager Component
 *
 * Управление шаблонами push уведомлений:
 * - Просмотр шаблонов из БД
 * - Создание/редактирование шаблонов
 * - Фильтрация Free/Premium
 */

import { Crown, Edit, FileText, Globe, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// ✅ PERFORMANCE: Lazy load PushTemplateEditor (484 строк)
const PushTemplateEditor = lazy(() =>
	import('@/features/admin/push/components/PushTemplateEditor').then((m) => ({
		default: m.PushTemplateEditor,
	}))
);

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { DangerousActionDialog } from '@/shared/components/ui/DangerousActionDialog';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { createClient } from '@/shared/lib/supabase/client';

interface Template {
	id: string;
	type: string;
	title: string;
	body: string;
	icon?: string;
	is_premium_only: boolean;
	is_ai_enabled: boolean;
	variables: string[];
	translations: Record<string, { title: string; body: string }>;
	ai_settings?: {
		tone?: string;
		use_behavior_analysis?: boolean;
		use_mood_analysis?: boolean;
		max_length?: number;
	};
	description?: string;
	is_active: boolean;
	usage_count: number;
	created_at: string;
}

export function TemplateManager() {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');
	const [showEditor, setShowEditor] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState<Template | undefined>(undefined);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
	const supabase = createClient();

	// Load templates
	const loadTemplates = useCallback(async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from('push_notification_templates')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;
			setTemplates(data || []);
		} catch (error) {
			console.error('[Template Manager] Error loading templates:', error);
			toast.error('Ошибка загрузки шаблонов');
		} finally {
			setLoading(false);
		}
	}, [supabase]);

	// Load on mount
	useEffect(() => {
		loadTemplates();
	}, [loadTemplates]);

	// Save template
	const handleSave = async (templateData: Partial<Template>) => {
		try {
			if (editingTemplate) {
				// Update existing template
				const { error } = await supabase
					.from('push_notification_templates')
					.update(templateData)
					.eq('id', editingTemplate.id);

				if (error) throw error;
				toast.success('Шаблон обновлен');
			} else {
				// Create new template
				const { error } = await supabase.from('push_notification_templates').insert(templateData);

				if (error) throw error;
				toast.success('Шаблон создан');
			}

			setShowEditor(false);
			setEditingTemplate(undefined);
			loadTemplates();
		} catch (error) {
			console.error('[Template Manager] Error saving template:', error);
			toast.error('Ошибка сохранения шаблона');
		}
	};

	// Delete template
	const handleDeleteClick = (id: string) => {
		setTemplateToDelete(id);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!templateToDelete) return;

		try {
			const { error } = await supabase
				.from('push_notification_templates')
				.delete()
				.eq('id', templateToDelete);

			if (error) throw error;
			toast.success('Шаблон удален');
			loadTemplates();
		} catch (error) {
			console.error('[Template Manager] Error deleting template:', error);
			toast.error('Ошибка удаления шаблона');
		} finally {
			setTemplateToDelete(null);
		}
	};

	// Filter templates
	const filteredTemplates = templates.filter((template) => {
		if (filter === 'free') return !template.is_premium_only;
		if (filter === 'premium') return template.is_premium_only;
		return true;
	});

	// Show editor with Suspense wrapper
	if (showEditor) {
		return (
			<Suspense
				fallback={
					<div className="flex h-96 items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				}
			>
				<PushTemplateEditor
					template={editingTemplate}
					onSave={handleSave}
					onCancel={() => {
						setShowEditor(false);
						setEditingTemplate(undefined);
					}}
				/>
			</Suspense>
		);
	}

	return (
		<>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h3 className="font-semibold text-lg">Шаблоны уведомлений</h3>
						<p className="text-sm text-muted-foreground">
							Управление шаблонами push уведомлений с поддержкой Premium и AI
						</p>
					</div>
					<Button onClick={() => setShowEditor(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Создать шаблон
					</Button>
				</div>

				{/* Filters */}
				<Tabs
					value={filter}
					onValueChange={(value: 'all' | 'free' | 'premium') => setFilter(value)}
				>
					<TabsList>
						<TabsTrigger value="all">Все ({templates.length})</TabsTrigger>
						<TabsTrigger value="free">
							Free ({templates.filter((t) => !t.is_premium_only).length})
						</TabsTrigger>
						<TabsTrigger value="premium">
							<Crown className="mr-1 h-3 w-3" />
							Premium ({templates.filter((t) => t.is_premium_only).length})
						</TabsTrigger>
					</TabsList>
				</Tabs>

				{/* Templates Grid */}
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : filteredTemplates.length === 0 ? (
					<Card>
						<CardContent className="py-12 text-center">
							<FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<p className="mb-2 font-medium">Нет шаблонов</p>
							<p className="mb-4 text-muted-foreground text-sm">
								Создайте первый шаблон для push уведомлений
							</p>
							<Button onClick={() => setShowEditor(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Создать шаблон
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{filteredTemplates.map((template) => (
							<Card key={template.id}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className="flex items-center gap-2 text-base">
												<FileText className="h-4 w-4" />
												{template.type}
											</CardTitle>
											<CardDescription>{template.description}</CardDescription>
										</div>
										<div className="flex gap-1">
											{template.is_premium_only && (
												<Badge variant="secondary" className="gap-1">
													<Crown className="h-3 w-3" />
													Premium
												</Badge>
											)}
											{template.is_ai_enabled && (
												<Badge variant="secondary" className="gap-1">
													<Sparkles className="h-3 w-3" />
													AI
												</Badge>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									{/* Preview */}
									<div className="rounded-lg border bg-muted/50 p-3 space-y-2">
										<p className="font-semibold text-sm">{template.title}</p>
										<p className="text-sm text-muted-foreground">{template.body}</p>
									</div>

									{/* Variables */}
									{template.variables.length > 0 && (
										<div className="flex flex-wrap gap-1">
											{template.variables.map((variable) => (
												<Badge key={variable} variant="outline" className="text-xs">
													{'{'}
													{variable}
													{'}'}
												</Badge>
											))}
										</div>
									)}

									{/* Actions */}
									<div className="flex items-center justify-between pt-2">
										<div className="flex items-center gap-2 text-muted-foreground text-xs">
											<Globe className="h-3 w-3" />
											<span>{Object.keys(template.translations).length + 1} языков</span>
											<span>•</span>
											<span>Использовано: {template.usage_count}</span>
										</div>
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													setEditingTemplate(template);
													setShowEditor(true);
												}}
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDeleteClick(template.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>

			<DangerousActionDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
				title="Удалить шаблон?"
				description="Это действие нельзя отменить. Шаблон будет удален навсегда."
				confirmButtonText="Удалить"
			/>
		</>
	);
}
