/**
 * Segment Manager Component
 *
 * Управление сегментами пользователей для таргетированных push рассылок:
 * - Создание/редактирование/удаление сегментов
 * - Настройка критериев сегментации (язык, активность, Premium статус)
 * - Автоматический расчет количества пользователей в сегменте
 * - Предпросмотр сегментов
 */

import { Plus, Trash2, Users, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { createClient } from '@/utils/supabase/client';

interface Segment {
	id: string;
	name: string;
	description: string | null;
	criteria: Record<string, unknown>;
	user_count: number;
	last_calculated_at: string | null;
	created_at: string;
}

export function SegmentManager() {
	const [segments, setSegments] = useState<Segment[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const supabase = createClient();

	/**
	 * Загружает все сегменты
	 */
	const loadSegments = useCallback(async () => {
		try {
			setLoading(true);

			const { data, error } = await supabase.functions.invoke('push-segments-api', {
				method: 'GET',
			});

			if (error) throw error;

			setSegments(data.segments || []);
		} catch (error) {
			console.error('[SegmentManager] Error loading segments:', error);
			toast.error('Ошибка загрузки сегментов');
		} finally {
			setLoading(false);
		}
	}, [supabase]);

	useEffect(() => {
		loadSegments();
	}, [loadSegments]);

	/**
	 * Удаляет сегмент
	 */
	const handleDelete = async (segmentId: string) => {
		if (!confirm('Удалить этот сегмент?')) return;

		try {
			const { error } = await supabase.functions.invoke(`push-segments-api/${segmentId}`, {
				method: 'DELETE',
			});

			if (error) throw error;

			toast.success('Сегмент удален');
			loadSegments();
		} catch (error) {
			console.error('[SegmentManager] Error deleting segment:', error);
			toast.error('Ошибка удаления сегмента');
		}
	};

	/**
	 * Форматирует критерии для отображения
	 */
	const formatCriteria = (criteria: Record<string, unknown>): string => {
		const parts: string[] = [];

		if (criteria.is_premium !== undefined) {
			parts.push(criteria.is_premium ? 'Premium' : 'Free');
		}

		if (criteria.language) {
			parts.push(`Язык: ${criteria.language}`);
		}

		if (criteria.last_active_days) {
			parts.push(`Активны за ${criteria.last_active_days} дней`);
		}

		if (criteria.registered_within_days) {
			parts.push(`Регистрация за ${criteria.registered_within_days} дней`);
		}

		return parts.join(', ') || 'Все пользователи';
	};

	if (loading) {
		return (
			<Card>
				<CardContent className="py-8 text-center">
					<p className="text-muted-foreground">Загрузка сегментов...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="flex items-center gap-2 font-bold text-2xl">
						<Users className="h-6 w-6" />
						Сегменты пользователей
					</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Создавайте сегменты для таргетированных рассылок
					</p>
				</div>

				<Button onClick={() => setShowCreateModal(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Создать сегмент
				</Button>
			</div>

			{/* Segments List */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{segments.map((segment) => (
					<Card key={segment.id} className="border-border">
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center justify-between text-[17px]!">
								<span>{segment.name}</span>
								<Button onClick={() => handleDelete(segment.id)} size="sm" variant="ghost">
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{segment.description && (
								<p className="text-[13px]! text-muted-foreground">{segment.description}</p>
							)}

							<div className="rounded-lg bg-muted p-3">
								<p className="mb-1 font-medium text-[13px]!">Критерии:</p>
								<p className="text-[12px]! text-muted-foreground">
									{formatCriteria(segment.criteria)}
								</p>
							</div>

							<div className="flex items-center justify-between border-t pt-3">
								<span className="text-[13px]! text-muted-foreground">Пользователей:</span>
								<span className="font-semibold text-[15px]!">{segment.user_count}</span>
							</div>
						</CardContent>
					</Card>
				))}

				{segments.length === 0 && (
					<Card className="col-span-full border-border">
						<CardContent className="py-12 text-center">
							<Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<p className="mb-2 font-medium text-foreground">Нет сегментов</p>
							<p className="mb-4 text-muted-foreground text-sm">
								Создайте первый сегмент для таргетированных рассылок
							</p>
							<Button onClick={() => setShowCreateModal(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Создать сегмент
							</Button>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Create Segment Modal */}
			{showCreateModal && (
				<CreateSegmentModal
					onClose={() => setShowCreateModal(false)}
					onSuccess={() => {
						setShowCreateModal(false);
						loadSegments();
					}}
				/>
			)}
		</div>
	);
}

/**
 * Модальное окно для создания сегмента
 */
interface CreateSegmentModalProps {
	onClose: () => void;
	onSuccess: () => void;
}

function CreateSegmentModal({ onClose, onSuccess }: CreateSegmentModalProps) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isPremium, setIsPremium] = useState<string>('all');
	const [language, setLanguage] = useState<string>('all');
	const [lastActiveDays, setLastActiveDays] = useState<string>('');
	const [registeredWithinDays, setRegisteredWithinDays] = useState<string>('');
	const [userCount, setUserCount] = useState<number | null>(null);
	const [calculating, setCalculating] = useState(false);
	const [creating, setCreating] = useState(false);
	const supabase = createClient();

	/**
	 * Рассчитывает количество пользователей в сегменте
	 */
	const calculateUserCount = async () => {
		try {
			setCalculating(true);

			const criteria: Record<string, unknown> = {};

			if (isPremium !== 'all') {
				criteria.is_premium = isPremium === 'premium';
			}

			if (language !== 'all') {
				criteria.language = language;
			}

			if (lastActiveDays) {
				criteria.last_active_days = Number.parseInt(lastActiveDays);
			}

			if (registeredWithinDays) {
				criteria.registered_within_days = Number.parseInt(registeredWithinDays);
			}

			const { data, error } = await supabase.functions.invoke('push-segments-api/calculate', {
				method: 'POST',
				body: { criteria },
			});

			if (error) throw error;

			setUserCount(data.user_count);
		} catch (error) {
			console.error('[CreateSegmentModal] Error calculating:', error);
			toast.error('Ошибка расчета');
		} finally {
			setCalculating(false);
		}
	};

	/**
	 * Создает сегмент
	 */
	const handleCreate = async () => {
		if (!name.trim()) {
			toast.error('Введите название сегмента');
			return;
		}

		try {
			setCreating(true);

			const criteria: Record<string, unknown> = {};

			if (isPremium !== 'all') {
				criteria.is_premium = isPremium === 'premium';
			}

			if (language !== 'all') {
				criteria.language = language;
			}

			if (lastActiveDays) {
				criteria.last_active_days = Number.parseInt(lastActiveDays);
			}

			if (registeredWithinDays) {
				criteria.registered_within_days = Number.parseInt(registeredWithinDays);
			}

			const { error } = await supabase.functions.invoke('push-segments-api', {
				method: 'POST',
				body: {
					name,
					description: description || null,
					criteria,
				},
			});

			if (error) throw error;

			toast.success('Сегмент создан');
			onSuccess();
		} catch (error) {
			console.error('[CreateSegmentModal] Error creating:', error);
			toast.error('Ошибка создания сегмента');
		} finally {
			setCreating(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<Card className="w-full max-w-2xl border-border">
				<CardHeader className="flex flex-row items-center justify-between pb-4">
					<CardTitle className="text-[20px]!">Создать сегмент</CardTitle>
					<Button onClick={onClose} size="sm" variant="ghost">
						<X className="h-4 w-4" />
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Name */}
					<div>
						<Label htmlFor="segment-name">Название сегмента *</Label>
						<Input
							id="segment-name"
							onChange={(e) => setName(e.target.value)}
							placeholder="Активные Premium пользователи"
							value={name}
						/>
					</div>

					{/* Description */}
					<div>
						<Label htmlFor="segment-description">Описание</Label>
						<Textarea
							id="segment-description"
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Пользователи с Premium подпиской, активные за последние 7 дней"
							rows={2}
							value={description}
						/>
					</div>

					{/* Criteria */}
					<div className="space-y-3 rounded-lg border p-4">
						<h3 className="font-semibold text-[15px]!">Критерии сегментации</h3>

						{/* Premium Status */}
						<div>
							<Label htmlFor="segment-premium">Premium статус</Label>
							<select
								id="segment-premium"
								className="w-full rounded-lg border px-3 py-2"
								onChange={(e) => setIsPremium(e.target.value)}
								value={isPremium}
							>
								<option value="all">Все пользователи</option>
								<option value="premium">Только Premium</option>
								<option value="free">Только Free</option>
							</select>
						</div>

						{/* Language */}
						<div>
							<Label htmlFor="segment-language">Язык</Label>
							<select
								id="segment-language"
								className="w-full rounded-lg border px-3 py-2"
								onChange={(e) => setLanguage(e.target.value)}
								value={language}
							>
								<option value="all">Все языки</option>
								<option value="ru">Русский</option>
								<option value="en">English</option>
								<option value="es">Español</option>
								<option value="de">Deutsch</option>
								<option value="fr">Français</option>
								<option value="zh">中文</option>
								<option value="ja">日本語</option>
							</select>
						</div>

						{/* Last Active Days */}
						<div>
							<Label htmlFor="segment-active">Активны за последние (дней)</Label>
							<Input
								id="segment-active"
								min="1"
								onChange={(e) => setLastActiveDays(e.target.value)}
								placeholder="7"
								type="number"
								value={lastActiveDays}
							/>
						</div>

						{/* Registered Within Days */}
						<div>
							<Label htmlFor="segment-registered">Зарегистрированы за последние (дней)</Label>
							<Input
								id="segment-registered"
								min="1"
								onChange={(e) => setRegisteredWithinDays(e.target.value)}
								placeholder="30"
								type="number"
								value={registeredWithinDays}
							/>
						</div>
					</div>

					{/* Calculate Button */}
					<Button
						className="w-full"
						disabled={calculating}
						onClick={calculateUserCount}
						variant="outline"
					>
						{calculating ? 'Расчет...' : 'Рассчитать количество пользователей'}
					</Button>

					{/* User Count */}
					{userCount !== null && (
						<div className="rounded-lg bg-muted p-4 text-center">
							<p className="mb-1 text-[13px]! text-muted-foreground">Пользователей в сегменте:</p>
							<p className="font-bold text-[24px]!">{userCount}</p>
						</div>
					)}

					{/* Actions */}
					<div className="flex gap-3">
						<Button className="flex-1" onClick={onClose} variant="outline">
							Отмена
						</Button>
						<Button className="flex-1" disabled={creating || !name.trim()} onClick={handleCreate}>
							{creating ? 'Создание...' : 'Создать сегмент'}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
