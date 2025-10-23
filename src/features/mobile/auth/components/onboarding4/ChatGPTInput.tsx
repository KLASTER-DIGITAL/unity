import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { imgMicrophone, imgPaperPlaneRight } from "@/imports/svg-w5pu5";
import { useSpeechRecognition } from "@/shared/hooks/useSpeechRecognition";

interface ChatGPTInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
}

/**
 * ChatGPT-style input component with voice recognition
 * Features:
 * - Auto-resizing textarea (2-5 lines)
 * - Voice input with microphone button
 * - Send button (enabled when text is present)
 * - Smooth animations
 */
export function ChatGPTInput({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder,
  disabled = false 
}: ChatGPTInputProps) {
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();
  const [textareaHeight, setTextareaHeight] = useState(52); // Initial height for 2 lines
  const [lastTranscript, setLastTranscript] = useState(''); // Track processed transcript

  // Initialize field height on mount
  useEffect(() => {
    const lineHeight = 18;
    const padding = 16;
    const initialHeight = lineHeight * 2 + padding;
    setTextareaHeight(initialHeight);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Auto-resize textarea (2-5 lines)
    const textarea = e.target;
    textarea.style.height = 'auto';
    const lineHeight = 18;
    const padding = 16;
    const minHeight = lineHeight * 2 + padding; // 2 lines
    const maxHeight = lineHeight * 5 + padding; // 5 lines
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    setTextareaHeight(newHeight);
    textarea.style.height = `${newHeight}px`;
  };

  const toggleRecording = () => {
    if (!isSupported) {
      alert('Речевой ввод не поддерживается в этом браузере');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    if (transcript && transcript.trim() && transcript !== lastTranscript) {
      // Add space only if there's existing text
      const newValue = value && value.trim() ? `${value.trim()} ${transcript.trim()}` : transcript.trim();
      onChange(newValue);
      setLastTranscript(transcript);
      
      // Update height after adding text from dictation
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        const textarea = Array.from(textareas).find(ta => ta.value === newValue) as HTMLTextAreaElement;
        if (textarea) {
          textarea.style.height = 'auto';
          const lineHeight = 18;
          const padding = 16;
          const minHeight = lineHeight * 2 + padding;
          const maxHeight = lineHeight * 5 + padding;
          const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
          setTextareaHeight(newHeight);
          textarea.style.height = `${newHeight}px`;
        }
      }, 0);
    }
  }, [transcript, lastTranscript, value, onChange]);

  return (
    <motion.div
      className="bg-card relative rounded-xl w-full border-2 border-border focus-within:border-[#756ef3] transition-all duration-300"
      data-name="Input"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileFocusWithin={{ 
        boxShadow: "0 4px 20px rgba(117, 110, 243, 0.2)" 
      }}
    >
      <div className="flex items-start gap-2 p-3">
        {/* Microphone Button */}
        <motion.button
          onClick={toggleRecording}
          disabled={disabled}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 flex-shrink-0 mt-0 ${
            isListening ? 'bg-red-100 text-red-600' : 'hover:bg-[#756ef3]/10 text-[#756ef3]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileTap={{ scale: 0.95 }}
          animate={isListening ? { scale: [1, 1.1, 1] } : {}}
          transition={isListening ? { repeat: Infinity, duration: 1 } : {}}
        >
          <div className="w-4 h-4">
            <img 
              className="w-full h-full" 
              src={imgMicrophone}
              style={{ filter: isListening ? 'sepia(1) saturate(5) hue-rotate(300deg)' : 'sepia(1) saturate(5) hue-rotate(240deg)' }}
            />
          </div>
        </motion.button>

        {/* Text Input */}
        <textarea
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent border-0 outline-none resize-none overflow-hidden placeholder:text-[#8d8d8d] placeholder:text-[11px] placeholder:font-normal text-[#002055] dark:text-[#1a1a1a]"
          style={{
            height: `${textareaHeight}px`,
            fontSize: '13px',
            fontWeight: 400,
            lineHeight: '18px',
            color: '#002055',
            fontFamily: 'var(--font-family-primary)',
            minHeight: '52px', // 2 lines
            maxHeight: '106px' // 5 lines
          }}
          rows={2}
        />

        {/* Send Button */}
        <motion.button
          onClick={onSubmit}
          disabled={!value.trim() || disabled}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 flex-shrink-0 mt-0 ${
            value.trim() && !disabled
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-[#e5e5e5] text-[#8d8d8d] cursor-not-allowed'
          }`}
          whileTap={value.trim() && !disabled ? { scale: 0.95 } : {}}
        >
          <div className="w-4 h-4">
            <img
              className="w-full h-full"
              src={imgPaperPlaneRight}
              style={{ filter: value.trim() && !disabled ? 'brightness(0) invert(1)' : undefined }}
            />
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}

