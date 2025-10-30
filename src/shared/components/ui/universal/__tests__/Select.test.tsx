/**
 * Select Component Tests
 *
 * Tests for Universal Select component
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UniversalSelect as Select } from '../UniversalSelect';

describe('Select Component', () => {
	const options = [
		{ value: 'option1', label: 'Option 1' },
		{ value: 'option2', label: 'Option 2' },
		{ value: 'option3', label: 'Option 3' },
	];

	describe('Rendering', () => {
		it('should render select', () => {
			render(<Select aria-label="Test select" options={options} />);
			expect(screen.getByRole('combobox')).toBeInTheDocument();
		});

		it('should render with placeholder', () => {
			render(<Select aria-label="Test" options={options} placeholder="Select option" />);
			expect(screen.getByText('Select option')).toBeInTheDocument();
		});

		it('should render all options when opened', () => {
			render(<Select aria-label="Test" options={options} />);

			const select = screen.getByRole('combobox');
			fireEvent.click(select);

			expect(screen.getByText('Option 1')).toBeInTheDocument();
			expect(screen.getByText('Option 2')).toBeInTheDocument();
			expect(screen.getByText('Option 3')).toBeInTheDocument();
		});
	});

	describe('Props', () => {
		it('should render with selected value', () => {
			render(<Select aria-label="Test" options={options} value="option2" />);
			expect(screen.getByText('Option 2')).toBeInTheDocument();
		});

		it('should be disabled when disabled prop is true', () => {
			render(<Select aria-label="Test" disabled options={options} />);
			const select = screen.getByRole('combobox');
			expect(select).toHaveAttribute('aria-disabled', 'true');
		});
	});

	describe('Events', () => {
		it('should call onValueChange when option is selected', () => {
			const handleChange = vi.fn();
			render(<Select aria-label="Test" onValueChange={handleChange} options={options} />);

			const select = screen.getByRole('combobox');
			fireEvent.click(select);

			const option = screen.getByText('Option 2');
			fireEvent.click(option);

			expect(handleChange).toHaveBeenCalledWith('option2');
		});

		it('should not call onValueChange when disabled', () => {
			const handleChange = vi.fn();
			render(<Select aria-label="Test" disabled onValueChange={handleChange} options={options} />);

			const select = screen.getByRole('combobox');
			fireEvent.click(select);

			expect(handleChange).not.toHaveBeenCalled();
		});
	});

	describe('Accessibility', () => {
		it('should have combobox role', () => {
			render(<Select aria-label="Test" options={options} />);
			expect(screen.getByRole('combobox')).toBeInTheDocument();
		});

		it('should be keyboard accessible', () => {
			render(<Select aria-label="Test" options={options} />);
			const select = screen.getByRole('combobox');

			select.focus();
			expect(select).toHaveFocus();

			// Arrow down should open menu
			fireEvent.keyDown(select, { key: 'ArrowDown' });
			expect(screen.getByText('Option 1')).toBeInTheDocument();
		});

		it('should have proper ARIA attributes', () => {
			render(<Select aria-label="Choose option" options={options} />);
			expect(screen.getByLabelText('Choose option')).toBeInTheDocument();
		});
	});
});
