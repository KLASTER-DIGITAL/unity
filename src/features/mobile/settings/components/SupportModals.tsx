import { HelpCircle, Mail, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/universal/Dialog';

// ============================================
// Contact Support Modal
// ============================================

type ContactSupportModalProps = {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
};

export function ContactSupportModal({ open, onClose, userEmail }: ContactSupportModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(subject && message)) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    setIsSubmitting(true);

    // Симуляция отправки
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
    setSubject('');
    setMessage('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Связаться с поддержкой
          </DialogTitle>
          <DialogDescription>
            Опишите вашу проблему или предложение, и мы ответим вам как можно скорее
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input className="bg-muted" disabled id="email" type="email" value={userEmail || ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Тема</Label>
            <Input
              id="subject"
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Например: Проблема с созданием записи"
              required
              value={subject}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Сообщение</Label>
            <Textarea
              id="message"
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Опишите вашу проблему или предложение..."
              required
              rows={5}
              value={message}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={onClose} type="button" variant="outline">
              Отмена
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Rate App Modal
// ============================================

type RateAppModalProps = {
  open: boolean;
  onClose: () => void;
};

export function RateAppModal({ open, onClose }: RateAppModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Пожалуйста, выберите оценку');
      return;
    }

    setIsSubmitting(true);

    // Симуляция отправки
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success('Спасибо за вашу оценку! ⭐');
    setRating(0);
    setComment('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Оценить приложение
          </DialogTitle>
          <DialogDescription>Ваше мнение помогает нам стать лучше</DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Ваша оценка</Label>
            <div className="flex justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  className="transition-transform hover:scale-110"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  type="button"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-muted-foreground text-sm">
                {rating === 5 && 'Отлично! 🎉'}
                {rating === 4 && 'Хорошо! 👍'}
                {rating === 3 && 'Неплохо 😊'}
                {rating === 2 && 'Можно лучше 😕'}
                {rating === 1 && 'Что пошло не так? 😢'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий (необязательно)</Label>
            <Textarea
              id="comment"
              onChange={(e) => setComment(e.target.value)}
              placeholder="Расскажите, что вам понравилось или что можно улучшить..."
              rows={4}
              value={comment}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={onClose} type="button" variant="outline">
              Отмена
            </Button>
            <Button disabled={isSubmitting || rating === 0} type="submit">
              {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// FAQ Modal
// ============================================

type FAQModalProps = {
  open: boolean;
  onClose: () => void;
};

export function FAQModal({ open, onClose }: FAQModalProps) {
  const faqs = [
    {
      question: 'Как создать запись?',
      answer:
        "Нажмите на кнопку '+' на главном экране, введите текст вашего достижения или неудачи, и нажмите 'Создать запись'. AI автоматически проанализирует вашу запись и определит настроение.",
    },
    {
      question: 'Что такое AI-анализ?',
      answer:
        'AI-анализ использует искусственный интеллект для определения настроения вашей записи (позитивное, нейтральное, негативное), категории (работа, здоровье, отношения и т.д.) и ключевых слов. Это помогает лучше понять ваши паттерны поведения.',
    },
    {
      question: 'Как получить премиум?',
      answer:
        'Премиум-версия включает: премиум-темы (Закат, Океан, Лес), автоматическое резервирование данных, расширенный экспорт (JSON/CSV/ZIP) и приоритетную поддержку. Функция покупки премиума будет доступна в следующем обновлении.',
    },
    {
      question: 'Как экспортировать данные?',
      answer:
        'Перейдите в Настройки → Опасная зона → Экспортировать данные. Выберите формат (JSON, CSV или ZIP) и скачайте файл. Экспорт включает все ваши записи, достижения и статистику.',
    },
    {
      question: 'Безопасны ли мои данные?',
      answer:
        'Да! Все ваши данные хранятся в защищенной базе данных Supabase с шифрованием. Мы используем Row Level Security (RLS) - это означает, что только вы можете видеть свои записи. Никто другой, включая администраторов, не имеет доступа к вашим личным данным.',
    },
    {
      question: 'Как работает система достижений?',
      answer:
        'Вы получаете опыт (XP) за каждую созданную запись. Накапливая XP, вы повышаете свой уровень и получаете награды (бейджи). Есть также этапы (milestones) за количество записей, дни подряд и другие достижения.',
    },
    {
      question: 'Можно ли использовать приложение офлайн?',
      answer:
        'Да! UNITY - это Progressive Web App (PWA), которое работает офлайн после установки. Вы можете создавать записи без интернета, и они автоматически синхронизируются при подключении.',
    },
    {
      question: 'Как изменить язык приложения?',
      answer:
        'Перейдите в Настройки → Дополнительные настройки → Язык приложения. Выберите нужный язык из списка. Приложение поддерживает 7 языков: русский, английский, испанский, немецкий, французский, китайский и японский.',
    },
  ];

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Часто задаваемые вопросы
          </DialogTitle>
          <DialogDescription>Ответы на популярные вопросы о UNITY</DialogDescription>
        </DialogHeader>

        <Accordion className="mt-4 w-full" collapsible type="single">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
          <Button onClick={onClose} variant="outline">
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
