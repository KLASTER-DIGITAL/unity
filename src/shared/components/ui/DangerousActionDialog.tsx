/**
 * DangerousActionDialog - Universal confirmation dialog for dangerous actions
 *
 * Security features:
 * - Optional typing confirmation (requires typing specific text)
 * - Optional countdown before action is enabled
 * - Clear warning about action consequences
 * - Customizable title, description, and confirm text
 *
 * Usage:
 * ```tsx
 * <DangerousActionDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onConfirm={handleDelete}
 *   title="Delete Template?"
 *   description="This action cannot be undone."
 *   confirmText="DELETE"
 *   countdown={3}
 * />
 * ```
 */

import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Input } from '@/shared/components/ui/input';

export interface DangerousActionDialogProps {
	/** Whether the dialog is open */
	open: boolean;
	/** Callback when dialog open state changes */
	onOpenChange: (open: boolean) => void;
	/** Callback when action is confirmed */
	onConfirm: () => void | Promise<void>;
	/** Dialog title */
	title: string;
	/** Dialog description (can be string or React node) */
	description: React.ReactNode;
	/** Text that user must type to confirm (optional) */
	confirmText?: string;
	/** Countdown in seconds before action is enabled (optional) */
	countdown?: number;
	/** Confirm button text (default: "Confirm") */
	confirmButtonText?: string;
	/** Cancel button text (default: "Cancel") */
	cancelButtonText?: string;
	/** Additional details to show (optional) */
	details?: React.ReactNode;
}

export function DangerousActionDialog({
	open,
	onOpenChange,
	onConfirm,
	title,
	description,
	confirmText,
	countdown: initialCountdown = 0,
	confirmButtonText = 'Подтвердить',
	cancelButtonText = 'Отмена',
	details,
}: DangerousActionDialogProps) {
	const [typedText, setTypedText] = useState('');
	const [countdown, setCountdown] = useState(initialCountdown);
	const [isConfirming, setIsConfirming] = useState(false);

	// Reset state when dialog opens
	useEffect(() => {
		if (open) {
			setTypedText('');
			setCountdown(initialCountdown);
			setIsConfirming(false);
		}
	}, [open, initialCountdown]);

	// Countdown timer
	useEffect(() => {
		if (!open || countdown === 0) return;

		const timer = setTimeout(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [open, countdown]);

	// Check if confirmation is valid
	const isConfirmValid =
		countdown === 0 && (!confirmText || typedText === confirmText) && !isConfirming;

	const handleConfirm = async () => {
		if (!isConfirmValid) return;

		setIsConfirming(true);
		try {
			await onConfirm();
			onOpenChange(false);
		} catch (error) {
			console.error('[DangerousActionDialog] Error:', error);
		} finally {
			setIsConfirming(false);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
				<AlertDialogHeader>
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="h-6 w-6 text-destructive" />
					</div>
					<AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
					<AlertDialogDescription className="space-y-3 text-center">
						{typeof description === 'string' ? <p>{description}</p> : description}
						{details && <div className="text-left text-sm">{details}</div>}
					</AlertDialogDescription>
				</AlertDialogHeader>

				{confirmText && (
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="confirm-input">
								Введите <span className="font-mono text-destructive">{confirmText}</span> для
								подтверждения:
							</label>
							<Input
								autoComplete="off"
								className="font-mono"
								disabled={isConfirming}
								id="confirm-input"
								onChange={(e) => setTypedText(e.target.value)}
								placeholder={confirmText}
								value={typedText}
							/>
						</div>

						{countdown > 0 && (
							<p className="text-center text-sm text-muted-foreground">
								Подождите {countdown} сек...
							</p>
						)}
					</div>
				)}

				{!confirmText && countdown > 0 && (
					<p className="text-center text-sm text-muted-foreground">Подождите {countdown} сек...</p>
				)}

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isConfirming}>{cancelButtonText}</AlertDialogCancel>
					<AlertDialogAction
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						disabled={!isConfirmValid}
						onClick={handleConfirm}
					>
						{isConfirming ? 'Выполнение...' : confirmButtonText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
