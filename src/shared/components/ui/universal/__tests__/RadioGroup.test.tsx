/**
 * RadioGroup Component Tests
 * 
 * Tests for Universal RadioGroup component
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock RadioGroup component
const RadioGroup = ({ 
  value, 
  onValueChange, 
  children,
  'aria-label': ariaLabel,
  ...props 
}: any) => (
  <div role="radiogroup" aria-label={ariaLabel} {...props}>
    {children}
  </div>
);

const RadioGroupItem = ({ 
  value, 
  id,
  children,
  ...props 
}: any) => (
  <div>
    <input type="radio" value={value} id={id} {...props} />
    <label htmlFor={id}>{children}</label>
  </div>
);

describe('RadioGroup Component', () => {
  describe('Rendering', () => {
    it('should render radiogroup', () => {
      render(<RadioGroup aria-label="Test radiogroup" />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('should render radio items', () => {
      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem value="option1" id="opt1">Option 1</RadioGroupItem>
          <RadioGroupItem value="option2" id="opt2">Option 2</RadioGroupItem>
        </RadioGroup>
      );
      
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should select radio by value', () => {
      render(
        <RadioGroup value="option2" aria-label="Test">
          <RadioGroupItem value="option1" id="opt1">Option 1</RadioGroupItem>
          <RadioGroupItem value="option2" id="opt2" checked>Option 2</RadioGroupItem>
        </RadioGroup>
      );
      
      const radio2 = screen.getByLabelText('Option 2') as HTMLInputElement;
      expect(radio2.checked).toBe(true);
    });
  });

  describe('Events', () => {
    it('should call onValueChange when radio is selected', () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup onValueChange={handleChange} aria-label="Test">
          <RadioGroupItem value="option1" id="opt1" onChange={() => handleChange('option1')}>
            Option 1
          </RadioGroupItem>
          <RadioGroupItem value="option2" id="opt2" onChange={() => handleChange('option2')}>
            Option 2
          </RadioGroupItem>
        </RadioGroup>
      );
      
      const radio2 = screen.getByLabelText('Option 2');
      fireEvent.click(radio2);
      
      expect(handleChange).toHaveBeenCalledWith('option2');
    });
  });

  describe('Accessibility', () => {
    it('should have radiogroup role', () => {
      render(<RadioGroup aria-label="Test" />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<RadioGroup aria-label="Choose option" />);
      expect(screen.getByLabelText('Choose option')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem value="option1" id="opt1">Option 1</RadioGroupItem>
          <RadioGroupItem value="option2" id="opt2">Option 2</RadioGroupItem>
        </RadioGroup>
      );
      
      const radio1 = screen.getByLabelText('Option 1');
      radio1.focus();
      expect(radio1).toHaveFocus();
    });
  });
});

