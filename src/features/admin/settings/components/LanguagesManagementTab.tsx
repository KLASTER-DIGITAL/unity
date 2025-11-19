import { AlertCircle, ArrowRight, CheckCircle, Globe, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LottiePreloaderInline } from '@/shared/components/LottiePreloader';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import { Switch } from '@/shared/components/ui/switch';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/components/ui/universal/Dialog';
import { createClient } from '@/utils/supabase/client';
import { LanguageDetailPage } from './languages/LanguageDetailPage';

type Language = {
	code: string;
	name: string;
	native_name: string;
	flag?: string;
	is_active: boolean;
	translation_count?: number;
	total_keys?: number;
	progress?: number;
};

type NewLanguageForm = {
	code: string;
	name: string;
	native_name: string;
	flag: string;
	is_active: boolean;
};

type LanguagesManagementTabProps = {
	onNavigateToTranslations?: (languageCode: string) => void;
};

export function LanguagesManagementTab({
	onNavigateToTranslations,
}: LanguagesManagementTabProps = {}) {
	const [languages, setLanguages] = useState<Language[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
	const [newLanguage, setNewLanguage] = useState<NewLanguageForm>({
		code: '',
		name: '',
		native_name: '',
		flag: '',
		is_active: true,
	});

	const supabase = createClient();

	// ✅ FIX: Define function BEFORE useEffect with useCallback
	const loadLanguages = useCallback(async () => {
		setIsLoading(true);
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				toast.error('Ошибка авторизации');
				return;
			}

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management/languages`,
				{
					headers: {
						Authorization: `Bearer ${session.access_token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				setLanguages(data.languages || []);
			} else {
				const error = await response.json();
				toast.error(error.error || 'Ошибка загрузки языков');
			}
		} catch (error) {
			console.error('Error loading languages:', error);
			toast.error('Ошибка соединения с сервером');
		} finally {
			setIsLoading(false);
		}
	}, [supabase]);

	// ✅ FIX: useEffect AFTER function definition
	useEffect(() => {
		loadLanguages();
	}, [loadLanguages]);

	const handleAddLanguage = async () => {
		if (!(newLanguage.code && newLanguage.name && newLanguage.native_name)) {
			toast.error('Заполните все обязательные поля');
			return;
		}

		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				toast.error('Ошибка авторизации');
				return;
			}

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management/language`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${session.access_token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(newLanguage),
				}
			);

			if (response.ok) {
				await loadLanguages();
				setIsAddDialogOpen(false);
				setNewLanguage({
					code: '',
					name: '',
					native_name: '',
					flag: '',
					is_active: true,
				});
				toast.success('Язык успешно добавлен! 🌍');
			} else {
				const error = await response.json();
				toast.error(error.error || 'Ошибка добавления языка');
			}
		} catch (error) {
			console.error('Error adding language:', error);
			toast.error('Ошибка соединения с сервером');
		}
	};

	const handleToggleLanguage = async (code: string, currentStatus: boolean) => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				toast.error('Ошибка авторизации');
				return;
			}

			const language = languages.find((l) => l.code === code);
			if (!language) {
				return;
			}

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management/language`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${session.access_token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						code: language.code,
						name: language.name,
						native_name: language.native_name,
						flag: language.flag,
						is_active: !currentStatus,
					}),
				}
			);

			if (response.ok) {
				await loadLanguages();
				toast.success(`Язык ${!currentStatus ? 'активирован' : 'деактивирован'}! 🌍`);
			} else {
				const error = await response.json();
				toast.error(error.error || 'Ошибка обновления языка');
			}
		} catch (error) {
			console.error('Error toggling language:', error);
			toast.error('Ошибка соединения с сервером');
		}
	};

	const handleNavigateToTranslations = (languageCode: string) => {
		const language = languages.find((l) => l.code === languageCode);
		if (language) {
			setSelectedLanguage(language);
		}
	};

	// Progress color helper (currently unused but kept for future use)
	// const getProgressColor = (progress: number) => {
	//   if (progress >= 90) return 'bg-green-500';
	//   if (progress >= 70) return 'bg-blue-500';
	//   if (progress >= 50) return 'bg-yellow-500';
	//   return 'bg-red-500';
	// };

	const totalKeys = languages[0]?.total_keys || 0;
	const activeLanguages = languages.filter((l) => l.is_active);
	const inactiveLanguages = languages.filter((l) => !l.is_active);

	// If language is selected, show detail page
	if (selectedLanguage) {
		return (
			<LanguageDetailPage language={selectedLanguage} onBack={() => setSelectedLanguage(null)} />
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="flex items-center gap-2 font-bold text-2xl">
						<Globe className="h-6 w-6" />
						Управление языками
					</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Добавляйте языки, отслеживайте прогресс переводов и управляйте локализацией
					</p>
				</div>
				<Dialog onOpenChange={setIsAddDialogOpen} open={isAddDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Добавить язык
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Добавить новый язык</DialogTitle>
							<DialogDescription>
								Заполните информацию о новом языке для добавления в систему
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="code">Код языка (ISO 639-1) *</Label>
								<Input
									id="code"
									maxLength={2}
									onChange={(e) =>
										setNewLanguage({
											...newLanguage,
											code: e.target.value.toLowerCase(),
										})
									}
									placeholder="ru, en, es..."
									value={newLanguage.code}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="name">Название *</Label>
								<Input
									id="name"
									onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
									placeholder="Русский, English..."
									value={newLanguage.name}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="native_name">Нативное название *</Label>
								<Input
									id="native_name"
									onChange={(e) =>
										setNewLanguage({
											...newLanguage,
											native_name: e.target.value,
										})
									}
									placeholder="Русский, English..."
									value={newLanguage.native_name}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="flag">Флаг (эмодзи)</Label>
								<Input
									id="flag"
									maxLength={2}
									onChange={(e) => setNewLanguage({ ...newLanguage, flag: e.target.value })}
									placeholder="🇷🇺, 🇺🇸, 🇪🇸..."
									value={newLanguage.flag}
								/>
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									checked={newLanguage.is_active}
									id="is_active"
									onCheckedChange={(checked) =>
										setNewLanguage({ ...newLanguage, is_active: checked })
									}
								/>
								<Label htmlFor="is_active">Активировать сразу</Label>
							</div>
						</div>
						<DialogFooter>
							<Button onClick={() => setIsAddDialogOpen(false)} variant="outline">
								Отмена
							</Button>
							<Button onClick={handleAddLanguage}>
								<Plus className="mr-2 h-4 w-4" />
								Добавить
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="font-medium text-muted-foreground text-sm">
							Всего языков
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{languages.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="font-medium text-muted-foreground text-sm">
							Активных языков
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-green-600">{activeLanguages.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="font-medium text-muted-foreground text-sm">
							Всего ключей
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{totalKeys}</div>
					</CardContent>
				</Card>
			</div>

			{/* Active Languages */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<LottiePreloaderInline size="lg" />
				</div>
			) : (
				<>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CheckCircle className="h-5 w-5 text-green-500" />
								Активные языки
							</CardTitle>
							<CardDescription>Языки, доступные для пользователей приложения</CardDescription>
						</CardHeader>
						<CardContent>
							{activeLanguages.length === 0 ? (
								<div className="py-8 text-center text-muted-foreground">
									<AlertCircle className="mx-auto mb-2 h-12 w-12" />
									<p className="font-medium">Нет активных языков</p>
									<p className="text-sm">Добавьте хотя бы один язык</p>
								</div>
							) : (
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									{activeLanguages.map((language) => (
										<Card
											className="cursor-pointer border-2 transition-shadow hover:border-primary/50 hover:shadow-md"
											key={language.code}
											onClick={() => handleNavigateToTranslations(language.code)}
										>
											<CardContent className="p-6">
												<div className="mb-4 flex items-start justify-between">
													<div className="flex items-center gap-3">
														{language.flag && <div className="text-4xl">{language.flag}</div>}
														<div>
															<div className="font-semibold text-lg">{language.name}</div>
															<div className="text-muted-foreground text-sm">
																{language.native_name}
															</div>
															<Badge className="mt-1" variant="outline">
																{language.code.toUpperCase()}
															</Badge>
														</div>
													</div>
													<Switch
														checked={language.is_active}
														onCheckedChange={() =>
															handleToggleLanguage(language.code, language.is_active)
														}
														onClick={(e) => e.stopPropagation()}
													/>
												</div>

												<div className="space-y-2">
													<div className="flex items-center justify-between text-sm">
														<span className="text-muted-foreground">Прогресс переводов</span>
														<span className="font-medium">
															{language.translation_count || 0} / {language.total_keys || 0}
														</span>
													</div>
													<Progress className="h-2" value={language.progress || 0} />
													<div className="flex items-center justify-between">
														<span
															className={`font-medium text-sm ${
																(language.progress || 0) >= 90
																	? 'text-green-600'
																	: (language.progress || 0) >= 70
																		? 'text-blue-600'
																		: (language.progress || 0) >= 50
																			? 'text-yellow-600'
																			: 'text-red-600'
															}`}
														>
															{Math.round(language.progress || 0)}%
														</span>
														<Button
															onClick={(e) => {
																e.stopPropagation();
																handleNavigateToTranslations(language.code);
															}}
															size="sm"
															variant="ghost"
														>
															Перейти к переводам
															<ArrowRight className="ml-1 h-4 w-4" />
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Inactive Languages */}
					{inactiveLanguages.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<AlertCircle className="h-5 w-5 text-muted-foreground" />
									Неактивные языки
								</CardTitle>
								<CardDescription>Языки, которые не отображаются пользователям</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									{inactiveLanguages.map((language) => (
										<Card
											className="opacity-60 transition-opacity hover:opacity-100"
											key={language.code}
										>
											<CardContent className="p-6">
												<div className="mb-4 flex items-start justify-between">
													<div className="flex items-center gap-3">
														{language.flag && (
															<div className="text-4xl grayscale">{language.flag}</div>
														)}
														<div>
															<div className="font-semibold text-lg">{language.name}</div>
															<div className="text-muted-foreground text-sm">
																{language.native_name}
															</div>
															<Badge className="mt-1" variant="outline">
																{language.code.toUpperCase()}
															</Badge>
														</div>
													</div>
													<Switch
														checked={language.is_active}
														onCheckedChange={() =>
															handleToggleLanguage(language.code, language.is_active)
														}
													/>
												</div>

												<div className="space-y-2">
													<div className="flex items-center justify-between text-sm">
														<span className="text-muted-foreground">Прогресс переводов</span>
														<span className="font-medium">
															{language.translation_count || 0} / {language.total_keys || 0}
														</span>
													</div>
													<Progress className="h-2" value={language.progress || 0} />
													<div className="flex items-center justify-between">
														<span className="font-medium text-muted-foreground text-sm">
															{Math.round(language.progress || 0)}%
														</span>
														<Button
															onClick={() => handleNavigateToTranslations(language.code)}
															size="sm"
															variant="ghost"
														>
															Перейти к переводам
															<ArrowRight className="ml-1 h-4 w-4" />
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</>
			)}
		</div>
	);
}
