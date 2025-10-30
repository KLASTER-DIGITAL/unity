import {
	BookOpen,
	Calendar,
	Download,
	FileText,
	Palette,
	Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type BookDraft, getBooksArchive } from "../../utils/api";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface BooksLibraryScreenProps {
	userData?: any;
	onCreateBook?: () => void;
}

export function BooksLibraryScreen({
	userData,
	onCreateBook,
}: BooksLibraryScreenProps) {
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
				description: "Проверьте подключение к интернету",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("ru-RU", {
			year: "numeric",
			month: "long",
		});
	};

	const getStyleIcon = (style: string) => {
		switch (style) {
			case "warm_family":
				return <Palette className="h-4 w-4" />;
			case "biographical":
				return <FileText className="h-4 w-4" />;
			case "motivational":
				return <BookOpen className="h-4 w-4" />;
			default:
				return <BookOpen className="h-4 w-4" />;
		}
	};

	const getStyleName = (style: string) => {
		switch (style) {
			case "warm_family":
				return "Теплый семейный";
			case "biographical":
				return "Биографический";
			case "motivational":
				return "Мотивационный";
			default:
				return "Теплый семейный";
		}
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

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="mx-auto max-w-4xl">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="mb-2 font-bold text-3xl text-foreground">
							Мои книги
						</h1>
						<p className="text-muted-foreground">
							Коллекция ваших историй и достижений
						</p>
					</div>
					<Button
						className="bg-primary hover:bg-primary/90"
						onClick={onCreateBook}
						size="lg"
					>
						<Plus className="mr-2 h-5 w-5" />
						Создать новую книгу
					</Button>
				</div>

				{/* Books Grid */}
				{books.length === 0 ? (
					<div className="py-16 text-center">
						<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
							<BookOpen className="h-12 w-12 text-muted-foreground" />
						</div>
						<h3 className="mb-2 font-semibold text-foreground text-xl">
							Пока нет книг
						</h3>
						<p className="mx-auto mb-6 max-w-md text-muted-foreground">
							Создайте свою первую книгу достижений, выбрав период и стиль
							рассказа
						</p>
						<Button
							className="bg-primary hover:bg-primary/90"
							onClick={onCreateBook}
							size="lg"
						>
							<Plus className="mr-2 h-5 w-5" />
							Создать первую книгу
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{books.map((book) => (
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								initial={{ opacity: 0, y: 20 }}
								key={book.id}
								transition={{ duration: 0.3 }}
							>
								<Card className="h-full transition-shadow hover:shadow-lg">
									<CardHeader className="pb-3">
										<div className="flex items-start justify-between">
											<div className="flex items-center space-x-2">
												{getStyleIcon(book.style)}
												<Badge className="text-xs" variant="secondary">
													{getStyleName(book.style)}
												</Badge>
											</div>
											<Badge className="text-xs" variant="outline">
												{book.metadata?.pages || "?"} стр.
											</Badge>
										</div>
										<CardTitle className="text-lg leading-tight">
											{book.storyJson?.title || "Моя история"}
										</CardTitle>
									</CardHeader>

									<CardContent className="pt-0">
										<div className="space-y-3">
											{/* Period */}
											<div className="flex items-center text-muted-foreground text-sm">
												<Calendar className="mr-2 h-4 w-4" />
												{formatDate(book.periodStart)} -{" "}
												{formatDate(book.periodEnd)}
											</div>

											{/* Contexts */}
											{book.contexts && book.contexts.length > 0 && (
												<div className="flex flex-wrap gap-1">
													{book.contexts.slice(0, 3).map((context, index) => (
														<Badge
															className="text-xs"
															key={index}
															variant="outline"
														>
															{context}
														</Badge>
													))}
													{book.contexts.length > 3 && (
														<Badge className="text-xs" variant="outline">
															+{book.contexts.length - 3}
														</Badge>
													)}
												</div>
											)}

											{/* Statistics */}
											{book.storyJson?.statistics && (
												<div className="text-muted-foreground text-sm">
													<div className="flex justify-between">
														<span>Записей:</span>
														<span>
															{book.storyJson.statistics.total_entries}
														</span>
													</div>
													<div className="flex justify-between">
														<span>Позитивных:</span>
														<span>
															{book.storyJson.statistics.positive_percent}%
														</span>
													</div>
												</div>
											)}

											{/* Actions */}
											<div className="flex space-x-2 pt-2">
												{book.pdfUrl ? (
													<Button
														className="flex-1"
														onClick={() => window.open(book.pdfUrl, "_blank")}
														size="sm"
													>
														<Download className="mr-1 h-4 w-4" />
														Скачать PDF
													</Button>
												) : (
													<Button
														className="flex-1"
														disabled
														size="sm"
														variant="outline"
													>
														<FileText className="mr-1 h-4 w-4" />В процессе
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
