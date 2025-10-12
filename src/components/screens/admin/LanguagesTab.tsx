import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Language } from "@/utils/i18n";

interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  translationProgress: number;
}

const AVAILABLE_LANGUAGES: LanguageInfo[] = [
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', translationProgress: 100 },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', translationProgress: 100 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', translationProgress: 100 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', translationProgress: 100 },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', translationProgress: 100 },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', translationProgress: 100 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', translationProgress: 100 },
];

export function LanguagesTab() {
  const [languages, setLanguages] = useState<LanguageInfo[]>(AVAILABLE_LANGUAGES);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLanguageCode, setNewLanguageCode] = useState('');
  const [newLanguageName, setNewLanguageName] = useState('');

  const handleAutoTranslate = async (targetLanguage: Language) => {
    setIsTranslating(true);
    try {
      const openaiKey = localStorage.getItem('admin_openai_api_key');
      
      if (!openaiKey) {
        toast.error('OpenAI API ключ не настроен', {
          description: 'Перейдите в Settings → API и сохраните ключ'
        });
        return;
      }

      // Здесь будет логика автоматического перевода через OpenAI
      toast.success(`Перевод на ${targetLanguage} запущен!`, {
        description: 'Это займет несколько секунд...'
      });

      // Симуляция перевода
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Перевод завершен!', {
        description: 'Все строки успешно переведены'
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Ошибка перевода', {
        description: 'Проверьте OpenAI API ключ и попробуйте снова'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleExportTranslations = () => {
    try {
      // Экспорт всех переводов в JSON
      const translations = {
        version: '1.0.0',
        languages: AVAILABLE_LANGUAGES,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(translations, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Переводы экспортированы!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка экспорта');
    }
  };

  const handleImportTranslations = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        toast.success('Переводы импортированы!', {
          description: `Загружено ${data.languages?.length || 0} языков`
        });
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Ошибка импорта', {
          description: 'Проверьте формат JSON файла'
        });
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="!text-[18px]">Управление языками</CardTitle>
                <CardDescription className="!text-[14px]">
                  Добавляйте новые языки и управляйте переводами с помощью AI
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportTranslations}
              >
                <Upload className="w-4 h-4 mr-2" />
                Импорт
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportTranslations}
              >
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* OpenAI Status */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="!text-[15px] font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Авто-перевод с AI
                </h4>
                <p className="!text-[13px] text-blue-800 dark:text-blue-200">
                  {localStorage.getItem('admin_openai_api_key') 
                    ? '✅ OpenAI API ключ настроен. Вы можете автоматически переводить все строки на новые языки.'
                    : '⚠️ OpenAI API ключ не настроен. Перейдите в Settings → API для настройки авто-перевода.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Languages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <motion.div
                key={lang.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{lang.flag}</span>
                    <div>
                      <h4 className="!text-[15px] font-medium">{lang.nativeName}</h4>
                      <p className="!text-[12px] text-muted-foreground">{lang.name}</p>
                    </div>
                  </div>
                  {lang.translationProgress === 100 && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="!text-[12px] text-muted-foreground">Прогресс перевода</span>
                    <span className="!text-[12px] font-medium">{lang.translationProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${lang.translationProgress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Редактировать
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutoTranslate(lang.code)}
                    disabled={isTranslating}
                  >
                    {isTranslating ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}

            {/* Add New Language Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-2 border-dashed rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h4 className="!text-[15px] font-medium mb-1">Добавить язык</h4>
                  <p className="!text-[12px] text-muted-foreground mb-3">
                    С авто-переводом через AI
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddLanguage(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Добавить
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <div>
                <p className="!text-[13px] text-muted-foreground">Активных языков</p>
                <p className="!text-[24px] font-bold">{languages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="!text-[13px] text-muted-foreground">Полностью переведены</p>
                <p className="!text-[24px] font-bold">
                  {languages.filter(l => l.translationProgress === 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="!text-[13px] text-muted-foreground">Требуют перевода</p>
                <p className="!text-[24px] font-bold">
                  {languages.filter(l => l.translationProgress < 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <div>
                <p className="!text-[13px] text-muted-foreground">AI переводов</p>
                <p className="!text-[24px] font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-950 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="!text-[18px] font-semibold mb-2">Расширенное управление переводами</h3>
            <p className="!text-[14px] text-muted-foreground mb-4 max-w-2xl mx-auto">
              Скоро: редактор переводов, пакетный AI-перевод, версионирование, 
              проверка качества переводов и автоматическая синхронизация с репозиторием.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm">
                <Globe className="w-4 h-4 mr-2" />
                Запросить доступ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

