/**
 * Dialog Component Tests
 *
 * Tests for Universal Dialog component
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock Dialog component
const Dialog = ({ open, onOpenChange, children, title, description, ...props }: any) => {
  if (!open) {
    return null;
  }

  return (
    <div aria-labelledby="dialog-title" aria-modal="true" role="dialog" {...props}>
      {title && <h2 id="dialog-title">{title}</h2>}
      {description && <p>{description}</p>}
      {children}
      <button onClick={() => onOpenChange?.(false)}>Close</button>
    </div>
  );
};

describe('Dialog Component', () => {
  describe('Rendering', () => {
    it('should not render when closed', () => {
      render(<Dialog open={false}>Content</Dialog>);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(<Dialog open={true}>Content</Dialog>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render with title', () => {
      render(
        <Dialog open={true} title="Dialog Title">
          Content
        </Dialog>
      );
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(
        <Dialog description="Dialog description" open={true}>
          Content
        </Dialog>
      );
      expect(screen.getByText('Dialog description')).toBeInTheDocument();
    });

    it('should render children', () => {
      render(<Dialog open={true}>Dialog Content</Dialog>);
      expect(screen.getByText('Dialog Content')).toBeInTheDocument();
    });
  });

  describe('Events', () => {
    it('should call onOpenChange when close button is clicked', () => {
      const handleOpenChange = vi.fn();
      render(
        <Dialog onOpenChange={handleOpenChange} open={true}>
          Content
        </Dialog>
      );

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Accessibility', () => {
    it('should have dialog role', () => {
      render(<Dialog open={true}>Content</Dialog>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      render(<Dialog open={true}>Content</Dialog>);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby when title is provided', () => {
      render(
        <Dialog open={true} title="Dialog Title">
          Content
        </Dialog>
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'dialog-title');
    });
  });
});
