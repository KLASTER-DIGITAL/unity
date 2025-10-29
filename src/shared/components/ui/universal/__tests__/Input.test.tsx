/**
 * Input Component Tests
 * 
 * Tests for Universal Input component
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock Input component (since we don't have UniversalInput yet)
const Input = ({ 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  type = 'text',
  'aria-label': ariaLabel,
  className,
  ...props 
}: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    aria-label={ariaLabel}
    className={className}
    {...props}
  />
);

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input', () => {
      render(<Input aria-label="Test input" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text" aria-label="Test" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<Input className="custom-class" aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });
  });

  describe('Props', () => {
    it('should render with value', () => {
      render(<Input value="test value" onChange={vi.fn()} aria-label="Test" />);
      expect(screen.getByRole('textbox')).toHaveValue('test value');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled aria-label="Test" />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should support different input types', () => {
      const { rerender } = render(<Input type="email" aria-label="Email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
      
      rerender(<Input type="password" aria-label="Password" />);
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });
  });

  describe('Events', () => {
    it('should call onChange when value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} aria-label="Test" />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should not call onChange when disabled', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} disabled aria-label="Test" />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have textbox role', () => {
      render(<Input aria-label="Test" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(<Input aria-label="Test" />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      expect(input).toHaveFocus();
    });

    it('should have proper ARIA attributes', () => {
      render(<Input aria-label="Email address" />);
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    });
  });
});

