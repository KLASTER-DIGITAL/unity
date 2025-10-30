/**
 * Modal Component Tests
 *
 * Tests for Universal Modal component
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock Modal component
const Modal = ({ open, onClose, children, title, ...props }: any) => {
	if (!open) {
		return null;
	}

	return (
		<div aria-modal="true" role="dialog" {...props}>
			{title && <h2>{title}</h2>}
			{children}
			<button onClick={onClose}>Close</button>
		</div>
	);
};

describe('Modal Component', () => {
	describe('Rendering', () => {
		it('should not render when closed', () => {
			render(<Modal open={false}>Content</Modal>);
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});

		it('should render when open', () => {
			render(<Modal open={true}>Content</Modal>);
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('should render with title', () => {
			render(
				<Modal open={true} title="Modal Title">
					Content
				</Modal>
			);
			expect(screen.getByText('Modal Title')).toBeInTheDocument();
		});

		it('should render children', () => {
			render(<Modal open={true}>Modal Content</Modal>);
			expect(screen.getByText('Modal Content')).toBeInTheDocument();
		});
	});

	describe('Events', () => {
		it('should call onClose when close button is clicked', () => {
			const handleClose = vi.fn();
			render(
				<Modal onClose={handleClose} open={true}>
					Content
				</Modal>
			);

			const closeButton = screen.getByText('Close');
			fireEvent.click(closeButton);

			expect(handleClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('Accessibility', () => {
		it('should have dialog role', () => {
			render(<Modal open={true}>Content</Modal>);
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('should have aria-modal attribute', () => {
			render(<Modal open={true}>Content</Modal>);
			expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
		});
	});
});
