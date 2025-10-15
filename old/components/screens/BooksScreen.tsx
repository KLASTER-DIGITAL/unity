import { useState } from "react";
import { BooksLibraryScreen } from "./BooksLibraryScreen";
import { BookCreationWizard } from "./BookCreationWizard";
import { BookDraftEditor } from "./BookDraftEditor";

interface BooksScreenProps {
  userData?: any;
}

type BooksScreenState = 'library' | 'wizard' | 'editor';

export function BooksScreen({ userData }: BooksScreenProps) {
  const [currentScreen, setCurrentScreen] = useState<BooksScreenState>('library');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  const handleCreateBook = () => {
    setCurrentScreen('wizard');
  };

  const handleBackToLibrary = () => {
    setCurrentScreen('library');
    setCurrentDraftId(null);
  };

  const handleWizardComplete = (draftId: string) => {
    setCurrentDraftId(draftId);
    setCurrentScreen('editor');
  };

  const handleEditDraft = (draftId: string) => {
    setCurrentDraftId(draftId);
    setCurrentScreen('editor');
  };

  const handlePublishBook = (bookId: string) => {
    // TODO: Implement PDF generation and publishing
    console.log('Publishing book:', bookId);
    // For now, just go back to library
    handleBackToLibrary();
  };

  switch (currentScreen) {
    case 'wizard':
      return (
        <BookCreationWizard
          userData={userData}
          onBack={handleBackToLibrary}
          onComplete={handleWizardComplete}
        />
      );

    case 'editor':
      return (
        <BookDraftEditor
          draftId={currentDraftId!}
          userData={userData}
          onBack={handleBackToLibrary}
          onPublish={handlePublishBook}
        />
      );

    case 'library':
    default:
      return (
        <BooksLibraryScreen
          userData={userData}
          onCreateBook={handleCreateBook}
        />
      );
  }
}
