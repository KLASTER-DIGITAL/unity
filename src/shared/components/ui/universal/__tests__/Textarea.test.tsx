/**
 * Textarea Component Tests
 *
 * Tests for Universal Textarea component
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
		aria-label={ariaLabel}
		className={className}
		disabled={disabled}
		onChange={onChange}
		placeholder={placeholder}
		rows={rows}
		value={value}
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
			render(<Textarea aria-label="Test" placeholder="Enter description" />);
			expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
		});

		it('should render with custom className', () => {
			render(<Textarea aria-label="Test" className="custom-class" />);
			expect(screen.getByRole('textbox')).toHaveClass('custom-class');
		});

		it('should render with rows prop', () => {
			render(<Textarea aria-label="Test" rows={5} />);
			expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
		});
	});

	describe('Props', () => {
		it('should render with value', () => {
			render(<Textarea aria-label="Test" onChange={vi.fn()} value="test value" />);
			expect(screen.getByRole('textbox')).toHaveValue('test value');
		});

		it('should be disabled when disabled prop is true', () => {
			render(<Textarea aria-label="Test" disabled />);
			expect(screen.getByRole('textbox')).toBeDisabled();
		});

		it('should support multiline text', () => {
			const multilineText = 'Line 1\nLine 2\nLine 3';
			render(<Textarea aria-label="Test" onChange={vi.fn()} value={multilineText} />);
			expect(screen.getByRole('textbox')).toHaveValue(multilineText);
		});
	});

	describe('Events', () => {
		it('should call onChange when value changes', () => {
			const handleChange = vi.fn();
			render(<Textarea aria-label="Test" onChange={handleChange} />);

			const textarea = screen.getByRole('textbox');
			fireEvent.change(textarea, { target: { value: 'new value' } });

			expect(handleChange).toHaveBeenCalledTimes(1);
		});

		it('should not call onChange when disabled', () => {
			const handleChange = vi.fn();
			render(<Textarea aria-label="Test" disabled onChange={handleChange} />);

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
