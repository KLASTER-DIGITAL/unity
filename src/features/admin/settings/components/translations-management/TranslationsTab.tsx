import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { TabsContent } from '@/shared/components/ui/tabs';
import { Search, Edit2, Save, X, AlertCircle } from 'lucide-react';
import type { Translation, Language } from './types';

interface TranslationsTabProps {
  translations: Translation[];
  languages: Language[];
  selectedLanguage: string;
  searchQuery: string;
  uniqueKeysCount: number;
  onLanguageChange: (code: string) => void;
  onSearchChange: (query: string) => void;
  onSaveTranslation: (key: string, value: string) => Promise<void>;
}

/**
 * Translations Tab Component
 * Displays and allows editing of translations
 */
export function TranslationsTab({
  translations,
  languages,
  selectedLanguage,
  searchQuery,
  uniqueKeysCount,
  onLanguageChange,
  onSearchChange,
  onSaveTranslation
}: TranslationsTabProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSave = async () => {
    if (!editingKey) return;
    
    await onSaveTranslation(editingKey, editValue);
    setEditingKey(null);
    setEditValue('');
  };

  const handleEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  return (
    <TabsContent value="translations" className="space-y-4">
      {/* Language Selector & Search */}
      <div className="flex gap-4">
        <div className="flex gap-2 flex-wrap">
          {languages.filter(l => l.enabled).map(lang => (
            <Button
              key={lang.code}
              variant={selectedLanguage === lang.code ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLanguageChange(lang.code)}
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
              onChange={(e) => onSearchChange(e.target.value)}
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
            Найдено: {translations.length} из {uniqueKeysCount} ключей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {translations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Переводы не найдены</p>
              </div>
            ) : (
              translations.map((translation) => (
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
                        <Button size="sm" onClick={handleSave}>
                          <Save className="w-4 h-4 mr-1" />
                          Сохранить
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
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
                        onClick={() => handleEdit(translation.translation_key, translation.translation_value)}
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
  );
}

