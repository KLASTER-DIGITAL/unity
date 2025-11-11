/**
 * A/B Test Manager Component
 *
 * Управление A/B тестами для push уведомлений:
 * - Создание/редактирование/удаление A/B тестов
 * - Запуск/остановка тестов
 * - Просмотр результатов с метриками
 * - Определение победителя
 */

import { FlaskConical, Play, Plus, Square, Trash2, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
import { createClient } from '@/utils/supabase/client';

interface ABTest {
	id: string;
	name: string;
	description: string | null;
	status: 'draft' | 'running' | 'completed' | 'cancelled';
	variant_a_title: string;
	variant_a_body: string;
	variant_a_icon: string | null;
	variant_b_title: string;
	variant_b_body: string;
	variant_b_icon: string | null;
	traffic_split: number;
	target_segment: string;
	variant_a_sent: number;
	variant_a_delivered: number;
	variant_a_opened: number;
	variant_a_clicked: number;
	variant_b_sent: number;
	variant_b_delivered: number;
	variant_b_opened: number;
	variant_b_clicked: number;
	winner: 'variant_a' | 'variant_b' | 'no_difference' | null;
	confidence_level: number | null;
	start_date: string | null;
	end_date: string | null;
	created_at: string;
}

export function ABTestManager() {
	const [tests, setTests] = useState<ABTest[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const supabase = createClient();

	/**
	 * Загружает все A/B тесты
	 */
	const loadTests = useCallback(async () => {
		try {
			setLoading(true);

			const { data, error } = await supabase.functions.invoke('push-ab-test-api', {
				method: 'GET',
			});

			if (error) throw error;

			setTests(data || []);
		} catch (error) {
			console.error('[ABTestManager] Error loading tests:', error);
			toast.error('Ошибка загрузки A/B тестов');
		} finally {
			setLoading(false);
		}
	}, [supabase]);

	useEffect(() => {
		loadTests();
	}, [loadTests]);

	/**
	 * Запускает A/B тест
	 */
	const handleStartTest = async (testId: string) => {
		try {
			const { error } = await supabase.functions.invoke(`push-ab-test-api/${testId}/start`, {
				method: 'POST',
			});

			if (error) throw error;

			toast.success('A/B тест запущен');
			loadTests();
		} catch (error) {
			console.error('[ABTestManager] Error starting test:', error);
			toast.error('Ошибка запуска теста');
		}
	};

	/**
	 * Останавливает A/B тест
	 */
	const handleStopTest = async (testId: string) => {
		try {
			const { error } = await supabase.functions.invoke(`push-ab-test-api/${testId}/stop`, {
				method: 'POST',
			});

			if (error) throw error;

			toast.success('A/B тест остановлен');
			loadTests();
		} catch (error) {
			console.error('[ABTestManager] Error stopping test:', error);
			toast.error('Ошибка остановки теста');
		}
	};

	/**
	 * Удаляет A/B тест
	 */
	const handleDeleteTest = async (testId: string) => {
		if (!confirm('Вы уверены что хотите удалить этот A/B тест?')) {
			return;
		}

		try {
			const { error } = await supabase.functions.invoke(`push-ab-test-api/${testId}`, {
				method: 'DELETE',
			});

			if (error) throw error;

			toast.success('A/B тест удален');
			loadTests();
		} catch (error) {
			console.error('[ABTestManager] Error deleting test:', error);
			toast.error('Ошибка удаления теста');
		}
	};

	const getStatusBadge = (status: ABTest['status']) => {
		const variants = {
			draft: 'secondary',
			running: 'default',
			completed: 'outline',
			cancelled: 'destructive',
		} as const;

		return <Badge variant={variants[status]}>{status}</Badge>;
	};

	const calculateMetrics = (test: ABTest, variant: 'a' | 'b') => {
		const sent = variant === 'a' ? test.variant_a_sent : test.variant_b_sent;
		const delivered = variant === 'a' ? test.variant_a_delivered : test.variant_b_delivered;
		const opened = variant === 'a' ? test.variant_a_opened : test.variant_b_opened;

		const deliveryRate = sent > 0 ? ((delivered / sent) * 100).toFixed(1) : '0.0';
		const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '0.0';

		return { deliveryRate, openRate };
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>A/B Testing</CardTitle>
					<CardDescription>Загрузка...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="flex items-center gap-2 font-semibold text-lg">
						<FlaskConical className="h-5 w-5" />
						A/B Testing
					</h3>
					<p className="text-muted-foreground text-sm">
						Тестирование эффективности различных вариантов уведомлений
					</p>
				</div>
				<Button onClick={() => setShowCreateModal(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Создать тест
				</Button>
			</div>

			{/* Tests List */}
			<div className="space-y-4">
				{tests.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<FlaskConical className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
							<h3 className="mb-2 font-semibold text-lg">Нет A/B тестов</h3>
							<p className="mb-4 text-center text-muted-foreground text-sm">
								Создайте первый A/B тест для сравнения эффективности уведомлений
							</p>
							<Button onClick={() => setShowCreateModal(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Создать тест
							</Button>
						</CardContent>
					</Card>
				) : (
					tests.map((test) => {
						const metricsA = calculateMetrics(test, 'a');
						const metricsB = calculateMetrics(test, 'b');

						return (
							<Card key={test.id}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<CardTitle>{test.name}</CardTitle>
												{getStatusBadge(test.status)}
												{test.winner && (
													<Badge variant="default">
														<TrendingUp className="mr-1 h-3 w-3" />
														Winner:{' '}
														{test.winner === 'variant_a'
															? 'A'
															: test.winner === 'variant_b'
																? 'B'
																: 'Tie'}
													</Badge>
												)}
											</div>
											{test.description && (
												<CardDescription className="mt-1">{test.description}</CardDescription>
											)}
										</div>
										<div className="flex gap-2">
											{test.status === 'draft' && (
												<Button
													onClick={() => handleStartTest(test.id)}
													size="sm"
													variant="default"
												>
													<Play className="mr-1 h-4 w-4" />
													Запустить
												</Button>
											)}
											{test.status === 'running' && (
												<Button onClick={() => handleStopTest(test.id)} size="sm" variant="outline">
													<Square className="mr-1 h-4 w-4" />
													Остановить
												</Button>
											)}
											{(test.status === 'draft' || test.status === 'completed') && (
												<Button
													onClick={() => handleDeleteTest(test.id)}
													size="sm"
													variant="destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4 md:grid-cols-2">
										{/* Variant A */}
										<div className="rounded-lg border p-4">
											<h4 className="mb-2 font-semibold text-sm">
												Variant A ({test.traffic_split}%)
											</h4>
											<p className="mb-3 text-muted-foreground text-sm">
												<strong>{test.variant_a_title}</strong>
												<br />
												{test.variant_a_body}
											</p>
											<div className="space-y-1 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Отправлено:</span>
													<span className="font-medium">{test.variant_a_sent}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Доставлено:</span>
													<span className="font-medium">
														{test.variant_a_delivered} ({metricsA.deliveryRate}%)
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Открыто:</span>
													<span className="font-medium">
														{test.variant_a_opened} ({metricsA.openRate}%)
													</span>
												</div>
											</div>
										</div>

										{/* Variant B */}
										<div className="rounded-lg border p-4">
											<h4 className="mb-2 font-semibold text-sm">
												Variant B ({100 - test.traffic_split}%)
											</h4>
											<p className="mb-3 text-muted-foreground text-sm">
												<strong>{test.variant_b_title}</strong>
												<br />
												{test.variant_b_body}
											</p>
											<div className="space-y-1 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Отправлено:</span>
													<span className="font-medium">{test.variant_b_sent}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Доставлено:</span>
													<span className="font-medium">
														{test.variant_b_delivered} ({metricsB.deliveryRate}%)
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-muted-foreground">Открыто:</span>
													<span className="font-medium">
														{test.variant_b_opened} ({metricsB.openRate}%)
													</span>
												</div>
											</div>
										</div>
									</div>

									{/* Winner Info */}
									{test.winner && test.confidence_level && (
										<div className="mt-4 rounded-lg bg-accent/50 p-3">
											<p className="text-sm">
												<strong>Результат:</strong>{' '}
												{test.winner === 'variant_a'
													? 'Variant A победил'
													: test.winner === 'variant_b'
														? 'Variant B победил'
														: 'Нет значимой разницы'}{' '}
												(confidence: {test.confidence_level}%)
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						);
					})
				)}
			</div>

			{/* Create Modal */}
			{showCreateModal && (
				<CreateABTestModal
					onClose={() => setShowCreateModal(false)}
					onSuccess={() => {
						loadTests();
						setShowCreateModal(false);
					}}
				/>
			)}
		</div>
	);
}

/**
 * Create A/B Test Modal Component
 */
function CreateABTestModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
	const [creating, setCreating] = useState(false);
	const supabase = createClient();

	// Form state
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [variantATitle, setVariantATitle] = useState('');
	const [variantABody, setVariantABody] = useState('');
	const [variantBTitle, setVariantBTitle] = useState('');
	const [variantBBody, setVariantBBody] = useState('');
	const [trafficSplit, setTrafficSplit] = useState(50);
	const [targetSegment, setTargetSegment] = useState('all');

	const handleCreate = async () => {
		// Validation
		if (!name.trim()) {
			toast.error('Введите название теста');
			return;
		}

		if (!variantATitle.trim() || !variantABody.trim()) {
			toast.error('Заполните Variant A');
			return;
		}

		if (!variantBTitle.trim() || !variantBBody.trim()) {
			toast.error('Заполните Variant B');
			return;
		}

		try {
			setCreating(true);

			const { error } = await supabase.functions.invoke('push-ab-test-api', {
				method: 'POST',
				body: {
					name,
					description: description || null,
					variant_a_title: variantATitle,
					variant_a_body: variantABody,
					variant_a_icon: '/icon-192.png',
					variant_b_title: variantBTitle,
					variant_b_body: variantBBody,
					variant_b_icon: '/icon-192.png',
					traffic_split: trafficSplit,
					target_segment: targetSegment,
				},
			});

			if (error) throw error;

			toast.success('A/B тест создан');
			onSuccess();
		} catch (error) {
			console.error('[CreateABTestModal] Error creating test:', error);
			toast.error('Ошибка создания теста');
		} finally {
			setCreating(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							<CardTitle>Создать A/B тест</CardTitle>
							<CardDescription>Сравните эффективность двух вариантов уведомлений</CardDescription>
						</div>
						<Button onClick={onClose} size="icon" variant="ghost">
							<Plus className="h-4 w-4 rotate-45" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Basic Info */}
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium" htmlFor="name">
								Название теста *
							</label>
							<input
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								id="name"
								onChange={(e) => setName(e.target.value)}
								placeholder="Например: Daily Reminder - Time Test"
								value={name}
							/>
						</div>

						<div>
							<label className="text-sm font-medium" htmlFor="description">
								Описание
							</label>
							<textarea
								className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								id="description"
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Опишите цель теста..."
								rows={2}
								value={description}
							/>
						</div>
					</div>

					{/* Variant A */}
					<div className="space-y-4 rounded-lg border p-4">
						<h4 className="font-semibold text-sm">Variant A</h4>
						<div>
							<label className="text-sm font-medium" htmlFor="variant-a-title">
								Заголовок *
							</label>
							<input
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								id="variant-a-title"
								maxLength={50}
								onChange={(e) => setVariantATitle(e.target.value)}
								placeholder="Максимум 50 символов"
								value={variantATitle}
							/>
							<p className="mt-1 text-muted-foreground text-xs">{variantATitle.length}/50</p>
						</div>
						<div>
							<label className="text-sm font-medium" htmlFor="variant-a-body">
								Текст *
							</label>
							<textarea
								className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								id="variant-a-body"
								maxLength={120}
								onChange={(e) => setVariantABody(e.target.value)}
								placeholder="Максимум 120 символов"
								rows={3}
								value={variantABody}
							/>
							<p className="mt-1 text-muted-foreground text-xs">{variantABody.length}/120</p>
						</div>
					</div>

					{/* Variant B */}
					<div className="space-y-4 rounded-lg border p-4">
						<h4 className="font-semibold text-sm">Variant B</h4>
						<div>
							<label className="text-sm font-medium" htmlFor="variant-b-title">
								Заголовок *
							</label>
							<input
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								id="variant-b-title"
								maxLength={50}
								onChange={(e) => setVariantBTitle(e.target.value)}
								placeholder="Максимум 50 символов"
								value={variantBTitle}
							/>
							<p className="mt-1 text-muted-foreground text-xs">{variantBTitle.length}/50</p>
						</div>
						<div>
							<label className="text-sm font-medium" htmlFor="variant-b-body">
								Текст *
							</label>
							<textarea
								className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								id="variant-b-body"
								maxLength={120}
								onChange={(e) => setVariantBBody(e.target.value)}
								placeholder="Максимум 120 символов"
								rows={3}
								value={variantBBody}
							/>
							<p className="mt-1 text-muted-foreground text-xs">{variantBBody.length}/120</p>
						</div>
					</div>

					{/* Settings */}
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium" htmlFor="traffic-split">
								Traffic Split: {trafficSplit}% A / {100 - trafficSplit}% B
							</label>
							<input
								className="w-full"
								id="traffic-split"
								max={100}
								min={0}
								onChange={(e) => setTrafficSplit(Number(e.target.value))}
								step={5}
								type="range"
								value={trafficSplit}
							/>
							<p className="mt-1 text-muted-foreground text-xs">
								Распределение пользователей между вариантами
							</p>
						</div>

						<div>
							<label className="text-sm font-medium" htmlFor="target-segment">
								Целевая аудитория
							</label>
							<select
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								id="target-segment"
								onChange={(e) => setTargetSegment(e.target.value)}
								value={targetSegment}
							>
								<option value="all">Все пользователи</option>
								<option value="premium">Premium пользователи</option>
								<option value="active">Активные пользователи</option>
								<option value="inactive">Неактивные пользователи</option>
							</select>
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-2">
						<Button disabled={creating} onClick={onClose} variant="outline">
							Отмена
						</Button>
						<Button disabled={creating} onClick={handleCreate}>
							{creating ? 'Создание...' : 'Создать тест'}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
