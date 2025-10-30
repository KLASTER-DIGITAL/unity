import { AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { TabsContent } from "@/shared/components/ui/tabs";
import type { Language, MissingTranslation } from "./types";

type MissingTabProps = {
	missingKeys: MissingTranslation[];
	languages: Language[];
};

/**
 * Missing Tab Component
 * Displays missing translations
 */
export function MissingTab({ missingKeys, languages }: MissingTabProps) {
	return (
		<TabsContent className="space-y-4" value="missing">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-destructive" />
						Пропущенные переводы
					</CardTitle>
					<CardDescription>
						Ключи, для которых отсутствуют переводы на некоторые языки
					</CardDescription>
				</CardHeader>
				<CardContent>
					{missingKeys.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							<CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" />
							<p className="font-medium">Все переводы заполнены!</p>
							<p className="text-sm">Нет пропущенных ключей</p>
						</div>
					) : (
						<div className="max-h-[600px] space-y-3 overflow-y-auto">
							{missingKeys.map((missing, index) => (
								<div
									className="rounded-lg border border-destructive/20 bg-destructive/5 p-4"
									key={index}
								>
									<div className="mb-2 flex items-start justify-between">
										<div className="font-medium font-mono text-sm">
											{missing.key}
										</div>
										<Badge variant="destructive">
											{missing.languages.length} языков
										</Badge>
									</div>
									<div className="flex flex-wrap gap-2">
										{missing.languages.map((langCode) => {
											const lang = languages.find((l) => l.code === langCode);
											return (
												<Badge key={langCode} variant="outline">
													{lang?.native_name || langCode}
												</Badge>
											);
										})}
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}
