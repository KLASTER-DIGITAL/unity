/**
 * Template Manager Component
 *
 * Управление шаблонами push уведомлений из БД
 * Features:
 * - Список всех шаблонов
 * - Фильтры Free/Premium
 * - CRUD операции через push-templates-api
 */

import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';

interface Template {
	id: string;
	type: string;
	title: string;
	body: string;
	icon: string;
	is_premium_only: boolean;
	is_ai_enabled: boolean;
	variables: string[];
	translations: Record<string, { title: string; body: string }>;
	ai_settings: Record<string, unknown>;
	description: string;
	is_active: boolean;
	usage_count: number;
	created_at: string;
	updated_at: string;
}

export function TemplateManager() {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');

	useEffect(() => {
		loadTemplates();
	}, [loadTemplates]);

	const loadTemplates = async () => {
		try {
			setLoading(true);

			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				toast.error('Необходима авторизация');
				return;
			}

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-templates-api`,
				{
					headers: {
						Authorization: `Bearer ${session.access_token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error('Failed to load templates');
			}

			const data = await response.json();
			setTemplates(data.templates || []);
		} catch (error) {
			console.error('Error loading templates:', error);
			toast.error('Ошибка загрузки шаблонов');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm('Вы уверены что хотите удалить этот шаблон?')) {
			return;
		}

		try {
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				toast.error('Необходима авторизация');
				return;
			}

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-templates-api?id=${id}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${session.access_token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error('Failed to delete template');
			}

			toast.success('Шаблон удален');
			loadTemplates();
		} catch (error) {
			console.error('Error deleting template:', error);
			toast.error('Ошибка удаления шаблона');
		}
	};

	const filteredTemplates = templates.filter((template) => {
		if (filter === 'free') return !template.is_premium_only;
		if (filter === 'premium') return template.is_premium_only;
		return true;
	});

	if (loading) {
		return (
			<Card>
				<CardContent className="py-8">
					<p className="text-center text-muted-foreground">Загрузка шаблонов...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Шаблоны уведомлений</CardTitle>
						<CardDescription>
							Управление шаблонами push уведомлений с поддержкой Free/Premium
						</CardDescription>
					</div>
					<Button onClick={() => toast.info('Создание шаблона в разработке')}>
						<Plus className="mr-2 h-4 w-4" />
						Создать шаблон
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
					<TabsList className="grid w-full grid-cols-3 mb-4">
						<TabsTrigger value="all">Все ({templates.length})</TabsTrigger>
						<TabsTrigger value="free">
							FREE ({templates.filter((t) => !t.is_premium_only).length})
						</TabsTrigger>
						<TabsTrigger value="premium">
							PREMIUM ({templates.filter((t) => t.is_premium_only).length})
						</TabsTrigger>
					</TabsList>

					<TabsContent value={filter} className="mt-0">
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Тип</TableHead>
										<TableHead>Заголовок</TableHead>
										<TableHead>Статус</TableHead>
										<TableHead>Использований</TableHead>
										<TableHead className="text-right">Действия</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredTemplates.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
												Шаблоны не найдены
											</TableCell>
										</TableRow>
									) : (
										filteredTemplates.map((template) => (
											<TableRow key={template.id}>
												<TableCell className="font-medium">
													<div className="flex flex-col gap-1">
														<span>{template.type}</span>
														{template.description && (
															<span className="text-xs text-muted-foreground">
																{template.description}
															</span>
														)}
													</div>
												</TableCell>
												<TableCell>
													<div className="max-w-xs truncate">{template.title}</div>
												</TableCell>
												<TableCell>
													<div className="flex gap-2">
														{template.is_premium_only && <Badge variant="default">PREMIUM</Badge>}
														{!template.is_premium_only && <Badge variant="secondary">FREE</Badge>}
														{template.is_ai_enabled && (
															<Badge variant="outline" className="gap-1">
																<Sparkles className="h-3 w-3" />
																AI
															</Badge>
														)}
														{!template.is_active && <Badge variant="destructive">Неактивен</Badge>}
													</div>
												</TableCell>
												<TableCell>{template.usage_count}</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info('Редактирование в разработке')}
														>
															<Pencil className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(template.id)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
