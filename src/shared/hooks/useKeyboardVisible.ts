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

      // Calculate keyboard height
      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      const keyboardHeight = windowHeight - viewportHeight;

      // Keyboard is considered visible if it takes more than 150px
      // (to avoid false positives from browser UI changes)
      const isVisible = keyboardHeight > 150;

      setIsKeyboardVisible(isVisible);
    };

    // Initial check
    handleResize();

    // Listen to viewport resize events
    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  return isKeyboardVisible;
}

