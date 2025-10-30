import type React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from './useTranslation';

export const I18nTestComponent: React.FC = () => {
	const { t, currentLanguage, changeLanguage, isLoading, error, isLoaded } = useTranslation();

	const testKeys = [
		'welcome_title',
		'start_button',
		'home',
		'settings',
		'language',
		'loading_translations',
		'translation_error',
		'retry',
		'cancel_button',
	];

	return (
		<div className="mx-auto max-w-4xl space-y-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span>i18n System Test</span>
						<div className="flex items-center gap-2">
							<Badge variant={isLoaded ? 'default' : 'secondary'}>
								{isLoaded ? 'Loaded' : 'Loading'}
							</Badge>
							{isLoading && <Badge variant="outline">Loading...</Badge>}
							{error && <Badge variant="destructive">Error</Badge>}
						</div>
					</CardTitle>
					<CardDescription>Test component for the new internationalization system</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<h3 className="mb-2 font-medium text-lg">Language Selector</h3>
						<LanguageSelector showFlag={true} showNativeName={true} variant="dropdown" />
					</div>

					<Separator />

					<div>
						<h3 className="mb-2 font-medium text-lg">Current Language</h3>
						<p className="text-muted-foreground text-sm">
							{currentLanguage} ({isLoaded ? 'Translations loaded' : 'Loading translations...'})
						</p>
					</div>

					<Separator />

					<div>
						<h3 className="mb-2 font-medium text-lg">Test Translations</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{testKeys.map((key) => (
								<div className="rounded border p-3" key={key}>
									<div className="mb-1 font-mono text-muted-foreground text-xs">{key}</div>
									<div className="text-sm">{t(key as any, `[${key}]`)}</div>
								</div>
							))}
						</div>
					</div>

					<Separator />

					<div>
						<h3 className="mb-2 font-medium text-lg">Actions</h3>
						<div className="flex flex-wrap gap-2">
							<Button onClick={() => changeLanguage('ru')} size="sm" variant="outline">
								Switch to Russian
							</Button>
							<Button onClick={() => changeLanguage('en')} size="sm" variant="outline">
								Switch to English
							</Button>
							<Button onClick={() => changeLanguage('es')} size="sm" variant="outline">
								Switch to Spanish
							</Button>
						</div>
					</div>

					{error && (
						<>
							<Separator />
							<div>
								<h3 className="mb-2 font-medium text-lg text-red-500">Error</h3>
								<p className="text-red-500 text-sm">{error}</p>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
