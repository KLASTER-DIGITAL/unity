/**
 * AddCategoryModal - Quick add category modal for InputArea
 * Matches CategoriesModal design from settings
 */

import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

type AddCategoryModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSave: (name: string, icon: string) => Promise<void>;
	isSaving: boolean;
};

// Emoji picker - 21 emojis (3 rows x 7 columns) - same as CategoriesModal
const EMOJI_OPTIONS = [
	'✨',
	'💼',
	'🎯',
	'💪',
	'📚',
	'🎨',
	'🏃',
	'🧘',
	'🍎',
	'💰',
	'🎵',
	'🎮',
	'📱',
	'✈️',
	'🏠',
	'👨‍👩‍👧',
	'🐕',
	'🌱',
	'🔧',
	'🎓',
	'❤️',
];

export function AddCategoryModal({ isOpen, onClose, onSave, isSaving }: AddCategoryModalProps) {
	const [name, setName] = useState('');
	const [icon, setIcon] = useState('✨');

	const handleSave = async () => {
		await onSave(name, icon);
		// Reset form
		setName('');
		setIcon('✨');
	};

	const handleCancel = () => {
		onClose();
		// Reset form
		setName('');
		setIcon('✨');
	};

	if (!isOpen) {
		return null;
	}

	return (
		<>
			{/* Backdrop */}
			<motion.div
				animate={{ opacity: 1 }}
				className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
				exit={{ opacity: 0 }}
				initial={{ opacity: 0 }}
				onClick={handleCancel}
			/>

			{/* Modal */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="modal-bottom-sheet z-modal mx-auto max-w-md overflow-y-auto border-border border-t bg-card p-modal transition-colors duration-300"
				exit={{ opacity: 0, y: 100 }}
				initial={{ opacity: 0, y: 100 }}
			>
				{/* Header */}
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-foreground text-title-3">Новая категория</h3>
					<button
						type="button"
						className="rounded-full p-1 transition-colors hover:bg-accent/10"
						onClick={handleCancel}
					>
						<X className="h-5 w-5 text-foreground" />
					</button>
				</div>

				{/* Form */}
				<div className="rounded-xl border border-border bg-muted/50 p-4">
					{/* Name Input */}
					<input
						className="mb-3 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
						maxLength={30}
						onChange={(e) => setName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && name.trim() && !isSaving) {
								handleSave();
							}
							if (e.key === 'Escape') {
								handleCancel();
							}
						}}
						placeholder="Название категории"
						type="text"
						value={name}
					/>

					{/* Emoji Picker */}
					<div className="mb-3">
						<p className="mb-2 text-footnote text-muted-foreground">Выберите иконку</p>
						<div
							className="w-full gap-1"
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(7, 1fr)',
							}}
						>
							{EMOJI_OPTIONS.map((emoji) => (
								<button
									className={`rounded-lg p-2 text-3xl transition-colors ${
										icon === emoji ? 'bg-primary/20' : 'hover:bg-muted'
									}`}
									key={emoji}
									onClick={() => setIcon(emoji)}
									type="button"
								>
									{emoji}
								</button>
							))}
						</div>
					</div>

					{/* Buttons */}
					<div className="flex gap-2">
						<button
							type="button"
							className="flex-1 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
							disabled={isSaving || !name.trim()}
							onClick={handleSave}
						>
							{isSaving ? 'Сохранение...' : 'Сохранить'}
						</button>
						<button
							type="button"
							className="flex-1 rounded-xl bg-muted px-4 py-2.5 font-medium text-foreground transition-all hover:bg-muted/80"
							disabled={isSaving}
							onClick={handleCancel}
						>
							Отмена
						</button>
					</div>
				</div>
			</motion.div>
		</>
	);
}
