/**
 * SettingsScreen - PWA Install Modal Component
 */

import { X } from 'lucide-react';
import { motion } from 'motion/react';

type PWAInstallModalProps = {
	isOpen: boolean;
	onClose: () => void;
	t: any;
};

export function PWAInstallModal({ isOpen, onClose, t }: PWAInstallModalProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<>
			<motion.div
				animate={{ opacity: 1 }}
				className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
				exit={{ opacity: 0 }}
				initial={{ opacity: 0 }}
				onClick={onClose}
			/>

			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="modal-bottom-sheet z-modal mx-auto max-w-md overflow-y-auto border-border border-t bg-card p-modal transition-colors duration-300"
				exit={{ opacity: 0, y: 100 }}
				initial={{ opacity: 0, y: 100 }}
			>
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-foreground text-title-3">
						{t.installPWA || 'Установить приложение'}
					</h3>
					<button
						className="rounded-full p-1 transition-colors hover:bg-accent/10"
						onClick={onClose}
					>
						<X className="h-5 w-5 text-foreground" />
					</button>
				</div>

				<p className="mb-4 text-footnote text-muted-foreground">Добавьте UNITY на главный экран</p>

				<div className="space-y-4">
					<div className="rounded-lg border border-border bg-accent/10 p-4 transition-colors duration-300">
						<h4 className="mb-2 text-foreground text-headline font-semibold">iOS (Safari)</h4>
						<ol className="list-inside list-decimal space-y-1 text-muted-foreground text-footnote">
							<li>Нажмите кнопку "Поделиться" внизу экрана</li>
							<li>Выберите "На экран Домой"</li>
							<li>Нажмите "Добавить"</li>
						</ol>
					</div>
					<div className="rounded-lg border border-border bg-accent/10 p-4 transition-colors duration-300">
						<h4 className="mb-2 text-foreground text-headline font-semibold">Android (Chrome)</h4>
						<ol className="list-inside list-decimal space-y-1 text-footnote text-muted-foreground">
							<li>Нажмите меню (три точки) в правом верхнем углу</li>
							<li>Выберите "Установить приложение"</li>
							<li>Нажмите "Установить"</li>
						</ol>
					</div>
					<div className="rounded-lg border border-border bg-primary/10 p-4 transition-colors duration-300">
						<h4 className="mb-2 font-semibold text-foreground">Преимущества PWA</h4>
						<ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
							<li>Работает офлайн</li>
							<li>Быстрая загрузка</li>
							<li>Иконка на главном экране</li>
							<li>Полноэкранный режим</li>
						</ul>
					</div>
				</div>
			</motion.div>
		</>
	);
}
