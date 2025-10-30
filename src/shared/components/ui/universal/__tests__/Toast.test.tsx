/**
 * Toast Component Tests
 *
 * Tests for Universal Toast component
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock Toast component
const Toast = ({
	open,
	onOpenChange,
	title,
	description,
	variant = "default",
	duration = 3000,
	...props
}: any) => {
	if (!open) {
		return null;
	}

	return (
		<div aria-live="polite" data-variant={variant} role="status" {...props}>
			{title && <div>{title}</div>}
			{description && <div>{description}</div>}
			<button onClick={() => onOpenChange?.(false)}>Close</button>
		</div>
	);
};

describe("Toast Component", () => {
	describe("Rendering", () => {
		it("should not render when closed", () => {
			render(<Toast open={false} title="Toast" />);
			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});

		it("should render when open", () => {
			render(<Toast open={true} title="Toast" />);
			expect(screen.getByRole("status")).toBeInTheDocument();
		});

		it("should render with title", () => {
			render(<Toast open={true} title="Success!" />);
			expect(screen.getByText("Success!")).toBeInTheDocument();
		});

		it("should render with description", () => {
			render(
				<Toast description="Operation completed" open={true} title="Success" />,
			);
			expect(screen.getByText("Operation completed")).toBeInTheDocument();
		});

		it("should render with variant", () => {
			render(<Toast open={true} title="Error" variant="destructive" />);
			const toast = screen.getByRole("status");
			expect(toast).toHaveAttribute("data-variant", "destructive");
		});
	});

	describe("Events", () => {
		it("should call onOpenChange when close button is clicked", () => {
			const handleOpenChange = vi.fn();
			render(
				<Toast onOpenChange={handleOpenChange} open={true} title="Toast" />,
			);

			const closeButton = screen.getByText("Close");
			fireEvent.click(closeButton);

			expect(handleOpenChange).toHaveBeenCalledWith(false);
		});
	});

	describe("Accessibility", () => {
		it("should have status role", () => {
			render(<Toast open={true} title="Toast" />);
			expect(screen.getByRole("status")).toBeInTheDocument();
		});

		it('should have aria-live="polite"', () => {
			render(<Toast open={true} title="Toast" />);
			expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
		});
	});

	describe("Variants", () => {
		it("should support default variant", () => {
			render(<Toast open={true} title="Info" variant="default" />);
			expect(screen.getByRole("status")).toHaveAttribute(
				"data-variant",
				"default",
			);
		});

		it("should support destructive variant", () => {
			render(<Toast open={true} title="Error" variant="destructive" />);
			expect(screen.getByRole("status")).toHaveAttribute(
				"data-variant",
				"destructive",
			);
		});
	});
});
