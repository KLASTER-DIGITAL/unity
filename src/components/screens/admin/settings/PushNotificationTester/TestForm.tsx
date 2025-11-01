import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface TestFormProps {
	testTitle: string;
	testBody: string;
	isSending: boolean;
	lastResult: 'success' | 'error' | null;
	isSupported: boolean;
	onTitleChange: (value: string) => void;
	onBodyChange: (value: string) => void;
	onSendTest: () => void;
}

export function TestForm({
	testTitle,
	testBody,
	isSending,
	lastResult,
	isSupported,
	onTitleChange,
	onBodyChange,
	onSendTest,
}: TestFormProps) {
	return (
		<div className="space-y-4 rounded-lg border p-4">
			<div className="font-medium text-sm">Отправить тестовое уведомление</div>

			<div className="space-y-3">
				<div>
					<Label htmlFor="test-title">Заголовок</Label>
					<Input
						id="test-title"
						value={testTitle}
						onChange={(e) => onTitleChange(e.target.value)}
						placeholder="Заголовок уведомления"
						disabled={!isSupported || isSending}
					/>
				</div>

				<div>
					<Label htmlFor="test-body">Текст</Label>
					<Input
						id="test-body"
						value={testBody}
						onChange={(e) => onBodyChange(e.target.value)}
						placeholder="Текст уведомления"
						disabled={!isSupported || isSending}
					/>
				</div>

				<Button
					onClick={onSendTest}
					disabled={!isSupported || isSending}
					className="w-full"
					size="sm"
				>
					{isSending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Отправка...
						</>
					) : (
						'Отправить тестовое уведомление'
					)}
				</Button>

				{lastResult === 'success' && (
					<div className="flex items-center gap-2 rounded bg-green-50 p-2 text-green-700 text-sm dark:bg-green-950/20 dark:text-green-300">
						<CheckCircle className="h-4 w-4" />
						Уведомление успешно отправлено!
					</div>
				)}

				{lastResult === 'error' && (
					<div className="flex items-center gap-2 rounded bg-red-50 p-2 text-red-700 text-sm dark:bg-red-950/20 dark:text-red-300">
						<AlertCircle className="h-4 w-4" />
						Ошибка отправки уведомления
					</div>
				)}
			</div>
		</div>
	);
}
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
