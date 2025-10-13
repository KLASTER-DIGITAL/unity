import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';
import { Pill, PillIndicator, PillStatus } from '../../ui/shadcn-io/pill';
import { 
  Download, 
  Upload, 
  Edit, 
  Plus, 
  Globe, 
  CheckCircle, 
  Languages,
  Settings,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Users,
  FileText,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

// Популярные языки с ISO кодами для выпадающего списка
const POPULAR_LANGUAGES = [
  { code: 'ar', name: 'Arabic', native_name: 'العربية', flag: '🇸🇦' },
  { code: 'bg', name: 'Bulgarian', native_name: 'Български', flag: '🇧🇬' },
  { code: 'cs', name: 'Czech', native_name: 'Čeština', flag: '🇨🇿' },
  { code: 'da', name: 'Danish', native_name: 'Dansk', flag: '🇩🇰' },
  { code: 'el', name: 'Greek', native_name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'et', name: 'Estonian', native_name: 'Eesti', flag: '🇪🇪' },
  { code: 'fi', name: 'Finnish', native_name: 'Suomi', flag: '🇫🇮' },
  { code: 'he', name: 'Hebrew', native_name: 'עברית', flag: '🇮🇱' },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hr', name: 'Croatian', native_name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'hu', name: 'Hungarian', native_name: 'Magyar', flag: '🇭🇺' },
  { code: 'id', name: 'Indonesian', native_name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'it', name: 'Italian', native_name: 'Italiano', flag: '🇮🇹' },
  { code: 'ko', name: 'Korean', native_name: '한국어', flag: '🇰🇷' },
  { code: 'lt', name: 'Lithuanian', native_name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'lv', name: 'Latvian', native_name: 'Latviešu', flag: '🇱🇻' },
  { code: 'nl', name: 'Dutch', native_name: 'Nederlands', flag: '🇳🇱' },
  { code: 'no', name: 'Norwegian', native_name: 'Norsk', flag: '🇳🇴' },
  { code: 'pl', name: 'Polish', native_name: 'Polski', flag: '🇵🇱' },
  { code: 'pt', name: 'Portuguese', native_name: 'Português', flag: '🇵🇹' },
  { code: 'ro', name: 'Romanian', native_name: 'Română', flag: '🇷🇴' },
  { code: 'sk', name: 'Slovak', native_name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', native_name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'sv', name: 'Swedish', native_name: 'Svenska', flag: '🇸🇪' },
  { code: 'th', name: 'Thai', native_name: 'ไทย', flag: '🇹🇭' },
  { code: 'tr', name: 'Turkish', native_name: 'Türkçe', flag: '🇹🇷' },
  { code: 'uk', name: 'Ukrainian', native_name: 'Українська', flag: '🇺🇦' },
  { code: 'vi', name: 'Vietnamese', native_name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ka', name: 'Georgian', native_name: 'ქართული', flag: '🇬🇪' }
];

interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag: string;
  is_active: boolean;
  translation_progress?: number;
  untranslated_count?: number;
}

interface Translation {
  id: string;
  lang_code: string;
  translation_key: string;
  translation_value: string;
}

interface LanguagesTabProps {
  className?: string;
}

export function LanguagesTab({ className }: LanguagesTabProps) {
  const [languages, setLanguages] = useState<Language[]>([
    { id: '1', code: 'ru', name: 'Russian', native_name: 'Русский', flag: '🇷🇺', is_active: true },
    { id: '2', code: 'en', name: 'English', native_name: 'English', flag: '🇬🇧', is_active: true },
    { id: '3', code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸', is_active: true },
    { id: '4', code: 'de', name: 'German', native_name: 'Deutsch', flag: '🇩🇪', is_active: true },
    { id: '5', code: 'fr', name: 'French', native_name: 'Français', flag: '🇫🇷', is_active: true },
    { id: '6', code: 'zh', name: 'Chinese', native_name: '中文', flag: '🇨🇳', is_active: true },
    { id: '7', code: 'ja', name: 'Japanese', native_name: '日本語', flag: '🇯🇵', is_active: true }
  ]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLanguageCode, setNewLanguageCode] = useState('');
  const [newLanguageName, setNewLanguageName] = useState('');
  const [newLanguageNativeName, setNewLanguageNativeName] = useState('');
  const [newLanguageFlag, setNewLanguageFlag] = useState('');
  const [editingTranslation, setEditingTranslation] = useState<{langCode: string, key: string, value: string} | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedLanguageFromList, setSelectedLanguageFromList] = useState<string>('');

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadLanguages(),
        loadTranslations()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLanguages = async () => {
    try {
      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/languages', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token') || '{}').access_token || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLanguages(data.languages || []);
      } else {
        console.error('Error loading languages:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const loadTranslations = async () => {
    try {
      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/translations', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token') || '{}').access_token || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTranslations(data.translations || []);
      } else {
        console.error('Error loading translations:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  };

  const calculateTranslationProgress = (langCode: string): number => {
    const langTranslations = translations.filter(t => t.lang_code === langCode);
    const totalKeys = 50; // Примерное количество ключей для перевода
    const translatedKeys = langTranslations.length;
    return Math.round((translatedKeys / totalKeys) * 100);
  };

  const getUntranslatedCount = (langCode: string): number => {
    const totalKeys = 50; // Примерное количество ключей для перевода
    const langTranslations = translations.filter(t => t.lang_code === langCode);
    return Math.max(0, totalKeys - langTranslations.length);
  };

  const getMissingTranslations = (langCode: string): string[] => {
    const allKeys = ['greeting', 'welcome', 'settings', 'profile', 'logout', 'save', 'cancel', 'edit', 'delete', 'add'];
    const langTranslations = translations.filter(t => t.lang_code === langCode);
    const translatedKeys = langTranslations.map(t => t.translation_key);
    return allKeys.filter(key => !translatedKeys.includes(key));
  };

  const handleLanguageSelect = (langCode: string) => {
    const selectedLang = POPULAR_LANGUAGES.find(lang => lang.code === langCode);
    if (selectedLang) {
      setNewLanguageCode(selectedLang.code);
      setNewLanguageName(selectedLang.name);
      setNewLanguageNativeName(selectedLang.native_name);
      setNewLanguageFlag(selectedLang.flag);
    }
  };

  const addLanguage = async () => {
    if (!newLanguageCode || !newLanguageName || !newLanguageNativeName || !newLanguageFlag) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    try {
      // Добавляем язык
      const languageResponse = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/languages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token') || '{}').access_token || ''}`
        },
        body: JSON.stringify({
          code: newLanguageCode,
          name: newLanguageName,
          native_name: newLanguageNativeName,
          flag: newLanguageFlag,
        }),
      });

      if (!languageResponse.ok) {
        const errorData = await languageResponse.json();
        throw new Error(errorData.error || 'Failed to add language');
      }

      const result = await languageResponse.json();
      console.log('Language added:', result);
      
      toast.success(`Язык ${newLanguageNativeName} добавлен!`);
      setShowAddLanguage(false);
      setSelectedLanguageFromList('');
      setNewLanguageCode('');
      setNewLanguageName('');
      setNewLanguageNativeName('');
      setNewLanguageFlag('');
      await loadData();
    } catch (error) {
      console.error('Error adding language:', error);
      toast.error('Ошибка добавления языка');
    }
  };

  const handleEditTranslation = (langCode: string, key: string, value: string) => {
    setEditingTranslation({ langCode, key, value });
    setEditValue(value);
  };

  const handleSaveTranslation = async () => {
    if (!editingTranslation) return;

    try {
      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token') || '{}').access_token || ''}`
        },
        body: JSON.stringify({
          lang_code: editingTranslation.langCode,
          translation_key: editingTranslation.key,
          translation_value: editValue,
        }),
      });

      if (response.ok) {
        toast.success('Перевод сохранен!');
        setEditingTranslation(null);
        setEditValue('');
        await loadTranslations();
      } else {
        throw new Error('Failed to save translation');
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      toast.error('Ошибка сохранения перевода');
    }
  };

  const handleCancelEdit = () => {
    setEditingTranslation(null);
    setEditValue('');
  };

  const exportTranslations = () => {
    const dataStr = JSON.stringify(translations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'translations.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка языков...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Заголовок и действия */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Управление языками
          </CardTitle>
          <CardDescription>
            Добавление новых языков и управление переводами
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={exportTranslations} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Импорт
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Доступные языки */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Доступные языки</CardTitle>
          <CardDescription>
            Управление переводами и добавление новых языков
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {languages.map((language) => {
              const progress = calculateTranslationProgress(language.code);
              const untranslatedCount = getUntranslatedCount(language.code);
              
              return (
                <div key={language.id} className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:bg-accent/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{language.flag}</span>
                      <div>
                        <h4 className="font-medium">{language.native_name}</h4>
                        <p className="text-sm text-muted-foreground">{language.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Прогресс перевода</div>
                        <div className="text-lg font-bold">{progress}%</div>
                        {untranslatedCount > 0 && (
                          <Pill variant="destructive" className="text-xs mt-1">
                            {untranslatedCount} непереведено
                          </Pill>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditTranslation(language.code, 'greeting', 'Hello World!')}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Редактировать
                        </Button>
                        {untranslatedCount > 0 && (
                          <Button 
                            size="sm" 
                            onClick={() => {/* autoTranslateLanguage(language.code) */}}
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            Авто-перевод
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Оповещение о непереведенных строках */}
                  {untranslatedCount > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2 mb-3">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-yellow-800">
                            <strong>{untranslatedCount} строк</strong> требуют перевода. 
                            Используйте авто-перевод через AI или переведите вручную.
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-yellow-800">Непереведенные ключи:</div>
                        <div className="flex flex-wrap gap-1">
                          {getMissingTranslations(language.code).slice(0, 5).map(key => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}
                            </Badge>
                          ))}
                          {getMissingTranslations(language.code).length > 5 && (
                            <div className="text-xs text-yellow-600">
                              И еще {getMissingTranslations(language.code).length - 5} строк...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Добавить язык */}
            <div className="group relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-card p-6 text-center transition-all hover:border-primary/50 hover:bg-accent/50">
              <Globe className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <h4 className="font-medium mb-1">Добавить язык</h4>
              <p className="text-sm text-muted-foreground mb-4">
                С авто-переводом через AI
              </p>
              
              {!showAddLanguage ? (
                <Button onClick={() => setShowAddLanguage(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              ) : (
                <div className="space-y-3 max-w-md mx-auto">
                  {/* Выпадающий список популярных языков */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Выберите язык из списка:</label>
                    <select
                      value={selectedLanguageFromList}
                      onChange={(e) => {
                        setSelectedLanguageFromList(e.target.value);
                        handleLanguageSelect(e.target.value);
                      }}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Выберите язык...</option>
                      {POPULAR_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.native_name} ({lang.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Ручной ввод */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Или введите вручную:</label>
                    <Input
                      placeholder="Код языка (например: ka)"
                      value={newLanguageCode}
                      onChange={(e) => setNewLanguageCode(e.target.value)}
                    />
                    <Input
                      placeholder="Название на английском"
                      value={newLanguageName}
                      onChange={(e) => setNewLanguageName(e.target.value)}
                    />
                    <Input
                      placeholder="Название на родном языке"
                      value={newLanguageNativeName}
                      onChange={(e) => setNewLanguageNativeName(e.target.value)}
                    />
                    <Input
                      placeholder="Флаг (эмодзи)"
                      value={newLanguageFlag}
                      onChange={(e) => setNewLanguageFlag(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <Button onClick={addLanguage}>
                      Добавить
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowAddLanguage(false);
                        setSelectedLanguageFromList('');
                        setNewLanguageCode('');
                        setNewLanguageName('');
                        setNewLanguageNativeName('');
                        setNewLanguageFlag('');
                      }}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Статистика переводов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md hover:bg-accent/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">
                  {languages.length}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Активных языков</div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md hover:bg-accent/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {languages.filter(l => calculateTranslationProgress(l.code) === 100).length}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Полностью переведены</div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md hover:bg-accent/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">
                  {languages.reduce((sum, l) => sum + getUntranslatedCount(l.code), 0)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Требуют перевода</div>
            </div>
            
            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md hover:bg-accent/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">
                  {translations.length}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Всего переводов</div>
            </div>
          </div>
          
          {/* Детальная статистика по языкам */}
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Детальная статистика по языкам:</h4>
            {languages.map(language => {
              const progress = calculateTranslationProgress(language.code);
              const untranslatedCount = getUntranslatedCount(language.code);
              
              return (
                <div key={language.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{language.flag}</span>
                    <span className="font-medium">{language.native_name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {progress}% ({50 - untranslatedCount}/50)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Модальное окно редактирования перевода */}
      <Dialog open={!!editingTranslation} onOpenChange={() => setEditingTranslation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать перевод</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingTranslation && (
              <>
                <div>
                  <label className="text-sm font-medium">Ключ:</label>
                  <p className="text-sm text-muted-foreground">{editingTranslation.key}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Язык:</label>
                  <p className="text-sm text-muted-foreground">{editingTranslation.langCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Перевод:</label>
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Введите перевод..."
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Отмена
            </Button>
            <Button onClick={handleSaveTranslation}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}