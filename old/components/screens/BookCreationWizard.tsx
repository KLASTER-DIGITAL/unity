import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  FileText,
  Image,
  Loader2,
  Palette,
  Sparkles,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { type BookGenerationRequest, generateBookDraft } from '../../utils/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';

interface BookCreationWizardProps {
  userData?: any;
  onBack: () => void;
  onComplete: (draftId: string) => void;
}

type WizardStep = 'period' | 'contexts' | 'style';

interface BookSettings {
  period: {
    start: string;
    end: string;
  };
  contexts: string[];
  style: string;
  layout: string;
  theme: string;
}

export function BookCreationWizard({ userData, onBack, onComplete }: BookCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('period');
  const [settings, setSettings] = useState<BookSettings>({
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 дней назад
      end: new Date().toISOString().split('T')[0], // сегодня
    },
    contexts: [],
    style: 'warm_family',
    layout: 'photo_text',
    theme: 'light',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = [
    { id: 'period', title: 'Период', icon: Calendar },
    { id: 'contexts', title: 'Контексты', icon: Users },
    { id: 'style', title: 'Стиль', icon: Palette },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const periodPresets = [
    {
      id: 'month',
      label: 'Месяц',
      getDates: () => {
        const end = new Date();
        const start = new Date(end);
        start.setMonth(start.getMonth() - 1);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      },
    },
    {
      id: 'quarter',
      label: 'Квартал',
      getDates: () => {
        const end = new Date();
        const start = new Date(end);
        start.setMonth(start.getMonth() - 3);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      },
    },
    {
      id: 'year',
      label: 'Год',
      getDates: () => {
        const end = new Date();
        const start = new Date(end);
        start.setFullYear(start.getFullYear() - 1);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        };
      },
    },
  ];

  const contextOptions = [
    'Я сам',
    'Семья',
    'Работа',
    'Друзья',
    'Здоровье',
    'Творчество',
    'Путешествия',
    'Обучение',
  ];

  const styleOptions = [
    {
      id: 'warm_family',
      name: 'Теплый семейный',
      description: 'Добрые истории о близких людях и важных моментах',
      icon: Users,
    },
    {
      id: 'biographical',
      name: 'Биографический',
      description: 'Хронологический рассказ о вашем пути и развитии',
      icon: FileText,
    },
    {
      id: 'motivational',
      name: 'Мотивационный',
      description: 'Вдохновляющие истории о достижениях и целях',
      icon: Sparkles,
    },
  ];

  const layoutOptions = [
    {
      id: 'photo_text',
      name: 'Фото + текст',
      description: 'Красивые фотографии с текстом',
      icon: Image,
    },
    {
      id: 'text_only',
      name: 'Только текст',
      description: 'Минималистичный дизайн',
      icon: FileText,
    },
    {
      id: 'minimal',
      name: 'Минимальный',
      description: 'Простой и чистый стиль',
      icon: FileText,
    },
  ];

  const themeOptions = [
    { id: 'light', name: 'Светлая', color: 'bg-white' },
    { id: 'dark', name: 'Темная', color: 'bg-gray-900' },
  ];

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as WizardStep);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as WizardStep);
    } else {
      onBack();
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);

      const request: BookGenerationRequest = {
        period: settings.period,
        contexts: settings.contexts,
        style: settings.style,
        layout: settings.layout,
        theme: settings.theme,
        userId: userData?.id || 'anonymous',
      };

      const result = await generateBookDraft(request);

      toast.success('Черновик книги создан! 🎉', {
        description: `Примерно ${result.estimatedPages} страниц`,
      });

      onComplete(result.draftId);
    } catch (error) {
      console.error('Error generating book:', error);
      toast.error('Не удалось создать книгу', {
        description: 'Попробуйте еще раз',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderPeriodStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 font-semibold text-lg">Выберите период</h3>

        {/* Presets */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {periodPresets.map((preset) => (
            <Card
              className="cursor-pointer transition-shadow hover:shadow-md"
              key={preset.id}
              onClick={() => {
                const dates = preset.getDates();
                setSettings((prev) => ({
                  ...prev,
                  period: dates,
                }));
              }}
            >
              <CardContent className="p-4 text-center">
                <Calendar className="mx-auto mb-2 h-8 w-8 text-primary" />
                <h4 className="font-medium">{preset.label}</h4>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom dates */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium text-sm">От</label>
            <input
              className="w-full rounded-lg border border-border bg-background p-3"
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  period: { ...prev.period, start: e.target.value },
                }))
              }
              type="date"
              value={settings.period.start}
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-sm">До</label>
            <input
              className="w-full rounded-lg border border-border bg-background p-3"
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  period: { ...prev.period, end: e.target.value },
                }))
              }
              type="date"
              value={settings.period.end}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContextsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 font-semibold text-lg">О ком эта книга?</h3>
        <p className="mb-6 text-muted-foreground">
          Выберите контексты, которые будут включены в книгу
        </p>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {contextOptions.map((context) => (
            <Card
              className={`cursor-pointer transition-all ${
                settings.contexts.includes(context)
                  ? 'bg-primary/5 ring-2 ring-primary'
                  : 'hover:shadow-md'
              }`}
              key={context}
              onClick={() => {
                setSettings((prev) => ({
                  ...prev,
                  contexts: prev.contexts.includes(context)
                    ? prev.contexts.filter((c) => c !== context)
                    : [...prev.contexts, context],
                }));
              }}
            >
              <CardContent className="p-4 text-center">
                <h4 className="font-medium text-sm">{context}</h4>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStyleStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 font-semibold text-lg">Стиль рассказа</h3>

        <div className="mb-6 space-y-4">
          {styleOptions.map((style) => (
            <Card
              className={`cursor-pointer transition-all ${
                settings.style === style.id ? 'bg-primary/5 ring-2 ring-primary' : 'hover:shadow-md'
              }`}
              key={style.id}
              onClick={() => setSettings((prev) => ({ ...prev, style: style.id }))}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <style.icon className="mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h4 className="font-medium">{style.name}</h4>
                    <p className="text-muted-foreground text-sm">{style.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Layout */}
          <div>
            <h4 className="mb-3 font-medium">Макет</h4>
            <div className="space-y-2">
              {layoutOptions.map((layout) => (
                <Card
                  className={`cursor-pointer transition-all ${
                    settings.layout === layout.id
                      ? 'bg-primary/5 ring-2 ring-primary'
                      : 'hover:shadow-md'
                  }`}
                  key={layout.id}
                  onClick={() => setSettings((prev) => ({ ...prev, layout: layout.id }))}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <layout.icon className="h-4 w-4 text-primary" />
                      <div>
                        <h5 className="font-medium text-sm">{layout.name}</h5>
                        <p className="text-muted-foreground text-xs">{layout.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <h4 className="mb-3 font-medium">Тема</h4>
            <div className="space-y-2">
              {themeOptions.map((theme) => (
                <Card
                  className={`cursor-pointer transition-all ${
                    settings.theme === theme.id
                      ? 'bg-primary/5 ring-2 ring-primary'
                      : 'hover:shadow-md'
                  }`}
                  key={theme.id}
                  onClick={() => setSettings((prev) => ({ ...prev, theme: theme.id }))}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className={`h-4 w-4 rounded-full ${theme.color} border border-border`} />
                      <span className="font-medium text-sm">{theme.name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <Button onClick={onBack} variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <div className="text-muted-foreground text-sm">
              Шаг {currentStepIndex + 1} из {steps.length}
            </div>
          </div>

          <h1 className="mb-2 font-bold text-3xl text-foreground">Создание книги</h1>
          <p className="mb-4 text-muted-foreground">Создайте персональную книгу ваших достижений</p>

          <Progress className="h-2" value={progress} />
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                initial={{ opacity: 0, x: 20 }}
                key={currentStep}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 'period' && renderPeriodStep()}
                {currentStep === 'contexts' && renderContextsStep()}
                {currentStep === 'style' && renderStyleStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>

          <Button
            className="bg-primary hover:bg-primary/90"
            disabled={isGenerating}
            onClick={handleNext}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание...
              </>
            ) : currentStepIndex === steps.length - 1 ? (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Создать книгу
              </>
            ) : (
              <>
                Далее
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
