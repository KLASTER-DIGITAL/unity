import { useState, useEffect } from 'react';

/**
 * Hook to detect if mobile keyboard is visible
 * Uses visualViewport API for accurate detection on iOS and Android
 * 
 * @returns boolean - true if keyboard is visible
 */
export function useKeyboardVisible(): boolean {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // Check if visualViewport is supported (iOS Safari 13+, Chrome 61+)
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const handleResize = () => {
      if (!window.visualViewport) return;

      // Check if focus is on input/textarea
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement;

      // Calculate keyboard height
      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      const keyboardHeight = windowHeight - viewportHeight;

      // Keyboard is considered visible if:
      // 1. Focus is on input/textarea AND keyboard takes more than 150px
      // 2. OR keyboard takes more than 150px (fallback for other cases)
      const isVisible = isInputFocused && keyboardHeight > 150;

      setIsKeyboardVisible(isVisible);
    };

    // Initial check
    handleResize();

    // Listen to viewport resize events
    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);

    // Listen to focus/blur events on input/textarea elements
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        // Delay to allow keyboard to appear
        setTimeout(handleResize, 100);
      }
    };

    const handleFocusOut = () => {
      // Delay to allow keyboard to disappear
      setTimeout(handleResize, 100);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return isKeyboardVisible;
}

