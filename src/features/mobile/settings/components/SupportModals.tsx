import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";
import { Mail, Star, HelpCircle } from "lucide-react";

// ============================================
// Contact Support Modal
// ============================================

interface ContactSupportModalProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function ContactSupportModal({ open, onClose, userEmail }: ContactSupportModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !message) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    setIsSubmitting(true);
    
    // Симуляция отправки
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Сообщение отправлено! Мы свяжемся с вами в ближайшее время.");
    setSubject("");
    setMessage("");
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userEmail || ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Тема</Label>
            <Input
              id="subject"
              placeholder="Например: Проблема с созданием записи"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Сообщение</Label>
            <Textarea
              id="message"
              placeholder="Опишите вашу проблему или предложение..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Отправка..." : "Отправить"}
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

interface RateAppModalProps {
  open: boolean;
  onClose: () => void;
}

export function RateAppModal({ open, onClose }: RateAppModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Пожалуйста, выберите оценку");
      return;
    }

    setIsSubmitting(true);
    
    // Симуляция отправки
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Спасибо за вашу оценку! ⭐");
    setRating(0);
    setComment("");
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Оценить приложение
          </DialogTitle>
          <DialogDescription>
            Ваше мнение помогает нам стать лучше
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Ваша оценка</Label>
            <div className="flex gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
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
              <p className="text-center text-sm text-muted-foreground">
                {rating === 5 && "Отлично! 🎉"}
                {rating === 4 && "Хорошо! 👍"}
                {rating === 3 && "Неплохо 😊"}
                {rating === 2 && "Можно лучше 😕"}
                {rating === 1 && "Что пошло не так? 😢"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий (необязательно)</Label>
            <Textarea
              id="comment"
              placeholder="Расскажите, что вам понравилось или что можно улучшить..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? "Отправка..." : "Отправить отзыв"}
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

interface FAQModalProps {
  open: boolean;
  onClose: () => void;
}

export function FAQModal({ open, onClose }: FAQModalProps) {
  const faqs = [
    {
      question: "Как создать запись?",
      answer: "Нажмите на кнопку '+' на главном экране, введите текст вашего достижения или неудачи, и нажмите 'Создать запись'. AI автоматически проанализирует вашу запись и определит настроение."
    },
    {
      question: "Что такое AI-анализ?",
      answer: "AI-анализ использует искусственный интеллект для определения настроения вашей записи (позитивное, нейтральное, негативное), категории (работа, здоровье, отношения и т.д.) и ключевых слов. Это помогает лучше понять ваши паттерны поведения."
    },
    {
      question: "Как получить премиум?",
      answer: "Премиум-версия включает: премиум-темы (Закат, Океан, Лес), автоматическое резервирование данных, расширенный экспорт (JSON/CSV/ZIP) и приоритетную поддержку. Функция покупки премиума будет доступна в следующем обновлении."
    },
    {
      question: "Как экспортировать данные?",
      answer: "Перейдите в Настройки → Опасная зона → Экспортировать данные. Выберите формат (JSON, CSV или ZIP) и скачайте файл. Экспорт включает все ваши записи, достижения и статистику."
    },
    {
      question: "Безопасны ли мои данные?",
      answer: "Да! Все ваши данные хранятся в защищенной базе данных Supabase с шифрованием. Мы используем Row Level Security (RLS) - это означает, что только вы можете видеть свои записи. Никто другой, включая администраторов, не имеет доступа к вашим личным данным."
    },
    {
      question: "Как работает система достижений?",
      answer: "Вы получаете опыт (XP) за каждую созданную запись. Накапливая XP, вы повышаете свой уровень и получаете награды (бейджи). Есть также этапы (milestones) за количество записей, дни подряд и другие достижения."
    },
    {
      question: "Можно ли использовать приложение офлайн?",
      answer: "Да! UNITY - это Progressive Web App (PWA), которое работает офлайн после установки. Вы можете создавать записи без интернета, и они автоматически синхронизируются при подключении."
    },
    {
      question: "Как изменить язык приложения?",
      answer: "Перейдите в Настройки → Дополнительные настройки → Язык приложения. Выберите нужный язык из списка. Приложение поддерживает 7 языков: русский, английский, испанский, немецкий, французский, китайский и японский."
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Часто задаваемые вопросы
          </DialogTitle>
          <DialogDescription>
            Ответы на популярные вопросы о UNITY
          </DialogDescription>
        </DialogHeader>

        <Accordion type="single" collapsible className="w-full mt-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

