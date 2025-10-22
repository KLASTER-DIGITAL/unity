import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import {
  Search,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  Languages as LanguagesIcon,
  Sparkles
} from 'lucide-react';

interface Translation {
  translation_key: string;
  lang_code: string;
  translation_value: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
  enabled: boolean;
}

interface MissingTranslation {
  key: string;
  languages: string[];
}

interface TranslationsManagementTabProps {
  initialLanguage?: string;
}

export function TranslationsManagementTab({ initialLanguage }: TranslationsManagementTabProps = {}) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [missingKeys, setMissingKeys] = useState<MissingTranslation[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage || 'ru');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('translations');
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslateSource, setAutoTranslateSource] = useState<string>('ru');
  const [autoTranslateTargets, setAutoTranslateTargets] = useState<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  // Update selected language when initialLanguage prop changes
  useEffect(() => {
    if (initialLanguage) {
      setSelectedLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadTranslations(),
        loadLanguages(),
        loadMissingKeys()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTranslations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Ошибка авторизации');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTranslations(data.translations || []);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка загрузки переводов');
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      toast.error('Ошибка соединения с сервером');
    }
  };

  const loadLanguages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management/languages`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLanguages(data.languages || []);
      }
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const loadMissingKeys = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management/missing`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMissingKeys(data.missing || []);
      }
    } catch (error) {
      console.error('Error loading missing keys:', error);
    }
  };

  const handleSaveTranslation = async () => {
    if (!editingKey || !editValue.trim()) {
      toast.error('Введите текст перевода');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Ошибка авторизации');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            translation_key: editingKey,
            lang_code: selectedLanguage,
            translation_value: editValue
          })
        }
      );

      if (response.ok) {
        await loadTranslations();
        setEditingKey(null);
        setEditValue('');
        toast.success('Перевод сохранен! 🌍');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      toast.error('Ошибка соединения с сервером');
    }
  };

  const handleAutoTranslate = async () => {
    if (!autoTranslateSource || autoTranslateTargets.length === 0) {
      toast.error('Выберите исходный язык и целевые языки');
      return;
    }

    setIsTranslating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Ошибка авторизации');
        return;
      }

      toast.info('Запуск автоперевода... ⏳');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-translate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sourceLanguage: autoTranslateSource,
            targetLanguages: autoTranslateTargets
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        await loadData(); // Reload all data
        toast.success(
          `✅ ${data.message}\nСтоимость: $${data.totalCost}`,
          { duration: 5000 }
        );
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка автоперевода');
      }
    } catch (error) {
      console.error('Error auto-translating:', error);
      toast.error('Ошибка соединения с сервером');
    } finally {
      setIsTranslating(false);
    }
  };

  const filteredTranslations = translations
    .filter(t => t.lang_code === selectedLanguage)
    .filter(t => 
      searchQuery === '' || 
      t.translation_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.translation_value.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const uniqueKeys = [...new Set(translations.map(t => t.translation_key))];
  const translationStats = {
    totalKeys: uniqueKeys.length,
    totalTranslations: translations.length,
    missingCount: missingKeys.reduce((sum, mk) => sum + mk.languages.length, 0),
    completeness: languages.length > 0 
      ? Math.round((translations.length / (uniqueKeys.length * languages.length)) * 100)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Управление переводами</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Редактирование и управление переводами приложения
          </p>
        </div>
        <Button onClick={loadData} disabled={isLoading} variant="outline">
          {isLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Загрузка...</>
          ) : (
            <>🔄 Обновить</>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Всего ключей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{translationStats.totalKeys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Переводов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{translationStats.totalTranslations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Пропущено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-destructive">{translationStats.missingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Полнота</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-accent">{translationStats.completeness}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="translations">
            <LanguagesIcon className="w-4 h-4 mr-2" />
            Переводы
          </TabsTrigger>
          <TabsTrigger value="missing">
            <AlertCircle className="w-4 h-4 mr-2" />
            Пропущенные ({missingKeys.length})
          </TabsTrigger>
          <TabsTrigger value="auto-translate">
            <Sparkles className="w-4 h-4 mr-2" />
            Автоперевод AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="translations" className="space-y-4">
          {/* Language Selector & Search */}
          <div className="flex gap-4">
            <div className="flex gap-2 flex-wrap">
              {languages.filter(l => l.enabled).map(lang => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLanguage(lang.code)}
                >
                  {lang.native_name}
                </Button>
              ))}
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по ключу или значению..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Translations List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Переводы для {languages.find(l => l.code === selectedLanguage)?.native_name}
              </CardTitle>
              <CardDescription>
                Найдено: {filteredTranslations.length} из {uniqueKeys.length} ключей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredTranslations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Переводы не найдены</p>
                  </div>
                ) : (
                  filteredTranslations.map((translation) => (
                    <div
                      key={`${translation.translation_key}-${translation.lang_code}`}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-mono text-sm text-muted-foreground mb-1">
                            {translation.translation_key}
                          </div>
                          {translation.category && (
                            <Badge variant="outline" className="text-xs mb-2">
                              {translation.category}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="secondary">{translation.lang_code.toUpperCase()}</Badge>
                      </div>

                      {editingKey === translation.translation_key ? (
                        <div className="space-y-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="Введите перевод..."
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveTranslation}>
                              <Save className="w-4 h-4 mr-1" />
                              Сохранить
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingKey(null);
                                setEditValue('');
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Отмена
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-foreground flex-1 mr-4">
                            {translation.translation_value}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingKey(translation.translation_key);
                              setEditValue(translation.translation_value);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Пропущенные переводы
              </CardTitle>
              <CardDescription>
                Ключи, для которых отсутствуют переводы на некоторые языки
              </CardDescription>
            </CardHeader>
            <CardContent>
              {missingKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="font-medium">Все переводы заполнены!</p>
                  <p className="text-sm">Нет пропущенных ключей</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {missingKeys.map((missing, index) => (
                    <div
                      key={index}
                      className="p-4 border border-destructive/20 rounded-lg bg-destructive/5"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-mono text-sm font-medium">{missing.key}</div>
                        <Badge variant="destructive">
                          {missing.languages.length} языков
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {missing.languages.map(langCode => {
                          const lang = languages.find(l => l.code === langCode);
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
                        onClick={() => {
                          setAutoTranslateTargets(prev =>
                            prev.includes(lang.code)
                              ? prev.filter(c => c !== lang.code)
                              : [...prev, lang.code]
                          );
                        }}
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
      </Tabs>
    </div>
  );
}

