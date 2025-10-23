import { motion } from "motion/react";
import { Mic, Send, Image as ImageIcon } from "lucide-react";
import { DragDropZone } from "@/shared/components/DragDropZone";
import { MediaPreview } from "@/features/mobile/media";
import type { UploadedMedia } from "@/shared/hooks/useMediaUploader";
import { CATEGORIES } from "./constants";

interface InputAreaProps {
  inputText: string;
  selectedCategory: string | null;
  isRecording: boolean;
  isTranscribing: boolean;
  isUploading: boolean;
  uploadProgress: number;
  uploadedMedia: UploadedMedia[];
  userId: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onInputChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onVoiceClick: () => void;
  onMediaUpload: () => void;
  onSendMessage: () => void;
  onFilesDropped: (files: File[]) => void;
  onRemoveMedia: (index: number) => void;
  onMediaClick: (index: number) => void;
  onCategoryToggle: (categoryId: string) => void;
}

/**
 * Input Area Component
 * Main input area with voice, text, media upload, and send buttons
 */
export function InputArea({
  inputText,
  selectedCategory,
  isRecording,
  isTranscribing,
  isUploading,
  uploadProgress,
  uploadedMedia,
  userId,
  textareaRef,
  onInputChange,
  onKeyPress,
  onVoiceClick,
  onMediaUpload,
  onSendMessage,
  onFilesDropped,
  onRemoveMedia,
  onMediaClick,
  onCategoryToggle
}: InputAreaProps) {
  return (
    <div className="relative">
      {/* Main Input Container with Drag & Drop */}
      <DragDropZone
        onFilesSelected={onFilesDropped}
        disabled={isUploading || !userId || userId === 'anonymous'}
      >
        <div className="relative backdrop-blur-md bg-white/10 dark:bg-black/10 rounded-[16px] border border-white/20 transition-colors duration-300">
          <div className="flex items-end gap-responsive-xs p-2">
            {/* Voice Button */}
            <button
              onClick={onVoiceClick}
              disabled={isTranscribing}
              className={`flex-shrink-0 w-[28px] h-[28px] rounded-[16px] flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500'
                  : isTranscribing
                  ? 'bg-blue-500'
                  : 'hover:bg-muted active:scale-95'
              } ${isTranscribing ? 'opacity-50' : ''}`}
            >
              {isTranscribing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <Mic className="w-4 h-4" style={{ color: isRecording ? "white" : "var(--icon-primary)" }} />
              )}
            </button>

            {/* Text Input */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder="Опиши главную мысль, момент, благодарность"
                rows={1}
                className="w-full resize-none border-none outline-none bg-transparent !text-[14px] !font-normal leading-[20px] text-foreground placeholder:text-muted-foreground/40 max-h-[100px]"
                style={{
                  fontFamily: 'Inter, sans-serif'
                }}
              />
            </div>

            {/* Media Upload Button */}
            <button
              onClick={onMediaUpload}
              disabled={isUploading}
              className={`flex-shrink-0 w-[28px] h-[28px] rounded-[16px] flex items-center justify-center transition-all ${
                isUploading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-muted active:scale-95'
              }`}
            >
              {isUploading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full"
                />
              ) : (
                <ImageIcon className="w-4 h-4 text-foreground" />
              )}
            </button>

            {/* Send Button */}
            <button
              onClick={onSendMessage}
              disabled={!inputText.trim() && uploadedMedia.length === 0}
              className={`flex-shrink-0 w-[28px] h-[28px] rounded-[16px] flex items-center justify-center transition-all ${
                inputText.trim() || uploadedMedia.length > 0
                  ? 'hover:bg-muted active:scale-95'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Media Preview */}
          {(uploadedMedia.length > 0 || isUploading) && (
            <div className="mt-2 px-2">
              <MediaPreview
                media={uploadedMedia}
                onRemove={onRemoveMedia}
                onImageClick={onMediaClick}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            </div>
          )}
        </div>
      </DragDropZone>

      {/* Categories - horizontal scroll */}
      <div className="flex gap-responsive-xs mt-3 flex-nowrap overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryToggle(category.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border transition-all flex-shrink-0 ${
              selectedCategory === category.id
                ? 'bg-accent/10 border-accent'
                : 'bg-transparent border-border hover:bg-accent/5 active:scale-95'
            }`}
          >
            <span className="text-[10px]">{category.icon}</span>
            <span className="!text-[12px] !font-light text-foreground whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              {category.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

