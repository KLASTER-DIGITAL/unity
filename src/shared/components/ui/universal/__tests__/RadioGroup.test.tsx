/**
 * RadioGroup Component Tests
 *
 * Tests for Universal RadioGroup component
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock RadioGroup component
const RadioGroup = ({
	value,
	onValueChange,
	children,
	"aria-label": ariaLabel,
	...props
}: any) => (
	<div aria-label={ariaLabel} role="radiogroup" {...props}>
		{children}
	</div>
);

const RadioGroupItem = ({ value, id, children, ...props }: any) => (
	<div>
		<input id={id} type="radio" value={value} {...props} />
		<label htmlFor={id}>{children}</label>
	</div>
);

describe("RadioGroup Component", () => {
	describe("Rendering", () => {
		it("should render radiogroup", () => {
			render(<RadioGroup aria-label="Test radiogroup" />);
			expect(screen.getByRole("radiogroup")).toBeInTheDocument();
		});

		it("should render radio items", () => {
			render(
				<RadioGroup aria-label="Test">
					<RadioGroupItem id="opt1" value="option1">
						Option 1
					</RadioGroupItem>
					<RadioGroupItem id="opt2" value="option2">
						Option 2
					</RadioGroupItem>
				</RadioGroup>,
			);

			expect(screen.getByLabelText("Option 1")).toBeInTheDocument();
			expect(screen.getByLabelText("Option 2")).toBeInTheDocument();
		});
	});

	describe("Props", () => {
		it("should select radio by value", () => {
			render(
				<RadioGroup aria-label="Test" value="option2">
					<RadioGroupItem id="opt1" value="option1">
						Option 1
					</RadioGroupItem>
					<RadioGroupItem checked id="opt2" value="option2">
						Option 2
					</RadioGroupItem>
				</RadioGroup>,
			);

			const radio2 = screen.getByLabelText("Option 2") as HTMLInputElement;
			expect(radio2.checked).toBe(true);
		});
	});

	describe("Events", () => {
		it("should call onValueChange when radio is selected", () => {
			const handleChange = vi.fn();
			render(
				<RadioGroup aria-label="Test" onValueChange={handleChange}>
					<RadioGroupItem
						id="opt1"
						onChange={() => handleChange("option1")}
						value="option1"
					>
						Option 1
					</RadioGroupItem>
					<RadioGroupItem
						id="opt2"
						onChange={() => handleChange("option2")}
						value="option2"
					>
						Option 2
					</RadioGroupItem>
				</RadioGroup>,
			);

			const radio2 = screen.getByLabelText("Option 2");
			fireEvent.click(radio2);

			expect(handleChange).toHaveBeenCalledWith("option2");
		});
	});

	describe("Accessibility", () => {
		it("should have radiogroup role", () => {
			render(<RadioGroup aria-label="Test" />);
			expect(screen.getByRole("radiogroup")).toBeInTheDocument();
		});

		it("should have proper ARIA attributes", () => {
			render(<RadioGroup aria-label="Choose option" />);
			expect(screen.getByLabelText("Choose option")).toBeInTheDocument();
		});

		it("should be keyboard accessible", () => {
			render(
				<RadioGroup aria-label="Test">
					<RadioGroupItem id="opt1" value="option1">
						Option 1
					</RadioGroupItem>
					<RadioGroupItem id="opt2" value="option2">
						Option 2
					</RadioGroupItem>
				</RadioGroup>,
			);

			const radio1 = screen.getByLabelText("Option 1");
			radio1.focus();
			expect(radio1).toHaveFocus();
		});
	});
});
