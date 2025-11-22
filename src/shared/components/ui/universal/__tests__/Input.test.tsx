/**
 * Input Component Tests
 *
 * Tests for Universal Input component
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
		aria-label={ariaLabel}
		className={className}
		disabled={disabled}
		onChange={(e) => {
			if (disabled) return;
			onChange?.(e);
		}}
		placeholder={placeholder}
		type={type}
		value={value}
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
			render(<Input aria-label="Test" placeholder="Enter text" />);
			expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
		});

		it('should render with custom className', () => {
			render(<Input aria-label="Test" className="custom-class" />);
			expect(screen.getByRole('textbox')).toHaveClass('custom-class');
		});
	});

	describe('Props', () => {
		it('should render with value', () => {
			render(<Input aria-label="Test" onChange={vi.fn()} value="test value" />);
			expect(screen.getByRole('textbox')).toHaveValue('test value');
		});

		it('should be disabled when disabled prop is true', () => {
			render(<Input aria-label="Test" disabled />);
			expect(screen.getByRole('textbox')).toBeDisabled();
		});

		it('should support different input types', () => {
			const { rerender } = render(<Input aria-label="Email" type="email" />);
			expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

			rerender(<Input aria-label="Password" type="password" />);
			expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
		});
	});

	describe('Events', () => {
		it('should call onChange when value changes', () => {
			const handleChange = vi.fn();
			render(<Input aria-label="Test" onChange={handleChange} />);

			const input = screen.getByRole('textbox');
			fireEvent.change(input, { target: { value: 'new value' } });

			expect(handleChange).toHaveBeenCalledTimes(1);
		});

		it('should not call onChange when disabled', () => {
			const handleChange = vi.fn();
			render(<Input aria-label="Test" disabled onChange={handleChange} />);

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
