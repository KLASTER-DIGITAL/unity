/**
 * Universal BottomSheet Component for UNITY-v2
 *
 * Features:
 * - Slide-up animation from bottom
 * - Backdrop with blur effect
 * - Swipe-down to close gesture
 * - Accessibility (Escape key, backdrop click)
 * - iOS-style design
 * - z-index hierarchy (above navigation)
 * - React Native ready (90%+ compatibility)
 *
 * Usage:
 * ```tsx
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Select Time"
 * >
 *   <div>Your content here</div>
 * </BottomSheet>
 * ```
 *
 * @author UNITY Team
 * @date 2025-10-19
 */

import { X } from 'lucide-react';
import { AnimatePresence, motion, type PanInfo, useMotionValue, useTransform } from 'motion/react';
import type React from 'react';
import { type ReactNode, useEffect, useRef } from 'react';
import { cn } from './utils';

export type BottomSheetProps = {
	/** Controls visibility of the bottom sheet */
	isOpen: boolean;

	/** Callback when bottom sheet should close */
	onClose: () => void;

	/** Optional title */
	title?: string;

	/** Optional description */
	description?: string;

	/** Content to display */
	children: ReactNode;

	/** Show close button in header */
	showCloseButton?: boolean;

	/** Enable swipe-down to close */
	enableSwipeDown?: boolean;

	/** Close on backdrop click */
	closeOnBackdrop?: boolean;

	/** Close on Escape key */
	closeOnEscape?: boolean;

	/** Custom className for content */
	className?: string;

	/** Custom header content */
	header?: ReactNode;

	/** Custom footer content */
	footer?: ReactNode;

	/** Maximum height (default: 90vh) */
	maxHeight?: string;

	/** Test ID for testing */
	testID?: string;
};

export function BottomSheet({
	isOpen,
	onClose,
	title,
	description,
	children,
	showCloseButton = true,
	enableSwipeDown = true,
	closeOnBackdrop = true,
	closeOnEscape = true,
	className,
	header,
	footer,
	maxHeight = '90vh',
	testID = 'bottom-sheet',
}: BottomSheetProps) {
	const sheetRef = useRef<HTMLDivElement>(null);
	const y = useMotionValue(0);
	const opacity = useTransform(y, [0, 300], [1, 0]);

	// Handle Escape key
	useEffect(() => {
		if (!(isOpen && closeOnEscape)) {
			return;
		}

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, closeOnEscape, onClose]);

	// Prevent body scroll when open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	// Handle swipe down
	const handleDragEnd = (_: any, info: PanInfo) => {
		if (!enableSwipeDown) {
			return;
		}

		// Close if dragged down more than 100px or velocity is high
		if (info.offset.y > 100 || info.velocity.y > 500) {
			onClose();
		}
	};

	// Handle backdrop click
	const handleBackdropClick = (e: React.MouseEvent) => {
		if (closeOnBackdrop && e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<AnimatePresence mode="sync">
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/40 backdrop-blur-sm"
						data-testid={`${testID}-backdrop`}
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={handleBackdropClick}
						style={{
							WebkitBackdropFilter: 'blur(8px)',
							backdropFilter: 'blur(8px)',
						}}
						transition={{ duration: 0.2 }}
					/>

					{/* Bottom Sheet */}
					<motion.div
						animate={{ y: 0 }}
						className={cn(
							'fixed right-0 bottom-0 left-0 z-[var(--z-modal)]',
							'border-border border-t bg-card',
							'rounded-t-3xl shadow-2xl',
							'mx-auto max-w-md',
							'flex flex-col',
							'transition-colors duration-300',
							className
						)}
						data-testid={testID}
						drag={enableSwipeDown ? 'y' : false}
						dragConstraints={{ top: 0, bottom: 0 }}
						dragElastic={{ top: 0, bottom: 0.5 }}
						exit={{ y: '100%' }}
						initial={{ y: '100%' }}
						onDragEnd={handleDragEnd}
						ref={sheetRef}
						style={{ y, opacity }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					>
						{/* Drag Handle */}
						{enableSwipeDown && (
							<div className="flex justify-center pt-3 pb-2">
								<div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
							</div>
						)}

						{/* Header */}
						{(title || description || header || showCloseButton) && (
							<div className="flex items-start justify-between border-border border-b px-6 py-4">
								<div className="flex-1">
									{header || (
										<>
											{title && <h2 className="font-semibold text-foreground text-lg">{title}</h2>}
											{description && (
												<p className="mt-1 font-normal text-muted-foreground text-sm">
													{description}
												</p>
											)}
										</>
									)}
								</div>

								{showCloseButton && (
									<button
										aria-label="Close"
										className={cn(
											'ml-4 rounded-full p-2',
											'text-muted-foreground hover:text-foreground',
											'hover:bg-muted/50 active:bg-muted',
											'transition-colors duration-200'
										)}
										data-testid={`${testID}-close-button`}
										onClick={onClose}
									>
										<X className="h-5 w-5" />
									</button>
								)}
							</div>
						)}

						{/* Content */}
						<div className="scrollbar-hide flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight }}>
							{children}
						</div>

						{/* Footer */}
						{footer && <div className="border-border border-t px-6 py-4">{footer}</div>}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

/**
 * BottomSheet Trigger Button
 * Helper component for opening bottom sheet
 */
export type BottomSheetTriggerProps = {
	onClick: () => void;
	children: ReactNode;
	className?: string;
};

export function BottomSheetTrigger({ onClick, children, className }: BottomSheetTriggerProps) {
	return (
		<button
			className={cn(
				'rounded-lg px-4 py-2',
				'bg-primary text-primary-foreground',
				'hover:bg-primary/90 active:bg-primary/80',
				'transition-colors duration-200',
				className
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

/**
 * BottomSheet Footer Actions
 * Helper component for footer buttons
 */
export type BottomSheetFooterProps = {
	onCancel?: () => void;
	onConfirm?: () => void;
	cancelText?: string;
	confirmText?: string;
	confirmDisabled?: boolean;
	className?: string;
};

export function BottomSheetFooter({
	onCancel,
	onConfirm,
	cancelText = 'Cancel',
	confirmText = 'Confirm',
	confirmDisabled = false,
	className,
}: BottomSheetFooterProps) {
	return (
		<div className={cn('flex gap-3', className)}>
			{onCancel && (
				<button
					className={cn(
						'flex-1 rounded-lg px-4 py-3',
						'bg-muted text-foreground',
						'hover:bg-muted/80 active:bg-muted/60',
						'transition-colors duration-200',
						'font-medium'
					)}
					onClick={onCancel}
				>
					{cancelText}
				</button>
			)}
			{onConfirm && (
				<button
					className={cn(
						'flex-1 rounded-lg px-4 py-3',
						'bg-primary text-primary-foreground',
						'hover:bg-primary/90 active:bg-primary/80',
						'transition-colors duration-200',
						'font-medium',
						'disabled:cursor-not-allowed disabled:opacity-50'
					)}
					disabled={confirmDisabled}
					onClick={onConfirm}
				>
					{confirmText}
				</button>
			)}
		</div>
	);
}
