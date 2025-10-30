import { Check, ChevronDown, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import type { LanguageConfig } from './types';
import { useTranslation } from './useTranslation';

type LanguageSelectorProps = {
	variant?: 'dropdown' | 'modal' | 'inline';
	showFlag?: boolean;
	showNativeName?: boolean;
	className?: string;
	onLanguageChange?: (language: string) => void;
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
	variant = 'dropdown',
	showFlag = true,
	showNativeName = true,
	className = '',
	onLanguageChange,
}) => {
	const { currentLanguage, changeLanguage, t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [languages, setLanguages] = useState<LanguageConfig[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Загрузка доступных языков
	useEffect(() => {
		const loadLanguages = async () => {
			setIsLoading(true);
			try {
				// Временный список языков, пока не реализован API
				const fallbackLanguages: LanguageConfig[] = [
					{
						code: 'ru',
						name: 'Russian',
						native_name: 'Русский',
						flag: '🇷🇺',
						is_active: true,
					},
					{
						code: 'en',
						name: 'English',
						native_name: 'English',
						flag: '🇺🇸',
						is_active: true,
					},
					{
						code: 'es',
						name: 'Spanish',
						native_name: 'Español',
						flag: '🇪🇸',
						is_active: true,
					},
					{
						code: 'de',
						name: 'German',
						native_name: 'Deutsch',
						flag: '🇩🇪',
						is_active: false,
					},
					{
						code: 'fr',
						name: 'French',
						native_name: 'Français',
						flag: '🇫🇷',
						is_active: false,
					},
					{
						code: 'zh',
						name: 'Chinese',
						native_name: '中文',
						flag: '🇨🇳',
						is_active: false,
					},
					{
						code: 'ja',
						name: 'Japanese',
						native_name: '日本語',
						flag: '🇯🇵',
						is_active: false,
					},
				];

				setLanguages(fallbackLanguages);
			} catch (error) {
				console.error('Failed to load languages:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadLanguages();
	}, []);

	const currentLang = languages.find((lang) => lang.code === currentLanguage);

	const handleLanguageSelect = async (languageCode: string) => {
		setIsOpen(false);
		await changeLanguage(languageCode as any);
		onLanguageChange?.(languageCode);
	};

	const renderLanguageOption = (language: LanguageConfig, isSelected: boolean) => (
		<motion.button
			className={`flex w-full items-center justify-between rounded-lg p-3 transition-colors ${
				isSelected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
			}`}
			key={language.code}
			onClick={() => handleLanguageSelect(language.code)}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
		>
			<div className="flex items-center gap-3">
				{showFlag && <span className="text-2xl">{language.flag}</span>}
				<div className="text-left">
					<div className="font-medium">{language.name}</div>
					{showNativeName && (
						<div className="text-muted-foreground text-sm">{language.native_name}</div>
					)}
				</div>
			</div>
			{isSelected && (
				<motion.div
					animate={{ scale: 1 }}
					initial={{ scale: 0 }}
					transition={{ type: 'spring', duration: 0.2 }}
				>
					<Check className="text-primary" size={20} />
				</motion.div>
			)}
		</motion.button>
	);

	if (variant === 'inline') {
		return (
			<div className={`flex flex-wrap gap-2 ${className}`}>
				{languages.map((language) => (
					<Button
						className="flex items-center gap-2"
						disabled={isLoading}
						key={language.code}
						onClick={() => handleLanguageSelect(language.code)}
						size="sm"
						variant={currentLanguage === language.code ? 'default' : 'outline'}
					>
						{showFlag && <span>{language.flag}</span>}
						{showNativeName ? language.native_name : language.name}
					</Button>
				))}
			</div>
		);
	}

	return (
		<div className={`relative ${className}`}>
			<Button
				className="flex min-w-[140px] items-center gap-2"
				disabled={isLoading}
				onClick={() => setIsOpen(!isOpen)}
				variant="outline"
			>
				{isLoading ? (
					<div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				) : (
					<>
						{showFlag && currentLang && <span className="text-lg">{currentLang.flag}</span>}
						<Globe size={16} />
						<span>
							{showNativeName && currentLang
								? currentLang.native_name
								: currentLang?.name || currentLanguage}
						</span>
						<ChevronDown
							className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
							size={16}
						/>
					</>
				)}
			</Button>

			<AnimatePresence>
				{isOpen &&
					(variant === 'modal' ? (
						// Модальная версия
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
							<motion.div
								animate={{ opacity: 1, scale: 1 }}
								className="mx-4 max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl bg-card p-6"
								exit={{ opacity: 0, scale: 0.95 }}
								initial={{ opacity: 0, scale: 0.95 }}
							>
								<h3 className="mb-4 font-semibold text-lg">
									{t('select_language', 'Select Language')}
								</h3>
								<div className="max-h-[60vh] space-y-2 overflow-y-auto">
									{languages.map((language) =>
										renderLanguageOption(language, language.code === currentLanguage)
									)}
								</div>
								<Button className="mt-4 w-full" onClick={() => setIsOpen(false)} variant="outline">
									{t('cancel_button' as any, 'Cancel')}
								</Button>
							</motion.div>
						</div>
					) : (
						// Выпадающая версия
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
							exit={{ opacity: 0, y: -10 }}
							initial={{ opacity: 0, y: -10 }}
						>
							{languages.map((language) =>
								renderLanguageOption(language, language.code === currentLanguage)
							)}
						</motion.div>
					))}
			</AnimatePresence>
		</div>
	);
};
