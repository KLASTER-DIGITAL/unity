import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Progress } from '@/shared/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { createClient } from '@/utils/supabase/client';
import {
  Languages as LanguagesIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Globe,
  Sparkles
} from 'lucide-react';

interface Language {
  code: string;
  name: string;
  native_name: string;
  flag?: string;
  is_active: boolean;
  translation_count?: number;
  total_keys?: number;
  progress?: number;
}

interface NewLanguageForm {
  code: string;
  name: string;
  native_name: string;
  flag: string;
  is_active: boolean;
}

interface LanguagesManagementTabProps {
  onNavigateToTranslations?: (languageCode: string) => void;
}

export function LanguagesManagementTab({ onNavigateToTranslations }: LanguagesManagementTabProps = {}) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLanguage, setNewLanguage] = useState<NewLanguageForm>({
    code: '',
    name: '',
    native_name: '',
    flag: '',
    is_active: true
  });

  const supabase = createClient();

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Ошибка авторизации');
        return;
      }

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
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка загрузки языков');
      }
    } catch (error) {
      console.error('Error loading languages:', error);
      toast.error('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.code || !newLanguage.name || !newLanguage.native_name) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Ошибка авторизации');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management/language`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newLanguage)
        }
      );

      if (response.ok) {
        await loadLanguages();
        setIsAddDialogOpen(false);
        setNewLanguage({
          code: '',
          name: '',
          native_name: '',
          flag: '',
          is_active: true
        });
        toast.success('Язык успешно добавлен! 🌍');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка добавления языка');
      }
    } catch (error) {
      console.error('Error adding language:', error);
      toast.error('Ошибка соединения с сервером');
    }
  };

  const handleToggleLanguage = async (code: string, currentStatus: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Ошибка авторизации');
        return;
      }

      const language = languages.find(l => l.code === code);
      if (!language) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management/language`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: language.code,
            name: language.name,
            native_name: language.native_name,
            flag: language.flag,
            is_active: !currentStatus
          })
        }
      );

      if (response.ok) {
        await loadLanguages();
        toast.success(`Язык ${!currentStatus ? 'активирован' : 'деактивирован'}! 🌍`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка обновления языка');
      }
    } catch (error) {
      console.error('Error toggling language:', error);
      toast.error('Ошибка соединения с сервером');
    }
  };

  const handleNavigateToTranslations = (languageCode: string) => {
    if (onNavigateToTranslations) {
      onNavigateToTranslations(languageCode);
      toast.success(`Переход к переводам для языка: ${languageCode.toUpperCase()}`);
    } else {
      toast.info(`Переход к переводам для языка: ${languageCode}`);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const totalKeys = languages[0]?.total_keys || 0;
  const activeLanguages = languages.filter(l => l.is_active);
  const inactiveLanguages = languages.filter(l => !l.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Управление языками
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Добавляйте языки, отслеживайте прогресс переводов и управляйте локализацией
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить язык
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новый язык</DialogTitle>
              <DialogDescription>
                Заполните информацию о новом языке для добавления в систему
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Код языка (ISO 639-1) *</Label>
                <Input
                  id="code"
                  placeholder="ru, en, es..."
                  value={newLanguage.code}
                  onChange={(e) => setNewLanguage({ ...newLanguage, code: e.target.value.toLowerCase() })}
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  placeholder="Русский, English..."
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="native_name">Нативное название *</Label>
                <Input
                  id="native_name"
                  placeholder="Русский, English..."
                  value={newLanguage.native_name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, native_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flag">Флаг (эмодзи)</Label>
                <Input
                  id="flag"
                  placeholder="🇷🇺, 🇺🇸, 🇪🇸..."
                  value={newLanguage.flag}
                  onChange={(e) => setNewLanguage({ ...newLanguage, flag: e.target.value })}
                  maxLength={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newLanguage.is_active}
                  onCheckedChange={(checked) => setNewLanguage({ ...newLanguage, is_active: checked })}
                />
                <Label htmlFor="is_active">Активировать сразу</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddLanguage}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего языков
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{languages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Активных языков
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeLanguages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего ключей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKeys}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Languages */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Активные языки
              </CardTitle>
              <CardDescription>
                Языки, доступные для пользователей приложения
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeLanguages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-medium">Нет активных языков</p>
                  <p className="text-sm">Добавьте хотя бы один язык</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeLanguages.map((language) => (
                    <Card
                      key={language.code}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
                      onClick={() => handleNavigateToTranslations(language.code)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {language.flag && (
                              <div className="text-4xl">{language.flag}</div>
                            )}
                            <div>
                              <div className="font-semibold text-lg">{language.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {language.native_name}
                              </div>
                              <Badge variant="outline" className="mt-1">
                                {language.code.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <Switch
                            checked={language.is_active}
                            onCheckedChange={() => handleToggleLanguage(language.code, language.is_active)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Прогресс переводов</span>
                            <span className="font-medium">
                              {language.translation_count || 0} / {language.total_keys || 0}
                            </span>
                          </div>
                          <Progress
                            value={language.progress || 0}
                            className="h-2"
                          />
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${
                              (language.progress || 0) >= 90 ? 'text-green-600' :
                              (language.progress || 0) >= 70 ? 'text-blue-600' :
                              (language.progress || 0) >= 50 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {Math.round(language.progress || 0)}%
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigateToTranslations(language.code);
                              }}
                            >
                              Перейти к переводам
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inactive Languages */}
          {inactiveLanguages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  Неактивные языки
                </CardTitle>
                <CardDescription>
                  Языки, которые не отображаются пользователям
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inactiveLanguages.map((language) => (
                    <Card
                      key={language.code}
                      className="opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {language.flag && (
                              <div className="text-4xl grayscale">{language.flag}</div>
                            )}
                            <div>
                              <div className="font-semibold text-lg">{language.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {language.native_name}
                              </div>
                              <Badge variant="outline" className="mt-1">
                                {language.code.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <Switch
                            checked={language.is_active}
                            onCheckedChange={() => handleToggleLanguage(language.code, language.is_active)}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Прогресс переводов</span>
                            <span className="font-medium">
                              {language.translation_count || 0} / {language.total_keys || 0}
                            </span>
                          </div>
                          <Progress
                            value={language.progress || 0}
                            className="h-2"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              {Math.round(language.progress || 0)}%
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigateToTranslations(language.code)}
                            >
                              Перейти к переводам
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

