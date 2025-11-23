/**
 * Модальное окно "Что нового"
 *
 * Показывается при обновлении приложения или по запросу пользователя
 */

import { AlertTriangle, CheckCircle2, Sparkles, Wrench, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { useTranslation } from '@/shared/lib/i18n';
import {
	type ChangelogEntry,
	getAllChangelog,
	getChangelogAfterVersion,
} from '@/shared/lib/version/changelog';

type WhatsNewModalProps = {
	isOpen: boolean;
	onClose: () => void;
	previousVersion?: string;
};

export function WhatsNewModal({ isOpen, onClose, previousVersion }: WhatsNewModalProps) {
	const { t } = useTranslation();

	// Получаем changelog:
	// - Если указана previousVersion - показываем только изменения после неё
	// - Если previousVersion не указана - показываем ВСЕ изменения
	const changelogEntries = previousVersion
		? getChangelogAfterVersion(previousVersion)
		: getAllChangelog();

	if (!isOpen || changelogEntries.length === 0) {
		return null;
	}

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={onClose}
					/>

					{/* Modal */}
					<motion.div
						animate={{ opacity: 1, scale: 1, y: 0 }}
						className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2"
						exit={{ opacity: 0, scale: 0.95, y: -20 }}
						initial={{ opacity: 0, scale: 0.95, y: -20 }}
					>
						<Card className="border-border bg-card shadow-2xl">
							<CardHeader className="border-b border-border pb-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
											<Sparkles className="h-5 w-5 text-accent" />
										</div>
										<CardTitle className="text-xl">
											{t('version.whats_new', 'Что нового')}
										</CardTitle>
									</div>
									<Button onClick={onClose} size="icon" variant="ghost" className="h-8 w-8">
										<X className="h-4 w-4" />
									</Button>
								</div>
							</CardHeader>

							<CardContent className="p-0">
								<ScrollArea className="h-[60vh] max-h-[500px]">
									<div className="p-6 space-y-6">
										{changelogEntries.map((entry, index) => (
											<VersionEntry key={entry.version} entry={entry} isFirst={index === 0} />
										))}
									</div>
								</ScrollArea>

								<div className="border-t border-border p-4">
									<Button onClick={onClose} className="w-full" size="lg">
										{t('common.close', 'Закрыть')}
									</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

function VersionEntry({ entry, isFirst }: { entry: ChangelogEntry; isFirst: boolean }) {
	return (
		<div className="space-y-4">
			{/* Version Header */}
			<div className="flex items-center gap-3">
				<Badge variant={isFirst ? 'default' : 'secondary'} className="text-sm font-semibold">
					v{entry.version}
				</Badge>
				<span className="text-sm text-muted-foreground">{entry.date}</span>
			</div>

			{/* Features */}
			{entry.features.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
						<Sparkles className="h-4 w-4 text-accent" />
						<span>{'Новые возможности'}</span>
					</div>
					<ul className="ml-6 space-y-1.5">
						{entry.features.map((feature) => (
							<li key={feature} className="text-sm text-muted-foreground list-disc">
								{feature}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Improvements */}
			{entry.improvements.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
						<CheckCircle2 className="h-4 w-4 text-green-500" />
						<span>{'Улучшения'}</span>
					</div>
					<ul className="ml-6 space-y-1.5">
						{entry.improvements.map((improvement) => (
							<li key={improvement} className="text-sm text-muted-foreground list-disc">
								{improvement}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Fixes */}
			{entry.fixes.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
						<Wrench className="h-4 w-4 text-blue-500" />
						<span>{'Исправления'}</span>
					</div>
					<ul className="ml-6 space-y-1.5">
						{entry.fixes.map((fix) => (
							<li key={fix} className="text-sm text-muted-foreground list-disc">
								{fix}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Breaking Changes */}
			{entry.breaking && entry.breaking.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
						<AlertTriangle className="h-4 w-4 text-orange-500" />
						<span>{'Критические изменения'}</span>
					</div>
					<ul className="ml-6 space-y-1.5">
						{entry.breaking.map((breaking) => (
							<li key={breaking} className="text-sm text-orange-500 list-disc">
								{breaking}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Separator */}
			<Separator className="my-4" />
		</div>
	);
}
