/**
 * Switch Component Tests
 *
 * Tests for Universal Switch component
 * - Rendering
 * - Props
 * - Events
 * - Accessibility
 *
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UniversalSwitch as Switch } from '../UniversalSwitch';

describe('Switch Component', () => {
	// ============================================================================
	// RENDERING TESTS
	// ============================================================================

	describe('Rendering', () => {
		it('should render switch', () => {
			render(<Switch aria-label="Test switch" />);
			expect(screen.getByRole('switch')).toBeInTheDocument();
		});

		it('should render switch with aria-label', () => {
			render(<Switch aria-label="Enable notifications" />);
			expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
		});

		it('should render switch with custom className', () => {
			render(<Switch aria-label="Test" className="custom-class" />);
			const switchElement = screen.getByRole('switch');
			expect(switchElement).toHaveClass('custom-class');
		});
	});

	// ============================================================================
	// PROPS TESTS
	// ============================================================================

	describe('Props', () => {
		it('should render unchecked by default', () => {
			render(<Switch aria-label="Test" />);
			const switchElement = screen.getByRole('switch');
			expect(switchElement).not.toBeChecked();
		});

		it('should render checked when checked prop is true', () => {
			render(<Switch aria-label="Test" checked={true} />);
			const switchElement = screen.getByRole('switch');
			expect(switchElement).toBeChecked();
		});

		it('should render unchecked when checked prop is false', () => {
			render(<Switch aria-label="Test" checked={false} />);
			const switchElement = screen.getByRole('switch');
			expect(switchElement).not.toBeChecked();
		});

		it('should render with defaultChecked', () => {
			render(<Switch aria-label="Test" defaultChecked={true} />);
			const switchElement = screen.getByRole('switch');
			expect(switchElement).toBeChecked();
		});

		it('should be disabled when disabled prop is true', () => {
			render(<Switch aria-label="Test" disabled />);
			const switchElement = screen.getByRole('switch');
			expect(switchElement).toBeDisabled();
		});

		it('should not be disabled by default', () => {
			render(<Switch aria-label="Test" />);
			const switchElement = screen.getByRole('switch');
			expect(switchElement).not.toBeDisabled();
		});
	});

	// ============================================================================
	// EVENTS TESTS
	// ============================================================================

	describe('Events', () => {
		it('should call onCheckedChange when clicked', () => {
			const handleChange = vi.fn();
			render(<Switch aria-label="Test" onCheckedChange={handleChange} />);

			fireEvent.click(screen.getByRole('switch'));
			expect(handleChange).toHaveBeenCalledTimes(1);
			expect(handleChange).toHaveBeenCalledWith(true);
		});

		it('should toggle checked state when clicked (uncontrolled)', () => {
			const handleChange = vi.fn();
			render(<Switch aria-label="Test" onCheckedChange={handleChange} />);

			const switchElement = screen.getByRole('switch');

			// First click - check
			fireEvent.click(switchElement);
			expect(handleChange).toHaveBeenCalledWith(true);

			// Second click - uncheck
			fireEvent.click(switchElement);
			expect(handleChange).toHaveBeenCalledWith(false);
		});

		it('should not call onCheckedChange when disabled', () => {
			const handleChange = vi.fn();
			render(<Switch aria-label="Test" disabled onCheckedChange={handleChange} />);

			fireEvent.click(screen.getByRole('switch'));
			expect(handleChange).not.toHaveBeenCalled();
		});

		it('should work as controlled component', () => {
			const handleChange = vi.fn();
			const { rerender } = render(
				<Switch aria-label="Test" checked={false} onCheckedChange={handleChange} />
			);

			const switchElement = screen.getByRole('switch');
			expect(switchElement).not.toBeChecked();

			fireEvent.click(switchElement);
			expect(handleChange).toHaveBeenCalledWith(true);

			// Simulate parent updating checked prop
			rerender(<Switch aria-label="Test" checked={true} onCheckedChange={handleChange} />);
			expect(switchElement).toBeChecked();
		});
	});

	// ============================================================================
	// ACCESSIBILITY TESTS
	// ============================================================================

	describe('Accessibility', () => {
		it('should have switch role', () => {
			render(<Switch aria-label="Test" />);
			expect(screen.getByRole('switch')).toBeInTheDocument();
		});

		it('should be keyboard accessible', () => {
			const handleChange = vi.fn();
			render(<Switch aria-label="Test" onCheckedChange={handleChange} />);

			const switchElement = screen.getByRole('switch');
			switchElement.focus();
			expect(switchElement).toHaveFocus();

			// Space key should toggle
			fireEvent.keyDown(switchElement, { key: ' ', code: 'Space' });
			expect(handleChange).toHaveBeenCalled();
		});

		it('should not be focusable when disabled', () => {
			render(<Switch aria-label="Test" disabled />);
			const switchElement = screen.getByRole('switch');
			expect(switchElement).toBeDisabled();
		});

		it('should have proper ARIA attributes', () => {
			render(<Switch aria-label="Enable dark mode" checked={true} />);
			const switchElement = screen.getByRole('switch');
			expect(switchElement).toHaveAttribute('aria-label', 'Enable dark mode');
			expect(switchElement).toHaveAttribute('aria-checked', 'true');
		});

		it('should have aria-checked="false" when unchecked', () => {
			render(<Switch aria-label="Test" checked={false} />);
			const switchElement = screen.getByRole('switch');
			expect(switchElement).toHaveAttribute('aria-checked', 'false');
		});
	});
});
