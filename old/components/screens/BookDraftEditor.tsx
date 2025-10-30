import { ArrowLeft, BarChart3, Download, Edit3, FileText, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { type BookDraft, getBookDraft, renderBookPDF, saveBookDraft } from '../../utils/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';

interface BookDraftEditorProps {
  draftId: string;
  userData?: any;
  onBack: () => void;
  onPublish?: (bookId: string) => void;
}

interface EditableChapter {
  name: string;
  text: string;
  achievements: string[];
  quotes: string[];
}

export function BookDraftEditor({ draftId, userData, onBack, onPublish }: BookDraftEditorProps) {
  const [book, setBook] = useState<BookDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<any>(null);

  useEffect(() => {
    loadBook();
  }, [draftId]);

  const loadBook = async () => {
    try {
      setIsLoading(true);
      const bookData = await getBookDraft(draftId);
      setBook(bookData);
      setEditedContent(bookData.storyJson);
    } catch (error) {
      console.error('Error loading book:', error);
      toast.error('Не удалось загрузить книгу', {
        description: 'Попробуйте еще раз',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedContent) return;

    try {
      setIsSaving(true);
      await saveBookDraft(draftId, editedContent);
      toast.success('Изменения сохранены! 💾');
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error('Не удалось сохранить изменения', {
        description: 'Попробуйте еще раз',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!editedContent) return;

    try {
      setIsPublishing(true);

      // Сначала сохраняем изменения
      await saveBookDraft(draftId, editedContent);

      // Затем рендерим PDF
      const result = await renderBookPDF(draftId);

      toast.success('PDF книга создана! 🎉', {
        description: `${result.pages} страниц, ${result.wordCount} слов`,
      });

      // Обновляем книгу с PDF URL
      setBook((prev) =>
        prev
          ? {
              ...prev,
              pdfUrl: result.pdfUrl,
              isFinal: true,
              isDraft: false,
            }
          : null
      );

      onPublish?.(book!.id);
    } catch (error) {
      console.error('Error publishing book:', error);
      toast.error('Не удалось создать PDF', {
        description: 'Попробуйте еще раз',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleChapterEdit = (chapterIndex: number) => {
    setEditingChapter(chapterIndex);
  };

  const handleChapterSave = (chapterIndex: number) => {
    if (!editedContent?.chapters) return;

    const updatedChapters = [...editedContent.chapters];
    updatedChapters[chapterIndex] = {
      ...updatedChapters[chapterIndex],
      text: editedContent.chapters[chapterIndex].text,
    };

    setEditedContent({
      ...editedContent,
      chapters: updatedChapters,
    });
    setEditingChapter(null);
  };

  const handleChapterCancel = () => {
    setEditingChapter(null);
  };

  const handleTextChange = (chapterIndex: number, text: string) => {
    if (!editedContent?.chapters) return;

    const updatedChapters = [...editedContent.chapters];
    updatedChapters[chapterIndex] = {
      ...updatedChapters[chapterIndex],
      text,
    };

    setEditedContent({
      ...editedContent,
      chapters: updatedChapters,
    });
  };

  const handleTitleChange = (title: string) => {
    setEditedContent({
      ...editedContent,
      title,
    });
  };

  const handlePrologueChange = (prologue: string) => {
    setEditedContent({
      ...editedContent,
      prologue,
    });
  };

  const handleEpilogueChange = (epilogue: string) => {
    setEditedContent({
      ...editedContent,
      epilogue,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!(book && editedContent)) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <div className="py-16 text-center">
            <h3 className="mb-2 font-semibold text-foreground text-xl">Книга не найдена</h3>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к библиотеке
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="font-bold text-3xl text-foreground">Редактирование книги</h1>
              <p className="text-muted-foreground">Внесите изменения и сохраните черновик</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button disabled={isSaving} onClick={handleSave} variant="outline">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              disabled={isPublishing}
              onClick={handlePublish}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Создать PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Book Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <Badge variant="secondary">
                  {book.style === 'warm_family'
                    ? 'Теплый семейный'
                    : book.style === 'biographical'
                      ? 'Биографический'
                      : 'Мотивационный'}
                </Badge>
                <Badge variant="outline">
                  {book.layout === 'photo_text'
                    ? 'Фото + текст'
                    : book.layout === 'text_only'
                      ? 'Только текст'
                      : 'Минимальный'}
                </Badge>
              </div>
              <div className="text-muted-foreground text-sm">
                {book.periodStart} - {book.periodEnd}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Book Content */}
        <div className="space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit3 className="h-5 w-5" />
                <span>Название книги</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[60px] font-semibold text-lg"
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Введите название книги..."
                value={editedContent.title || ''}
              />
            </CardContent>
          </Card>

          {/* Prologue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Предисловие</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[120px]"
                onChange={(e) => handlePrologueChange(e.target.value)}
                placeholder="Напишите предисловие к книге..."
                value={editedContent.prologue || ''}
              />
            </CardContent>
          </Card>

          {/* Chapters */}
          {editedContent.chapters?.map((chapter: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Глава: {chapter.name}</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    {editingChapter === index ? (
                      <>
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleChapterSave(index)}
                          size="sm"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleChapterCancel} size="sm" variant="outline">
                          Отмена
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => handleChapterEdit(index)} size="sm" variant="outline">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingChapter === index ? (
                  <Textarea
                    className="min-h-[200px]"
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    placeholder="Напишите содержание главы..."
                    value={chapter.text || ''}
                  />
                ) : (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{chapter.text}</p>
                  </div>
                )}

                {/* Achievements */}
                {chapter.achievements && chapter.achievements.length > 0 && (
                  <div className="mt-4">
                    <h4 className="mb-2 flex items-center font-medium">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Достижения
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {chapter.achievements.map((achievement: string, achIndex: number) => (
                        <Badge key={achIndex} variant="secondary">
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quotes */}
                {chapter.quotes && chapter.quotes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="mb-2 font-medium">Цитаты</h4>
                    <div className="space-y-2">
                      {chapter.quotes.map((quote: string, quoteIndex: number) => (
                        <blockquote
                          className="border-primary border-l-4 pl-4 italic"
                          key={quoteIndex}
                        >
                          "{quote}"
                        </blockquote>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Statistics */}
          {editedContent.statistics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Статистика</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="font-bold text-2xl text-primary">
                      {editedContent.statistics.total_entries}
                    </div>
                    <div className="text-muted-foreground text-sm">Всего записей</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-green-600">
                      {editedContent.statistics.positive_percent}%
                    </div>
                    <div className="text-muted-foreground text-sm">Позитивных</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-blue-600">
                      {editedContent.statistics.achievements_count}
                    </div>
                    <div className="text-muted-foreground text-sm">Достижений</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Epilogue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Заключение</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[120px]"
                onChange={(e) => handleEpilogueChange(e.target.value)}
                placeholder="Напишите заключение к книге..."
                value={editedContent.epilogue || ''}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
