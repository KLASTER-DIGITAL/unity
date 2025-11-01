import { Check, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
// Import hero image directly for Vite to process
import heroImageSrc from '@/assets/bd383d77e5f7766d755b15559de65d5ccfa62e27.webp';
import {
	imgEllipse11,
	imgEllipse12,
	imgEllipse13,
	imgEllipse14,
	imgEllipse15,
	imgEllipse20,
	imgEllipse21,
	imgEllipse22,
	imgEllipse23,
	imgEllipse24,
	imgEllipse25,
	imgEllipse27,
	imgEllipse29,
	imgEllipse30,
	imgEllipse32,
	imgEllipse33,
	imgEllipse34,
	imgEllipse35,
	imgEllipse36,
} from '@/imports/svg-lqmvp';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { PriorityOptimizedImage } from '@/shared/components/OptimizedImage';
import { Button } from '@/shared/components/ui/button';
// Новая i18n система
import { useTranslation } from '@/shared/lib/i18n';
import { getBlurPlaceholder } from '@/shared/lib/image';

type WelcomeScreenProps = {
	onNext: (language: string) => void;
	onSkip?: () => void;
	currentStep: number;
	totalSteps: number;
	onStepClick: (step: number) => void;
};

type Language = {
	id?: string;
	code: string;
	name: string;
	native_name: string;
	flag: string;
	is_active?: boolean;
	enabled?: boolean; // Поддержка обоих полей (is_active и enabled)
};

// Fallback языки на случай, если API недоступен
const fallbackLanguages: Language[] = [
	{
		id: '1',
		code: 'ru',
		name: 'Russian',
		native_name: 'Русский',
		flag: '🇷🇺',
		is_active: true,
	},
	{
		id: '2',
		code: 'en',
		name: 'English',
		native_name: 'English',
		flag: '🇬🇧',
		is_active: true,
	},
	{
		id: '3',
		code: 'es',
		name: 'Spanish',
		native_name: 'Español',
		flag: '🇪🇸',
		is_active: true,
	},
	{
		id: '4',
		code: 'de',
		name: 'German',
		native_name: 'Deutsch',
		flag: '🇩🇪',
		is_active: true,
	},
	{
		id: '5',
		code: 'fr',
		name: 'French',
		native_name: 'Français',
		flag: '🇫🇷',
		is_active: true,
	},
	{
		id: '6',
		code: 'zh',
		name: 'Chinese',
		native_name: '中文',
		flag: '🇨🇳',
		is_active: true,
	},
	{
		id: '7',
		code: 'ja',
		name: 'Japanese',
		native_name: '日本語',
		flag: '🇯🇵',
		is_active: true,
	},
];

export function WelcomeScreen({
	onNext,
	onSkip,
	currentStep: _currentStep,
	totalSteps: _totalSteps,
	onStepClick: _onStepClick,
}: WelcomeScreenProps) {
	const { t, changeLanguage, currentLanguage: i18nLanguage, isLoaded } = useTranslation();
	const [selectedLanguage, setSelectedLanguage] = useState(i18nLanguage || 'ru');
	const [showDropdown, setShowDropdown] = useState(false);
	const [languages, setLanguages] = useState<Language[]>(fallbackLanguages);
	const [_isLoadingLanguages, setIsLoadingLanguages] = useState(true);

	// Загрузка языков из API (публичный endpoint с ANON_KEY)
	useEffect(() => {
		const loadLanguages = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-api/languages`,
					{
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
							apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
						},
					}
				);
				if (response.ok) {
					const data = await response.json();
					// translations-api возвращает массив напрямую
					const loadedLanguages = Array.isArray(data) ? data : data.languages || fallbackLanguages;
					// Фильтруем только активные языки
					const activeLanguages = loadedLanguages.filter(
						(lang: Language) => lang.is_active || lang.enabled
					);
					setLanguages(activeLanguages.length > 0 ? activeLanguages : fallbackLanguages);
					console.log('✅ Loaded languages from API:', activeLanguages.length);
				} else {
					console.error('Failed to load languages:', response.status);
					setLanguages(fallbackLanguages);
				}
			} catch (error) {
				console.error('Error loading languages:', error);
				setLanguages(fallbackLanguages);
			} finally {
				setIsLoadingLanguages(false);
			}
		};

		loadLanguages();
	}, []);

	const selectedLang = languages.find((lang) => lang.code === selectedLanguage) || languages[0];

	// Синхронизируем выбранный язык с i18n системой
	useEffect(() => {
		if (selectedLanguage !== i18nLanguage) {
			changeLanguage(selectedLanguage);
		}
	}, [selectedLanguage, i18nLanguage, changeLanguage]);

	// ✅ OPTIMIZATION: Быстрая загрузка без тяжелых Lottie анимаций
	if (!isLoaded) {
		return (
			<div className="mx-auto h-screen w-full max-w-md bg-card">
				<LoadingScreen minDuration={0} />
			</div>
		);
	}

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="scrollbar-hide relative flex h-screen w-full flex-col overflow-hidden bg-card"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
		>
			{/* Top Section - Purple Background with Image + Language Selector */}
			<div className="relative shrink-0 overflow-hidden" style={{ height: 'min(50vh, 400px)' }}>
				{/* Generated Image Background - адаптивная с WebP оптимизацией */}
				<div className="absolute inset-0">
					<PriorityOptimizedImage
						alt="Welcome background"
						blurDataURL={getBlurPlaceholder('hero')}
						className="h-full w-full object-cover"
						priority={true}
						src={heroImageSrc}
					/>
				</div>

				{/* Decorative ellipses - только для больших экранов */}
				<div className="pointer-events-none absolute inset-0 hidden sm:block">
					<div className="absolute top-[-87px] left-[-150px] size-[282px]">
						<div className="absolute inset-[-10.284%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse12} />
						</div>
					</div>
					<div className="absolute top-[-145px] left-[94px] size-[340px]">
						<div className="absolute inset-[-8.529%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse11} />
						</div>
					</div>

					<div className="absolute top-[35px] left-[201px] size-[46px]">
						<div className="absolute inset-[-43.478%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse23} />
						</div>
					</div>
					<div className="absolute top-[31px] left-[150px] size-[46px]">
						<div className="absolute inset-[-43.478%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse23} />
						</div>
					</div>
					<div className="absolute top-[-29px] left-[98px] size-28">
						<div className="absolute inset-[-31.25%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse27} />
						</div>
					</div>
					<div className="absolute top-[-27px] left-[81px] size-28">
						<div className="absolute inset-[-107.143%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse36} />
						</div>
					</div>
					<div className="absolute top-[25px] left-[215px] size-[78px]">
						<div className="absolute inset-[-153.846%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse32} />
						</div>
					</div>
					<div className="absolute top-[18px] left-[169px] size-[78px]">
						<div className="absolute inset-[-175.641%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse33} />
						</div>
					</div>
					<div className="absolute top-[19px] left-[290px] size-[78px]">
						<div className="absolute inset-[-25.641%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse34} />
						</div>
					</div>
					<div className="absolute top-[-55px] left-[-63px] size-[183px]">
						<div className="absolute inset-[-15.847%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse29} />
						</div>
					</div>
					<div className="absolute top-[31px] left-[-23px] size-[46px]">
						<div className="absolute inset-[-63.044%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse30} />
						</div>
					</div>
					<div className="absolute top-[35px] left-[267px] size-[46px]">
						<div className="absolute inset-[-43.478%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse24} />
						</div>
					</div>
					<div className="absolute top-[37px] left-[319px] size-[46px]">
						<div className="absolute inset-[-63.044%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse25} />
						</div>
					</div>
					<div className="absolute top-[-29px] left-[74px] size-28">
						<div className="absolute inset-[-125%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse35} />
						</div>
					</div>
				</div>

				{/* Language Dropdown - над белым блоком */}
				<motion.div
					animate={{ y: 0, opacity: 1 }}
					className="relative z-20 flex justify-center pt-safe"
					initial={{ y: -20, opacity: 0 }}
					style={{ paddingTop: 'max(env(safe-area-inset-top), 24px)' }}
					transition={{ delay: 0.3, duration: 0.6 }}
				>
					<div className="relative mt-4">
						<Button
							className="box-border flex h-14 min-w-[230px] items-center justify-between rounded-[10px] border-0 bg-card py-0 pr-[13px] pl-[22px] text-muted-foreground shadow-lg hover:bg-accent/5"
							onClick={() => setShowDropdown(!showDropdown)}
							style={{
								fontFamily: "'Inter', var(--font-family-primary)",
								fontSize: '12px',
								fontWeight: '400',
							}}
						>
							<div className="flex items-center gap-2">
								<span>{selectedLang.flag}</span>
								<span>{selectedLang.native_name}</span>
							</div>
							<motion.div
								animate={{ rotate: showDropdown ? 180 : 0 }}
								transition={{ duration: 0.3 }}
							>
								<ChevronDown className="text-[#6b6b6b]" size={18} />
							</motion.div>
						</Button>
					</div>
				</motion.div>
			</div>

			{/* Bottom Section - White Block with Content */}
			<div
				className="relative flex flex-1 flex-col overflow-hidden rounded-t-[30px] bg-linear-to-b from-[#ffffff] to-[#f8f6ff]"
				style={{
					marginTop: '-30px', // Перекрытие для плавного перехода
					zIndex: 10,
				}}
			>
				{/* Decorative dots row - на границе белого блока */}
				<div className="pointer-events-none absolute top-0 right-0 left-0 hidden h-10 sm:block">
					<div className="absolute top-0 left-2.5 size-[46px]">
						<div className="absolute inset-[-58.696%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse15} />
						</div>
					</div>
					<div className="absolute top-[2px] left-[62px] size-[46px]">
						<div className="absolute inset-[-58.696%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse15} />
						</div>
					</div>
					<div className="absolute top-[-4px] left-[120px] size-[46px]">
						<div className="absolute inset-[-58.696%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse15} />
						</div>
					</div>
					<div className="absolute top-[-8px] left-[178px] size-[46px]">
						<div className="absolute inset-[-58.696%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse15} />
						</div>
					</div>
					<div className="absolute top-0 left-[227px] size-[46px]">
						<div className="absolute inset-[-58.696%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse15} />
						</div>
					</div>
					<div className="absolute top-0 left-[293px] size-[46px]">
						<div className="absolute inset-[-58.696%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse20} />
						</div>
					</div>
					<div className="absolute top-[-4px] left-[332px] size-[46px]">
						<div className="absolute inset-[-58.696%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse15} />
						</div>
					</div>
					<div className="absolute top-[2px] left-[345px] size-[46px]">
						<div className="absolute inset-[-58.696%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse21} />
						</div>
					</div>
				</div>

				{/* More decorative ellipses in white section */}
				<div className="pointer-events-none absolute inset-0 hidden sm:block">
					<div className="absolute top-[20px] left-[99px] size-[97px]">
						<div className="absolute inset-[-27.835%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse22} />
						</div>
					</div>
					<div className="absolute top-0 left-[94px] size-[340px]">
						<div className="absolute inset-[-18.235%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse13} />
						</div>
					</div>
					<div className="absolute top-[10px] left-[-144px] size-[340px]">
						<div className="absolute inset-[-18.235%]">
							<img alt="" className="block size-full max-w-none" src={imgEllipse14} />
						</div>
					</div>
				</div>

				{/* Content Container - ЦЕНТРИРОВАННЫЙ */}
				<div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-4">
					{/* Logo */}
					<motion.div
						animate={{ scale: 1, opacity: 1 }}
						className="mb-4 text-center"
						initial={{ scale: 0, opacity: 0 }}
						transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
					>
						<h1
							className="mb-0 text-[#756ef3]"
							style={{
								fontFamily: "'Poller One', serif",
								fontSize: 'clamp(36px, 10vw, 46px)',
								lineHeight: '1.1',
							}}
						>
							UNITY
						</h1>
					</motion.div>

					{/* Title and Subtitle */}
					<motion.div
						animate={{ y: 0, opacity: 1 }}
						className="max-w-[320px] text-center"
						initial={{ y: 30, opacity: 0 }}
						key={selectedLanguage}
						transition={{ delay: 0.7, duration: 0.7 }}
					>
						<motion.h2
							animate={{ opacity: 1 }}
							className="mb-2 text-[#2f394b]"
							initial={{ opacity: 0 }}
							style={{
								fontFamily: "'Open Sans', var(--font-family-primary)",
								fontWeight: '700',
								fontSize: 'clamp(28px, 8vw, 37px)',
								lineHeight: '1.2',
								letterSpacing: '-0.8px',
							}}
							transition={{ duration: 0.3 }}
						>
							{t('welcomeTitle', 'Создавай дневник побед')}
						</motion.h2>

						<motion.p
							animate={{ opacity: 1 }}
							className="text-[#8d8d8d]"
							initial={{ opacity: 0 }}
							style={{
								fontFamily: "'Open Sans', var(--font-family-primary)",
								fontWeight: '700',
								fontSize: '14px',
								lineHeight: '1.7',
								opacity: '0.6',
							}}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							{t('subtitle', 'История ваших побед — день за днём')}
						</motion.p>
					</motion.div>
				</div>

				{/* Buttons Section - ПОДНЯТО ВЫШЕ для предотвращения перекрытия */}
				<motion.div
					animate={{ y: 0, opacity: 1 }}
					className="relative z-10 w-full px-6"
					initial={{ y: 50, opacity: 0 }}
					style={{
						paddingBottom: 'max(env(safe-area-inset-bottom, 48px), 64px)',
					}}
					transition={{ delay: 0.9, duration: 0.6 }}
				>
					<div className="mx-auto max-w-xs">
						{/* Skip Button - НАД кнопкой Начать */}
						{onSkip && (
							<motion.button
								animate={{ opacity: 1 }}
								className="mb-5 w-full py-3 text-center text-[#8d8d8d] transition-colors hover:text-[#756ef3]"
								initial={{ opacity: 0 }}
								onClick={onSkip}
								style={{
									fontFamily: "'Inter', var(--font-family-primary)",
									fontWeight: '500',
									fontSize: '15px',
								}}
								transition={{ delay: 1.1, duration: 0.6 }}
							>
								{t('alreadyHaveAccount', 'У меня уже есть аккаунт')}
							</motion.button>
						)}

						{/* Button Container with Shadow */}
						<div className="relative">
							{/* Button Shadow - БЕЗ перекрытия Skip */}
							<div
								className="absolute inset-0 rounded-[15px] opacity-60"
								style={{
									background: 'linear-gradient(135.96deg, #8B78FF 0%, #5451D6 101.74%)',
									filter: 'blur(16px)',
									transform: 'translateY(4px)',
								}}
							/>

							{/* Main Button */}
							<Button
								className="relative h-[60px] w-full rounded-[15px] border-0 text-white shadow-none transition-transform duration-200 hover:scale-[1.02]"
								onClick={() => onNext(selectedLanguage)}
								style={{
									background: 'linear-gradient(135.96deg, #8B78FF 0%, #5451D6 101.74%)',
									fontFamily: "'Inter', var(--font-family-primary)",
									fontWeight: '600',
									fontSize: '20px',
									lineHeight: '24px',
								}}
							>
								<motion.span
									animate={{ opacity: 1 }}
									initial={{ opacity: 0 }}
									key={selectedLanguage}
									transition={{ duration: 0.3 }}
								>
									{t('startButton', 'Начать')}
								</motion.span>
							</Button>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Language Selection Popup - полноэкранный попап с размытым фоном */}
			{showDropdown && (
				<div
					className="fixed inset-0 flex items-center justify-center bg-black/40 px-4 backdrop-blur-md"
					onClick={() => setShowDropdown(false)}
					style={{ zIndex: 999_999 }}
				>
					<motion.div
						animate={{ opacity: 1, scale: 1, y: 0 }}
						className="max-h-[65vh] w-[280px] overflow-hidden rounded-[20px] bg-card shadow-2xl"
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						onClick={(e) => e.stopPropagation()}
						transition={{ duration: 0.3, type: 'spring', damping: 25 }}
					>
						{/* Language List */}
						<div className="max-h-[65vh] overflow-y-auto">
							{languages.map((language) => (
								<button
									className="flex h-14 w-full items-center justify-between pr-[13px] pl-[22px] text-left transition-colors hover:bg-accent/5 active:bg-accent/10"
									key={language.code}
									onClick={async () => {
										setSelectedLanguage(language.code as any);
										setShowDropdown(false);
										// ✅ FIX: Вызываем changeLanguage для переключения языка в i18n системе
										await changeLanguage(language.code as any);
									}}
									style={{
										fontFamily: "'Inter', var(--font-family-primary)",
										fontSize: '12px',
										fontWeight: '400',
									}}
								>
									<div className="flex items-center gap-2">
										<span>{language.flag}</span>
										<span className="text-[#6b6b6b]">{language.native_name}</span>
									</div>
									{selectedLanguage === language.code && (
										<Check className="text-[#8B78FF]" size={16} strokeWidth={2} />
									)}
								</button>
							))}
						</div>
					</motion.div>
				</div>
			)}
		</motion.div>
	);
}

export default WelcomeScreen;
