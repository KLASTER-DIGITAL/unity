/**
 * DeleteAllDataDialog - Confirmation dialog for deleting all user data
 *
 * Security features:
 * - Requires typing "DELETE" to confirm
 * - 5 second countdown before action is enabled
 * - Clear warning about irreversible action
 * - Email notification after deletion
 */

import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { createClient } from '@/utils/supabase/client';

type DeleteAllDataDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	userEmail: string;
};

export function DeleteAllDataDialog({
	open,
	onOpenChange,
	userId,
	userEmail,
}: DeleteAllDataDialogProps) {
	const [confirmText, setConfirmText] = useState('');
	const [countdown, setCountdown] = useState(5);
	const [isDeleting, setIsDeleting] = useState(false);

	// Reset state when dialog opens
	useEffect(() => {
		if (open) {
			setConfirmText('');
			setCountdown(5);
			setIsDeleting(false);
		}
	}, [open]);

	// Countdown timer
	useEffect(() => {
		if (!open || countdown === 0) return;

		const timer = setTimeout(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [open, countdown]);

	const isConfirmValid = confirmText === 'DELETE' && countdown === 0;

	const handleDelete = async () => {
		if (!isConfirmValid) return;

		setIsDeleting(true);

		try {
			const supabase = createClient();

			// Delete all user entries
			const { error: entriesError } = await supabase.from('entries').delete().eq('user_id', userId);

			if (entriesError) throw entriesError;

			// Delete user profile data (keep account but reset data)
			const { error: profileError } = await supabase
				.from('profiles')
				.update({
					avatar_url: null,
					bio: null,
					// Keep email, name, language, theme
				})
				.eq('id', userId);

			if (profileError) throw profileError;

			// Send email notification (optional - через Edge Function)
			try {
				await fetch('/functions/v1/send-notification', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId,
						email: userEmail,
						type: 'data_deleted',
						message: 'Все ваши данные были успешно удалены из UNITY.',
					}),
				});
			} catch (emailError) {
				console.error('[DeleteAllDataDialog] Email notification failed:', emailError);
				// Don't throw - email is optional
			}

			toast.success('Все данные успешно удалены');
			onOpenChange(false);

			// Reload page to reflect changes
			setTimeout(() => {
				window.location.reload();
			}, 1000);
		} catch (error) {
			console.error('[DeleteAllDataDialog] Error deleting data:', error);
			toast.error('Ошибка удаления данных. Попробуйте позже.');
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
				<AlertDialogHeader>
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="h-6 w-6 text-destructive" />
					</div>
					<AlertDialogTitle className="text-center">Удалить все данные?</AlertDialogTitle>
					<AlertDialogDescription className="space-y-3 text-center">
						<p className="font-semibold text-destructive">⚠️ Это действие необратимо!</p>
						<p>Будут удалены:</p>
						<ul className="space-y-1 text-left text-sm">
							<li>• Все записи дневника</li>
							<li>• История настроений</li>
							<li>• AI анализ и инсайты</li>
							<li>• Достижения и статистика</li>
						</ul>
						<p className="text-xs text-muted-foreground">
							Ваш аккаунт и подписка останутся активными
						</p>
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="confirm-input">
							Введите <span className="font-mono text-destructive">DELETE</span> для подтверждения:
						</label>
						<Input
							autoComplete="off"
							className="font-mono"
							disabled={isDeleting}
							id="confirm-input"
							onChange={(e) => setConfirmText(e.target.value)}
							placeholder="DELETE"
							value={confirmText}
						/>
					</div>

					{countdown > 0 && (
						<p className="text-center text-sm text-muted-foreground">
							Подождите {countdown} сек...
						</p>
					)}
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
					<AlertDialogAction
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						disabled={!isConfirmValid || isDeleting}
						onClick={handleDelete}
					>
						{isDeleting ? 'Удаление...' : 'Удалить все данные'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
