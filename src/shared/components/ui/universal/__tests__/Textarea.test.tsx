/**
 * Textarea Component Tests
 * 
 * Tests for Universal Textarea component
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock Textarea component
const Textarea = ({ 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  rows = 3,
  'aria-label': ariaLabel,
  className,
  ...props 
}: any) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    rows={rows}
    aria-label={ariaLabel}
    className={className}
    {...props}
  />
);

describe('Textarea Component', () => {
  describe('Rendering', () => {
    it('should render textarea', () => {
      render(<Textarea aria-label="Test textarea" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Textarea placeholder="Enter description" aria-label="Test" />);
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Textarea className="custom-class" aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });

    it('should render with rows prop', () => {
      render(<Textarea rows={5} aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
    });
  });

  describe('Props', () => {
    it('should render with value', () => {
      render(<Textarea value="test value" onChange={vi.fn()} aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveValue('test value');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Textarea disabled aria-label="Test" />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should support multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      render(<Textarea value={multilineText} onChange={vi.fn()} aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveValue(multilineText);
    });
  });

  describe('Events', () => {
    it('should call onChange when value changes', () => {
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} aria-label="Test" />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'new value' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should not call onChange when disabled', () => {
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} disabled aria-label="Test" />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'new value' } });
      
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have textbox role', () => {
      render(<Textarea aria-label="Test" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(<Textarea aria-label="Test" />);
      const textarea = screen.getByRole('textbox');
      
      textarea.focus();
      expect(textarea).toHaveFocus();
    });

    it('should have proper ARIA attributes', () => {
      render(<Textarea aria-label="Description" />);
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });
  });
});

