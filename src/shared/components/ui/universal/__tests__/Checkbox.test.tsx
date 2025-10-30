/**
 * Checkbox Component Tests
 *
 * Tests for Universal Checkbox component
 * - Rendering
 * - Props
 * - Events
 * - Accessibility
 * - States (checked, unchecked, indeterminate)
 *
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UniversalCheckbox as Checkbox, CheckboxUtils } from '../UniversalCheckbox';

describe('Checkbox Component', () => {
	// ============================================================================
	// RENDERING TESTS
	// ============================================================================

	describe('Rendering', () => {
		it('should render checkbox', () => {
			render(<Checkbox aria-label="Test checkbox" />);
			expect(screen.getByRole('checkbox')).toBeInTheDocument();
		});

		it('should render checkbox with aria-label', () => {
			render(<Checkbox aria-label="Accept terms" />);
			expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
		});

		it('should render checkbox with custom className', () => {
			render(<Checkbox aria-label="Test" className="custom-class" />);
			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).toHaveClass('custom-class');
		});
	});

	// ============================================================================
	// PROPS TESTS
	// ============================================================================

	describe('Props', () => {
		it('should render unchecked by default', () => {
			render(<Checkbox aria-label="Test" />);
			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).not.toBeChecked();
		});

		it('should render checked when checked prop is true', () => {
			render(<Checkbox aria-label="Test" checked={true} />);
			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).toBeChecked();
		});

		it('should render unchecked when checked prop is false', () => {
			render(<Checkbox aria-label="Test" checked={false} />);
			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).not.toBeChecked();
		});

		it('should render with defaultChecked', () => {
			render(<Checkbox aria-label="Test" defaultChecked={true} />);
			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).toBeChecked();
		});

		it('should be disabled when disabled prop is true', () => {
			render(<Checkbox aria-label="Test" disabled />);
			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).toBeDisabled();
		});

		it('should not be disabled by default', () => {
			render(<Checkbox aria-label="Test" />);
			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).not.toBeDisabled();
		});
	});

	// ============================================================================
	// EVENTS TESTS
	// ============================================================================

	describe('Events', () => {
		it('should call onCheckedChange when clicked', () => {
			const handleChange = vi.fn();
			render(<Checkbox aria-label="Test" onCheckedChange={handleChange} />);

			fireEvent.click(screen.getByRole('checkbox'));
			expect(handleChange).toHaveBeenCalledTimes(1);
			expect(handleChange).toHaveBeenCalledWith(true);
		});

		it('should toggle checked state when clicked (uncontrolled)', () => {
			const handleChange = vi.fn();
			render(<Checkbox aria-label="Test" onCheckedChange={handleChange} />);

			const checkbox = screen.getByRole('checkbox');

			// First click - check
			fireEvent.click(checkbox);
			expect(handleChange).toHaveBeenCalledWith(true);

			// Second click - uncheck
			fireEvent.click(checkbox);
			expect(handleChange).toHaveBeenCalledWith(false);
		});

		it('should not call onCheckedChange when disabled', () => {
			const handleChange = vi.fn();
			render(<Checkbox aria-label="Test" disabled onCheckedChange={handleChange} />);

			fireEvent.click(screen.getByRole('checkbox'));
			expect(handleChange).not.toHaveBeenCalled();
		});

		it('should work as controlled component', () => {
			const handleChange = vi.fn();
			const { rerender } = render(
				<Checkbox aria-label="Test" checked={false} onCheckedChange={handleChange} />
			);

			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).not.toBeChecked();

			fireEvent.click(checkbox);
			expect(handleChange).toHaveBeenCalledWith(true);

			// Simulate parent updating checked prop
			rerender(<Checkbox aria-label="Test" checked={true} onCheckedChange={handleChange} />);
			expect(checkbox).toBeChecked();
		});
	});

	// ============================================================================
	// ACCESSIBILITY TESTS
	// ============================================================================

	describe('Accessibility', () => {
		it('should have checkbox role', () => {
			render(<Checkbox aria-label="Test" />);
			expect(screen.getByRole('checkbox')).toBeInTheDocument();
		});

		it('should be keyboard accessible', () => {
			const handleChange = vi.fn();
			render(<Checkbox aria-label="Test" onCheckedChange={handleChange} />);

			const checkbox = screen.getByRole('checkbox');
			checkbox.focus();
			expect(checkbox).toHaveFocus();

			// Space key should toggle
			fireEvent.keyDown(checkbox, { key: ' ', code: 'Space' });
			expect(handleChange).toHaveBeenCalled();
		});

		it('should not be focusable when disabled', () => {
			render(<Checkbox aria-label="Test" disabled />);
			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).toBeDisabled();
		});

		it('should have proper ARIA attributes', () => {
			render(<Checkbox aria-label="Accept terms" checked={true} />);
			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).toHaveAttribute('aria-label', 'Accept terms');
			expect(checkbox).toHaveAttribute('aria-checked', 'true');
		});
	});

	// ============================================================================
	// CHECKBOX UTILS TESTS
	// ============================================================================

	describe('CheckboxUtils', () => {
		describe('validateProps', () => {
			it('should validate correct props', () => {
				const result = CheckboxUtils.validateProps({ checked: true });
				expect(result.valid).toBe(true);
				expect(result.errors).toHaveLength(0);
			});

			it('should validate defaultChecked only', () => {
				const result = CheckboxUtils.validateProps({ defaultChecked: true });
				expect(result.valid).toBe(true);
				expect(result.errors).toHaveLength(0);
			});

			it('should invalidate both checked and defaultChecked', () => {
				const result = CheckboxUtils.validateProps({
					checked: true,
					defaultChecked: true,
				});
				expect(result.valid).toBe(false);
				expect(result.errors).toContain('Checkbox cannot have both checked and defaultChecked');
			});

			it('should validate empty props', () => {
				const result = CheckboxUtils.validateProps({});
				expect(result.valid).toBe(true);
				expect(result.errors).toHaveLength(0);
			});
		});
	});

	// ============================================================================
	// INDETERMINATE STATE TESTS
	// ============================================================================

	describe('Indeterminate State', () => {
		it('should support indeterminate state', () => {
			render(<Checkbox aria-label="Test" checked="indeterminate" />);
			const checkbox = screen.getByRole('checkbox');
			expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
		});

		it('should call onCheckedChange with indeterminate', () => {
			const handleChange = vi.fn();
			render(<Checkbox aria-label="Test" checked="indeterminate" onCheckedChange={handleChange} />);

			fireEvent.click(screen.getByRole('checkbox'));
			expect(handleChange).toHaveBeenCalled();
		});
	});
});
