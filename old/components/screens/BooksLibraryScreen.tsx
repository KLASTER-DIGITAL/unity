import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { getBooksArchive, type BookDraft } from "../../utils/api";
import { toast } from "sonner";
import { 
  BookOpen, 
  Plus, 
  Download, 
  Calendar,
  FileText,
  Image,
  Palette
} from "lucide-react";

interface BooksLibraryScreenProps {
  userData?: any;
  onCreateBook?: () => void;
}

export function BooksLibraryScreen({ userData, onCreateBook }: BooksLibraryScreenProps) {
  const [books, setBooks] = useState<BookDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const userId = userData?.id || "anonymous";
      const booksData = await getBooksArchive(userId);
      setBooks(booksData);
    } catch (error) {
      console.error("Error loading books:", error);
      toast.error("Не удалось загрузить книги", {
        description: "Проверьте подключение к интернету"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'warm_family': return <Palette className="w-4 h-4" />;
      case 'biographical': return <FileText className="w-4 h-4" />;
      case 'motivational': return <BookOpen className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getStyleName = (style: string) => {
    switch (style) {
      case 'warm_family': return 'Теплый семейный';
      case 'biographical': return 'Биографический';
      case 'motivational': return 'Мотивационный';
      default: return 'Теплый семейный';
    }
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Мои книги
            </h1>
            <p className="text-muted-foreground">
              Коллекция ваших историй и достижений
            </p>
          </div>
          <Button 
            onClick={onCreateBook}
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Создать новую книгу
          </Button>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Пока нет книг
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Создайте свою первую книгу достижений, выбрав период и стиль рассказа
            </p>
            <Button 
              onClick={onCreateBook}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Создать первую книгу
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getStyleIcon(book.style)}
                        <Badge variant="secondary" className="text-xs">
                          {getStyleName(book.style)}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {book.metadata?.pages || '?'} стр.
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {book.storyJson?.title || 'Моя история'}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Period */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(book.periodStart)} - {formatDate(book.periodEnd)}
                      </div>

                      {/* Contexts */}
                      {book.contexts && book.contexts.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {book.contexts.slice(0, 3).map((context, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {context}
                            </Badge>
                          ))}
                          {book.contexts.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{book.contexts.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Statistics */}
                      {book.storyJson?.statistics && (
                        <div className="text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Записей:</span>
                            <span>{book.storyJson.statistics.total_entries}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Позитивных:</span>
                            <span>{book.storyJson.statistics.positive_percent}%</span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        {book.pdfUrl ? (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => window.open(book.pdfUrl, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Скачать PDF
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            disabled
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            В процессе
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
