import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { getBookDraft, saveBookDraft, renderBookPDF, type BookDraft } from "../../utils/api";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Edit3,
  Trash2,
  Plus,
  FileText,
  Image,
  BarChart3,
  Loader2
} from "lucide-react";

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
      console.error("Error loading book:", error);
      toast.error("Не удалось загрузить книгу", {
        description: "Попробуйте еще раз"
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
      toast.success("Изменения сохранены! 💾");
    } catch (error) {
      console.error("Error saving book:", error);
      toast.error("Не удалось сохранить изменения", {
        description: "Попробуйте еще раз"
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
      
      toast.success("PDF книга создана! 🎉", {
        description: `${result.pages} страниц, ${result.wordCount} слов`
      });

      // Обновляем книгу с PDF URL
      setBook(prev => prev ? {
        ...prev,
        pdfUrl: result.pdfUrl,
        isFinal: true,
        isDraft: false
      } : null);

      onPublish?.(book!.id);
      
    } catch (error) {
      console.error("Error publishing book:", error);
      toast.error("Не удалось создать PDF", {
        description: "Попробуйте еще раз"
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
      text: editedContent.chapters[chapterIndex].text
    };

    setEditedContent({
      ...editedContent,
      chapters: updatedChapters
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
      text
    };

    setEditedContent({
      ...editedContent,
      chapters: updatedChapters
    });
  };

  const handleTitleChange = (title: string) => {
    setEditedContent({
      ...editedContent,
      title
    });
  };

  const handlePrologueChange = (prologue: string) => {
    setEditedContent({
      ...editedContent,
      prologue
    });
  };

  const handleEpilogueChange = (epilogue: string) => {
    setEditedContent({
      ...editedContent,
      epilogue
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!book || !editedContent) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Книга не найдена
            </h3>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к библиотеке
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Редактирование книги
              </h1>
              <p className="text-muted-foreground">
                Внесите изменения и сохраните черновик
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-primary hover:bg-primary/90"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создание PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
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
                <FileText className="w-5 h-5 text-primary" />
                <Badge variant="secondary">
                  {book.style === 'warm_family' ? 'Теплый семейный' : 
                   book.style === 'biographical' ? 'Биографический' : 'Мотивационный'}
                </Badge>
                <Badge variant="outline">
                  {book.layout === 'photo_text' ? 'Фото + текст' : 
                   book.layout === 'text_only' ? 'Только текст' : 'Минимальный'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
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
                <Edit3 className="w-5 h-5" />
                <span>Название книги</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedContent.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="min-h-[60px] text-lg font-semibold"
                placeholder="Введите название книги..."
              />
            </CardContent>
          </Card>

          {/* Prologue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Предисловие</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedContent.prologue || ''}
                onChange={(e) => handlePrologueChange(e.target.value)}
                className="min-h-[120px]"
                placeholder="Напишите предисловие к книге..."
              />
            </CardContent>
          </Card>

          {/* Chapters */}
          {editedContent.chapters?.map((chapter: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Глава: {chapter.name}</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    {editingChapter === index ? (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleChapterSave(index)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleChapterCancel}
                        >
                          Отмена
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleChapterEdit(index)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingChapter === index ? (
                  <Textarea
                    value={chapter.text || ''}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    className="min-h-[200px]"
                    placeholder="Напишите содержание главы..."
                  />
                ) : (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{chapter.text}</p>
                  </div>
                )}

                {/* Achievements */}
                {chapter.achievements && chapter.achievements.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
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
                    <h4 className="font-medium mb-2">Цитаты</h4>
                    <div className="space-y-2">
                      {chapter.quotes.map((quote: string, quoteIndex: number) => (
                        <blockquote key={quoteIndex} className="border-l-4 border-primary pl-4 italic">
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
                  <BarChart3 className="w-5 h-5" />
                  <span>Статистика</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {editedContent.statistics.total_entries}
                    </div>
                    <div className="text-sm text-muted-foreground">Всего записей</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {editedContent.statistics.positive_percent}%
                    </div>
                    <div className="text-sm text-muted-foreground">Позитивных</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {editedContent.statistics.achievements_count}
                    </div>
                    <div className="text-sm text-muted-foreground">Достижений</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Epilogue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Заключение</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedContent.epilogue || ''}
                onChange={(e) => handleEpilogueChange(e.target.value)}
                className="min-h-[120px]"
                placeholder="Напишите заключение к книге..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
