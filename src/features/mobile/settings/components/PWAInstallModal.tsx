import { Apple, Chrome, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/shared/components/ui/universal/Dialog';

type PWAInstallModalProps = {
	open: boolean;
	onClose: () => void;
};

export function PWAInstallModal({ open, onClose }: PWAInstallModalProps) {
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
	const isAndroid = /Android/.test(navigator.userAgent);
	const isDesktop = !(isIOS || isAndroid);

	return (
		<Dialog onOpenChange={onClose} open={open}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Smartphone className="h-5 w-5" />
						Установить приложение
					</DialogTitle>
					<DialogDescription>
						Установите UNITY на ваше устройство для быстрого доступа
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 space-y-4">
					{isIOS && (
						<div className="space-y-3">
							<div className="flex items-center gap-2 text-primary">
								<Apple className="h-5 w-5" />
								<h3 className="font-semibold">iOS Safari</h3>
							</div>
							<ol className="space-y-2 text-foreground text-sm">
								<li className="flex gap-2">
									<span className="font-semibold">1.</span>
									<span>
										Нажмите кнопку <strong>"Поделиться"</strong> (квадрат со стрелкой вверх) внизу
										экрана
									</span>
								</li>
								<li className="flex gap-2">
									<span className="font-semibold">2.</span>
									<span>
										Прокрутите вниз и выберите <strong>"На экран Домой"</strong>
									</span>
								</li>
								<li className="flex gap-2">
									<span className="font-semibold">3.</span>
									<span>
										Нажмите <strong>"Добавить"</strong> в правом верхнем углу
									</span>
								</li>
							</ol>
							<div className="rounded-lg bg-primary/10 p-3 text-primary text-sm">
								💡 После установки приложение появится на главном экране
							</div>
						</div>
					)}

					{isAndroid && (
						<div className="space-y-3">
							<div className="flex items-center gap-2 text-green-700 dark:text-green-400">
								<Chrome className="h-5 w-5" />
								<h3 className="font-semibold">Android Chrome</h3>
							</div>
							<ol className="space-y-2 text-foreground text-sm">
								<li className="flex gap-2">
									<span className="font-semibold">1.</span>
									<span>
										Нажмите кнопку <strong>меню</strong> (три точки) в правом верхнем углу
									</span>
								</li>
								<li className="flex gap-2">
									<span className="font-semibold">2.</span>
									<span>
										Выберите <strong>"Установить приложение"</strong> или{' '}
										<strong>"Добавить на главный экран"</strong>
									</span>
								</li>
								<li className="flex gap-2">
									<span className="font-semibold">3.</span>
									<span>
										Нажмите <strong>"Установить"</strong> в появившемся окне
									</span>
								</li>
							</ol>
							<div className="rounded-lg bg-green-500/10 p-3 text-green-700 text-sm dark:text-green-400">
								💡 Приложение будет работать как обычное Android приложение
							</div>
						</div>
					)}

					{isDesktop && (
						<div className="space-y-3">
							<div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
								<Monitor className="h-5 w-5" />
								<h3 className="font-semibold">Desktop</h3>
							</div>
							<ol className="space-y-2 text-foreground text-sm">
								<li className="flex gap-2">
									<span className="font-semibold">1.</span>
									<span>
										Найдите иконку <strong>"Установить"</strong> в адресной строке браузера
									</span>
								</li>
								<li className="flex gap-2">
									<span className="font-semibold">2.</span>
									<span>
										Нажмите на иконку и выберите <strong>"Установить"</strong>
									</span>
								</li>
								<li className="flex gap-2">
									<span className="font-semibold">3.</span>
									<span>Приложение откроется в отдельном окне</span>
								</li>
							</ol>
							<div className="rounded-lg bg-purple-500/10 p-3 text-purple-700 text-sm dark:text-purple-400">
								💡 Вы можете закрепить приложение на панели задач
							</div>
						</div>
					)}

					<div className="border-t pt-4">
						<h4 className="mb-2 font-semibold text-sm">Преимущества установки:</h4>
						<ul className="space-y-1 text-muted-foreground text-sm">
							<li>✅ Быстрый доступ с главного экрана</li>
							<li>✅ Работает офлайн</li>
							<li>✅ Полноэкранный режим</li>
							<li>✅ Уведомления о новых достижениях</li>
						</ul>
					</div>
				</div>

				<div className="mt-6 flex justify-end gap-2">
					<Button onClick={onClose} variant="outline">
						Позже
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
