/**
 * Button Component Tests
 * 
 * Tests for Universal Button component
 * - Rendering
 * - Props
 * - Events
 * - Accessibility
 * - Variants
 * - Sizes
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, ButtonUtils } from '../Button';

describe('Button Component', () => {
  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render button with testID', () => {
      render(<Button testID="test-button">Click me</Button>);
      expect(screen.getByTestId('test-button')).toBeInTheDocument();
    });

    it('should render button with custom className', () => {
      render(<Button className="custom-class">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should render button with left icon', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon">←</span>}>
          Click me
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('should render button with right icon', () => {
      render(
        <Button rightIcon={<span data-testid="right-icon">→</span>}>
          Click me
        </Button>
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // PROPS TESTS
  // ============================================================================

  describe('Props', () => {
    it('should apply default variant', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('should apply destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });

    it('should apply outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
    });

    it('should apply secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });

    it('should apply ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('should apply link variant', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('underline-offset-4');
    });

    it('should apply default size', () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
    });

    it('should apply small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
    });

    it('should apply large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
    });

    it('should apply icon size', () => {
      render(<Button size="icon">🔍</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'w-9');
    });

    it('should apply fullWidth prop', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('should disable button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should disable button when loading prop is true', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show loading spinner when loading', () => {
      render(<Button loading>Loading</Button>);
      const spinner = screen.getByRole('button').querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should hide icons when loading', () => {
      render(
        <Button 
          loading 
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Loading
        </Button>
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // EVENTS TESTS
  // ============================================================================

  describe('Events', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onPress handler when clicked', () => {
      const handlePress = vi.fn();
      render(<Button onPress={handlePress}>Press me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handlePress).toHaveBeenCalledTimes(1);
    });

    it('should call both onClick and onPress when provided', () => {
      const handleClick = vi.fn();
      const handlePress = vi.fn();
      render(
        <Button onClick={handleClick} onPress={handlePress}>
          Click me
        </Button>
      );
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handlePress).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} loading>Loading</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should apply aria-label from accessibilityLabel prop', () => {
      render(<Button accessibilityLabel="Submit form">Submit</Button>);
      expect(screen.getByLabelText('Submit form')).toBeInTheDocument();
    });

    it('should have correct type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should have default type="button"', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should be focusable when not disabled', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // BUTTON UTILS TESTS
  // ============================================================================

  describe('ButtonUtils', () => {
    describe('getVariantStyles', () => {
      it('should return default variant styles', () => {
        const styles = ButtonUtils.getVariantStyles('default');
        expect(styles).toEqual({ backgroundColor: '#007AFF', color: 'white' });
      });

      it('should return destructive variant styles', () => {
        const styles = ButtonUtils.getVariantStyles('destructive');
        expect(styles).toEqual({ backgroundColor: '#FF3B30', color: 'white' });
      });

      it('should return outline variant styles', () => {
        const styles = ButtonUtils.getVariantStyles('outline');
        expect(styles).toEqual({ 
          backgroundColor: 'transparent', 
          borderColor: '#C7C7CC', 
          color: '#000' 
        });
      });
    });

    describe('getSizeStyles', () => {
      it('should return default size styles', () => {
        const styles = ButtonUtils.getSizeStyles('default');
        expect(styles).toEqual({ padding: 12, fontSize: 14 });
      });

      it('should return small size styles', () => {
        const styles = ButtonUtils.getSizeStyles('sm');
        expect(styles).toEqual({ padding: 8, fontSize: 12 });
      });

      it('should return large size styles', () => {
        const styles = ButtonUtils.getSizeStyles('lg');
        expect(styles).toEqual({ padding: 16, fontSize: 16 });
      });

      it('should return icon size styles', () => {
        const styles = ButtonUtils.getSizeStyles('icon');
        expect(styles).toEqual({ padding: 12, width: 36, height: 36 });
      });
    });

    describe('validateProps', () => {
      it('should validate correct props', () => {
        const result = ButtonUtils.validateProps({ variant: 'default', size: 'sm' });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should invalidate incorrect variant', () => {
        const result = ButtonUtils.validateProps({ variant: 'invalid' as any });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Invalid variant: invalid');
      });

      it('should invalidate incorrect size', () => {
        const result = ButtonUtils.validateProps({ size: 'invalid' as any });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Invalid size: invalid');
      });
    });
  });
});

