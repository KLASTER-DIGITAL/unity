import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { TabsContent } from '@/shared/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { AlertCircle, Loader2, Sparkles } from 'lucide-react';
import type { Language } from './types';

interface AutoTranslateTabProps {
  languages: Language[];
  onAutoTranslate: (sourceLanguage: string, targetLanguages: string[]) => Promise<void>;
}

/**
 * Auto Translate Tab Component
 * AI-powered automatic translation interface
 */
export function AutoTranslateTab({ languages, onAutoTranslate }: AutoTranslateTabProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslateSource, setAutoTranslateSource] = useState<string>('ru');
  const [autoTranslateTargets, setAutoTranslateTargets] = useState<string[]>([]);

  const handleAutoTranslate = async () => {
    setIsTranslating(true);
    try {
      await onAutoTranslate(autoTranslateSource, autoTranslateTargets);
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleTargetLanguage = (code: string) => {
    setAutoTranslateTargets(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  return (
    <TabsContent value="auto-translate" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Автоматический перевод через AI
          </CardTitle>
          <CardDescription>
            Используйте GPT-4o-mini для автоматического перевода пропущенных ключей
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source Language */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Исходный язык</label>
            <Select value={autoTranslateSource} onValueChange={setAutoTranslateSource}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите исходный язык" />
              </SelectTrigger>
              <SelectContent>
                {languages.filter(l => l.enabled).map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.native_name} ({lang.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Languages */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Целевые языки</label>
            <div className="flex flex-wrap gap-2">
              {languages
                .filter(l => l.enabled && l.code !== autoTranslateSource)
                .map(lang => (
                  <Button
                    key={lang.code}
                    variant={autoTranslateTargets.includes(lang.code) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTargetLanguage(lang.code)}
                  >
                    {lang.native_name}
                  </Button>
                ))}
            </div>
            {autoTranslateTargets.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Выбрано языков: {autoTranslateTargets.length}
              </p>
            )}
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Как работает автоперевод:
                </p>
                <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                  <li>Переводятся только пропущенные ключи (не перезаписывает существующие)</li>
                  <li>Используется модель GPT-4o-mini ($0.15/1M входных токенов)</li>
                  <li>Обработка батчами по 10 ключей за раз</li>
                  <li>Стоимость логируется в таблицу openai_usage</li>
                  <li>Сохраняются эмодзи и специальные символы</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleAutoTranslate}
            disabled={isTranslating || !autoTranslateSource || autoTranslateTargets.length === 0}
            className="w-full"
            size="lg"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Перевод в процессе...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Запустить автоперевод
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

