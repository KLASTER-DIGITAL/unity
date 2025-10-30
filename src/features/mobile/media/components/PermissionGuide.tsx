import { AlertCircle, Camera, Mic, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type PermissionGuideProps = {
	type: 'microphone' | 'camera';
	isOpen: boolean;
	onClose: () => void;
};

export function PermissionGuide({ type, isOpen, onClose }: PermissionGuideProps) {
	const isMicrophone = type === 'microphone';
	const Icon = isMicrophone ? Mic : Camera;
	const title = isMicrophone ? 'Доступ к микрофону' : 'Доступ к камере';
	const description = isMicrophone
		? 'Для записи голосовых сообщений необходимо разрешить доступ к микрофону'
		: 'Для загрузки фото и видео необходимо разрешить доступ к камере';

	if (!isOpen) {
		return null;
	}

	return (
		<AnimatePresence>
			<motion.div
				animate={{ opacity: 1 }}
				className="scrollbar-hide fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pb-24"
				exit={{ opacity: 0 }}
				initial={{ opacity: 0 }}
				onClick={onClose}
			>
				<motion.div
					animate={{ scale: 1, opacity: 1 }}
					className="relative w-full max-w-md rounded-[20px] bg-card p-6"
					exit={{ scale: 0.9, opacity: 0 }}
					initial={{ scale: 0.9, opacity: 0 }}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Close Button */}
					<button
						className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-accent/10"
						onClick={onClose}
					>
						<X className="h-5 w-5 text-muted-foreground" />
					</button>

					{/* Icon */}
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
						<Icon className="h-8 w-8 text-accent" />
					</div>

					{/* Title */}
					<h3 className="mb-2 text-center">{title}</h3>

					{/* Description */}
					<p className="mb-6 text-center text-muted-foreground">{description}</p>

					{/* Instructions */}
					<div className="mb-6 space-y-4">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
								<span className="font-semibold! text-[13px]! text-accent">1</span>
							</div>
							<div className="flex-1">
								<p className="font-normal! text-[14px]! text-foreground">
									Найдите иконку {isMicrophone ? '🎤' : '📷'} в адресной строке браузера
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
								<span className="font-semibold! text-[13px]! text-accent">2</span>
							</div>
							<div className="flex-1">
								<p className="font-normal! text-[14px]! text-foreground">
									Нажмите на неё и выберите <strong>"Разрешить"</strong>
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
								<span className="font-semibold! text-[13px]! text-accent">3</span>
							</div>
							<div className="flex-1">
								<p className="font-normal! text-[14px]! text-foreground">
									Обновите страницу и попробуйте снова
								</p>
							</div>
						</div>
					</div>

					{/* Browser-specific hints */}
					<div className="mb-4 rounded-[12px] bg-muted p-4">
						<p className="mb-2 font-semibold! text-[12px]! text-foreground">💡 Подсказка:</p>
						<p className="font-normal! text-[12px]! text-muted-foreground">
							В Chrome и Safari иконка разрешений находится слева от адреса сайта. В Firefox -
							справа от адресной строки.
						</p>
					</div>

					{/* Note */}
					<div className="mb-4 rounded-[12px] border border-primary/20 bg-primary/10 p-3">
						<div className="flex items-start gap-2">
							<AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
							<p className="font-normal! text-[13px]! text-accent">
								Ваши данные в безопасности. Мы используем {isMicrophone ? 'микрофон' : 'камеру'}{' '}
								только для указанных функций и не храним записи на серверах.
							</p>
						</div>
					</div>

					{/* Action Button */}
					<button
						className="w-full rounded-[12px] bg-accent py-3 text-white transition-colors hover:bg-accent/90"
						onClick={onClose}
					>
						Понятно
					</button>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
