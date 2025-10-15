import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { generateBookDraft, type BookGenerationRequest } from "../../utils/api";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar,
  Users,
  Palette,
  FileText,
  Image,
  Sparkles,
  Loader2
} from "lucide-react";

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
      end: new Date().toISOString().split('T')[0] // сегодня
    },
    contexts: [],
    style: 'warm_family',
    layout: 'photo_text',
    theme: 'light'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = [
    { id: 'period', title: 'Период', icon: Calendar },
    { id: 'contexts', title: 'Контексты', icon: Users },
    { id: 'style', title: 'Стиль', icon: Palette }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
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
          end: end.toISOString().split('T')[0]
        };
      }
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
          end: end.toISOString().split('T')[0]
        };
      }
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
          end: end.toISOString().split('T')[0]
        };
      }
    }
  ];

  const contextOptions = [
    'Я сам',
    'Семья',
    'Работа',
    'Друзья',
    'Здоровье',
    'Творчество',
    'Путешествия',
    'Обучение'
  ];

  const styleOptions = [
    {
      id: 'warm_family',
      name: 'Теплый семейный',
      description: 'Добрые истории о близких людях и важных моментах',
      icon: Users
    },
    {
      id: 'biographical',
      name: 'Биографический',
      description: 'Хронологический рассказ о вашем пути и развитии',
      icon: FileText
    },
    {
      id: 'motivational',
      name: 'Мотивационный',
      description: 'Вдохновляющие истории о достижениях и целях',
      icon: Sparkles
    }
  ];

  const layoutOptions = [
    {
      id: 'photo_text',
      name: 'Фото + текст',
      description: 'Красивые фотографии с текстом',
      icon: Image
    },
    {
      id: 'text_only',
      name: 'Только текст',
      description: 'Минималистичный дизайн',
      icon: FileText
    },
    {
      id: 'minimal',
      name: 'Минимальный',
      description: 'Простой и чистый стиль',
      icon: FileText
    }
  ];

  const themeOptions = [
    { id: 'light', name: 'Светлая', color: 'bg-white' },
    { id: 'dark', name: 'Темная', color: 'bg-gray-900' }
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
        userId: userData?.id || "anonymous"
      };

      const result = await generateBookDraft(request);
      
      toast.success("Черновик книги создан! 🎉", {
        description: `Примерно ${result.estimatedPages} страниц`
      });

      onComplete(result.draftId);
      
    } catch (error) {
      console.error("Error generating book:", error);
      toast.error("Не удалось создать книгу", {
        description: "Попробуйте еще раз"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderPeriodStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Выберите период</h3>
        
        {/* Presets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {periodPresets.map((preset) => (
            <Card 
              key={preset.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                const dates = preset.getDates();
                setSettings(prev => ({
                  ...prev,
                  period: dates
                }));
              }}
            >
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium">{preset.label}</h4>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">От</label>
            <input
              type="date"
              value={settings.period.start}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                period: { ...prev.period, start: e.target.value }
              }))}
              className="w-full p-3 border border-border rounded-lg bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">До</label>
            <input
              type="date"
              value={settings.period.end}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                period: { ...prev.period, end: e.target.value }
              }))}
              className="w-full p-3 border border-border rounded-lg bg-background"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContextsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">О ком эта книга?</h3>
        <p className="text-muted-foreground mb-6">
          Выберите контексты, которые будут включены в книгу
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {contextOptions.map((context) => (
            <Card
              key={context}
              className={`cursor-pointer transition-all ${
                settings.contexts.includes(context)
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:shadow-md'
              }`}
              onClick={() => {
                setSettings(prev => ({
                  ...prev,
                  contexts: prev.contexts.includes(context)
                    ? prev.contexts.filter(c => c !== context)
                    : [...prev.contexts, context]
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
        <h3 className="text-lg font-semibold mb-4">Стиль рассказа</h3>
        
        <div className="space-y-4 mb-6">
          {styleOptions.map((style) => (
            <Card
              key={style.id}
              className={`cursor-pointer transition-all ${
                settings.style === style.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSettings(prev => ({ ...prev, style: style.id }))}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <style.icon className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">{style.name}</h4>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Layout */}
          <div>
            <h4 className="font-medium mb-3">Макет</h4>
            <div className="space-y-2">
              {layoutOptions.map((layout) => (
                <Card
                  key={layout.id}
                  className={`cursor-pointer transition-all ${
                    settings.layout === layout.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSettings(prev => ({ ...prev, layout: layout.id }))}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <layout.icon className="w-4 h-4 text-primary" />
                      <div>
                        <h5 className="font-medium text-sm">{layout.name}</h5>
                        <p className="text-xs text-muted-foreground">{layout.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <h4 className="font-medium mb-3">Тема</h4>
            <div className="space-y-2">
              {themeOptions.map((theme) => (
                <Card
                  key={theme.id}
                  className={`cursor-pointer transition-all ${
                    settings.theme === theme.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSettings(prev => ({ ...prev, theme: theme.id }))}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${theme.color} border border-border`} />
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <div className="text-sm text-muted-foreground">
              Шаг {currentStepIndex + 1} из {steps.length}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Создание книги
          </h1>
          <p className="text-muted-foreground mb-4">
            Создайте персональную книгу ваших достижений
          </p>
          
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
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
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={isGenerating}
            className="bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Создание...
              </>
            ) : currentStepIndex === steps.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Создать книгу
              </>
            ) : (
              <>
                Далее
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
