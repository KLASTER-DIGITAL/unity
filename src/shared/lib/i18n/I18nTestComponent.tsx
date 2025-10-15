import React from 'react';
import { useTranslation } from './useTranslation';
import { LanguageSelector } from './LanguageSelector';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';

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
    'cancel_button'
  ];
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>i18n System Test</span>
            <div className="flex items-center gap-2">
              <Badge variant={isLoaded ? "default" : "secondary"}>
                {isLoaded ? "Loaded" : "Loading"}
              </Badge>
              {isLoading && (
                <Badge variant="outline">Loading...</Badge>
              )}
              {error && (
                <Badge variant="destructive">Error</Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Test component for the new internationalization system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Language Selector</h3>
            <LanguageSelector 
              variant="dropdown"
              showFlag={true}
              showNativeName={true}
            />
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Current Language</h3>
            <p className="text-sm text-muted-foreground">
              {currentLanguage} ({isLoaded ? 'Translations loaded' : 'Loading translations...'})
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Test Translations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testKeys.map(key => (
                <div key={key} className="border rounded p-3">
                  <div className="font-mono text-xs text-muted-foreground mb-1">
                    {key}
                  </div>
                  <div className="text-sm">
                    {t(key as any, `[${key}]`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => changeLanguage('ru')}
              >
                Switch to Russian
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => changeLanguage('en')}
              >
                Switch to English
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => changeLanguage('es')}
              >
                Switch to Spanish
              </Button>
            </div>
          </div>
          
          {error && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-2 text-red-500">Error</h3>
                <p className="text-sm text-red-500">{error}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};