/**
 * Universal Dialog Component - Native Implementation
 * 
 * Uses React Native Modal for native platform
 * 
 * @module components/ui/universal/Dialog.native
 */

import React, { createContext, useContext, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface DialogProps {
  /** Whether the dialog is open */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Dialog content */
  children?: React.ReactNode;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
}

export interface DialogContentProps {
  /** Content children */
  children?: React.ReactNode;
  /** Custom className (ignored in native) */
  className?: string;
  /** Show close button */
  showClose?: boolean;
  /** Close button aria label */
  closeLabel?: string;
}

export interface DialogHeaderProps {
  /** Header children */
  children?: React.ReactNode;
  /** Custom className (ignored in native) */
  className?: string;
}

export interface DialogFooterProps {
  /** Footer children */
  children?: React.ReactNode;
  /** Custom className (ignored in native) */
  className?: string;
}

export interface DialogTitleProps {
  /** Title text */
  children?: React.ReactNode;
  /** Custom className (ignored in native) */
  className?: string;
}

export interface DialogDescriptionProps {
  /** Description text */
  children?: React.ReactNode;
  /** Custom className (ignored in native) */
  className?: string;
}

// ============================================================================
// CONTEXT
// ============================================================================

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within Dialog');
  }
  return context;
}

// ============================================================================
// DYNAMIC IMPORTS
// ============================================================================

let Modal: any = null;
let View: any = null;
let Text: any = null;
let TouchableOpacity: any = null;
let StyleSheet: any = null;
let ScrollView: any = null;

async function loadReactNative() {
  if (Modal) return;
  
  try {
    // @ts-expect-error - react-native is not installed in PWA build
    const RN = await import(/* @vite-ignore */ 'react-native');
    Modal = RN.Modal;
    View = RN.View;
    Text = RN.Text;
    TouchableOpacity = RN.TouchableOpacity;
    StyleSheet = RN.StyleSheet;
    ScrollView = RN.ScrollView;
  } catch (error) {
    console.error('Failed to load React Native:', error);
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

export function Dialog({ children, open, onOpenChange, defaultOpen = false }: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, ...props }: any) {
  const { setOpen } = useDialogContext();

  React.useEffect(() => {
    loadReactNative();
  }, []);

  if (!TouchableOpacity) {
    return <>{children}</>;
  }

  return (
    <TouchableOpacity onPress={() => setOpen(true)} {...props}>
      {children}
    </TouchableOpacity>
  );
}

export function DialogPortal({ children }: any) {
  // Portal is handled by Modal in React Native
  return <>{children}</>;
}

export function DialogClose({ children, ...props }: any) {
  const { setOpen } = useDialogContext();

  React.useEffect(() => {
    loadReactNative();
  }, []);

  if (!TouchableOpacity) {
    return <>{children}</>;
  }

  return (
    <TouchableOpacity onPress={() => setOpen(false)} {...props}>
      {children}
    </TouchableOpacity>
  );
}

export function DialogOverlay() {
  // Overlay is handled by Modal backdrop in React Native
  return null;
}

export function DialogContent({
  children,
  showClose = true,
  closeLabel = 'Close',
}: DialogContentProps) {
  const { open, setOpen } = useDialogContext();

  React.useEffect(() => {
    loadReactNative();
  }, []);

  if (!Modal || !View || !Text || !TouchableOpacity || !ScrollView) {
    return null;
  }

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalContent: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 24,
      width: '100%',
      maxWidth: 500,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#f3f4f6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 18,
      color: '#6b7280',
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setOpen(false)}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e: any) => e.stopPropagation()}>
          <ScrollView style={styles.modalContent}>
            {children}
            {showClose && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setOpen(false)}
                accessibilityLabel={closeLabel}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export function DialogHeader({ children }: DialogHeaderProps) {
  React.useEffect(() => {
    loadReactNative();
  }, []);

  if (!View) {
    return <>{children}</>;
  }

  const styles = StyleSheet.create({
    header: {
      marginBottom: 16,
    },
  });

  return <View style={styles.header}>{children}</View>;
}

export function DialogFooter({ children }: DialogFooterProps) {
  React.useEffect(() => {
    loadReactNative();
  }, []);

  if (!View) {
    return <>{children}</>;
  }

  const styles = StyleSheet.create({
    footer: {
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
  });

  return <View style={styles.footer}>{children}</View>;
}

export function DialogTitle({ children }: DialogTitleProps) {
  React.useEffect(() => {
    loadReactNative();
  }, []);

  if (!Text) {
    return <>{children}</>;
  }

  const styles = StyleSheet.create({
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 8,
    },
  });

  return <Text style={styles.title}>{children}</Text>;
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  React.useEffect(() => {
    loadReactNative();
  }, []);

  if (!Text) {
    return <>{children}</>;
  }

  const styles = StyleSheet.create({
    description: {
      fontSize: 14,
      color: '#6b7280',
      lineHeight: 20,
    },
  });

  return <Text style={styles.description}>{children}</Text>;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

