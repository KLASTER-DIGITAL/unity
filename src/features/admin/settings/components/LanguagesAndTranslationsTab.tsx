import { BarChart3, FileText, Languages } from "lucide-react";
import { useState } from "react";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/shared/components/ui/tabs";
import { LanguagesManagementContent } from "./languages/LanguagesManagementContent";
import { TranslationsManagementContent } from "./languages/TranslationsManagementContent";
import { TranslationsStatisticsContent } from "./languages/TranslationsStatisticsContent";

type LanguagesAndTranslationsTabProps = {
	initialLanguage?: string;
};

export function LanguagesAndTranslationsTab({
	initialLanguage,
}: LanguagesAndTranslationsTabProps = {}) {
	const [activeTab, setActiveTab] = useState("languages");
	const [selectedLanguageForTranslations, setSelectedLanguageForTranslations] =
		useState<string>(initialLanguage || "ru");

	const handleNavigateToTranslations = (languageCode: string) => {
		setSelectedLanguageForTranslations(languageCode);
		setActiveTab("translations");
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="flex items-center gap-2 font-bold text-2xl">
					<Languages className="h-6 w-6" />
					Языки и переводы
				</h2>
				<p className="mt-1 text-muted-foreground text-sm">
					Управление языками приложения и переводами интерфейса
				</p>
			</div>

			{/* Tabs */}
			<Tabs onValueChange={setActiveTab} value={activeTab}>
				<TabsList className="grid w-full max-w-2xl grid-cols-3">
					<TabsTrigger className="flex items-center gap-2" value="languages">
						<Languages className="h-4 w-4" />
						Языки
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="translations">
						<FileText className="h-4 w-4" />
						Переводы
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="statistics">
						<BarChart3 className="h-4 w-4" />
						Статистика
					</TabsTrigger>
				</TabsList>

				<TabsContent className="mt-6" value="languages">
					<LanguagesManagementContent
						onNavigateToTranslations={handleNavigateToTranslations}
					/>
				</TabsContent>

				<TabsContent className="mt-6" value="translations">
					<TranslationsManagementContent
						initialLanguage={selectedLanguageForTranslations}
					/>
				</TabsContent>

				<TabsContent className="mt-6" value="statistics">
					<TranslationsStatisticsContent />
				</TabsContent>
			</Tabs>
		</div>
	);
}
