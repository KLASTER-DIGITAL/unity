import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { TabsContent } from '@/shared/components/ui/tabs';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { MissingTranslation, Language } from './types';

interface MissingTabProps {
  missingKeys: MissingTranslation[];
  languages: Language[];
}

/**
 * Missing Tab Component
 * Displays missing translations
 */
export function MissingTab({ missingKeys, languages }: MissingTabProps) {
  return (
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
  );
}

