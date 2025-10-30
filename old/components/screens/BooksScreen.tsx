import { useState } from "react";
import { BookCreationWizard } from "./BookCreationWizard";
import { BookDraftEditor } from "./BookDraftEditor";
import { BooksLibraryScreen } from "./BooksLibraryScreen";

interface BooksScreenProps {
	userData?: any;
}

type BooksScreenState = "library" | "wizard" | "editor";

export function BooksScreen({ userData }: BooksScreenProps) {
	const [currentScreen, setCurrentScreen] =
		useState<BooksScreenState>("library");
	const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

	const handleCreateBook = () => {
		setCurrentScreen("wizard");
	};

	const handleBackToLibrary = () => {
		setCurrentScreen("library");
		setCurrentDraftId(null);
	};

	const handleWizardComplete = (draftId: string) => {
		setCurrentDraftId(draftId);
		setCurrentScreen("editor");
	};

	const handleEditDraft = (draftId: string) => {
		setCurrentDraftId(draftId);
		setCurrentScreen("editor");
	};

	const handlePublishBook = (bookId: string) => {
		// TODO: Implement PDF generation and publishing
		console.log("Publishing book:", bookId);
		// For now, just go back to library
		handleBackToLibrary();
	};

	switch (currentScreen) {
		case "wizard":
			return (
				<BookCreationWizard
					onBack={handleBackToLibrary}
					onComplete={handleWizardComplete}
					userData={userData}
				/>
			);

		case "editor":
			return (
				<BookDraftEditor
					draftId={currentDraftId!}
					onBack={handleBackToLibrary}
					onPublish={handlePublishBook}
					userData={userData}
				/>
			);

		case "library":
		default:
			return (
				<BooksLibraryScreen
					onCreateBook={handleCreateBook}
					userData={userData}
				/>
			);
	}
}
