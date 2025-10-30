/**
 * Universal Select Component for UNITY-v2
 *
 * Cross-platform select that works on both Web and React Native
 * Replaces @radix-ui/react-select
 *
 * @author UNITY Team
 * @date 2025-01-18
 */

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../utils";
import type {
	FormFieldProps,
	SelectOption,
	UniversalEventHandlers,
} from "./types";

/**
 * Select component props
 */
export interface SelectProps extends FormFieldProps, UniversalEventHandlers {
	/**
	 * Select options
	 */
	options: SelectOption[];

	/**
	 * Selected value
	 */
	value?: string | number;

	/**
	 * Default selected value
	 */
	defaultValue?: string | number;

	/**
	 * Placeholder text
	 */
	placeholder?: string;

	/**
	 * Multiple selection
	 */
	multiple?: boolean;

	/**
	 * Searchable select
	 */
	searchable?: boolean;

	/**
	 * Clear button
	 */
	clearable?: boolean;

	/**
	 * Loading state
	 */
	loading?: boolean;

	/**
	 * Custom option renderer
	 */
	renderOption?: (option: SelectOption) => React.ReactNode;

	/**
	 * Custom value renderer
	 */
	renderValue?: (option: SelectOption | null) => React.ReactNode;

	/**
	 * Change handler
	 */
	onValueChange?: (value: string | number | null) => void;

	/**
	 * Search handler
	 */
	onSearch?: (query: string) => void;
}

/**
 * Web-specific select implementation
 */
const WebSelect = ({
	options = [],
	value,
	defaultValue,
	placeholder = "Select an option...",
	multiple = false,
	searchable = false,
	clearable = false,
	loading = false,
	disabled = false,
	className,
	onValueChange,
	onSearch,
	renderOption,
	renderValue,
	testID,
	accessibilityLabel,
	ref,
	...props
}: SelectProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedValue, setSelectedValue] = useState(value || defaultValue);
	const selectRef = useRef<HTMLDivElement>(null);

	// Find selected option
	const selectedOption =
		options.find((opt) => opt.value === selectedValue) || null;

	// Filter options based on search
	const filteredOptions =
		searchable && searchQuery
			? options.filter(
					(opt) =>
						opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
						opt.description?.toLowerCase().includes(searchQuery.toLowerCase()),
				)
			: options;

	// Handle value change
	const handleValueChange = (newValue: string | number | null) => {
		setSelectedValue(newValue ?? undefined);
		if (onValueChange) {
			onValueChange(newValue);
		}
		setIsOpen(false);
		setSearchQuery("");
	};

	// Handle search
	const handleSearch = (query: string) => {
		setSearchQuery(query);
		if (onSearch) {
			onSearch(query);
		}
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				selectRef.current &&
				!selectRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setSearchQuery("");
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div
			className={cn("relative w-full", className)}
			data-testid={testID}
			ref={ref || selectRef}
			{...props}
		>
			{/* Select Trigger */}
			<button
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				aria-label={accessibilityLabel}
				className={cn(
					"flex h-9 w-full items-center justify-between rounded-md border border-input",
					"bg-background px-3 py-2 text-sm ring-offset-background",
					"placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring",
					"disabled:cursor-not-allowed disabled:opacity-50",
					isOpen && "ring-1 ring-ring",
				)}
				disabled={disabled || loading}
				onClick={() => setIsOpen(!isOpen)}
				type="button"
			>
				<span
					className={cn(
						"block truncate",
						!selectedOption && "text-muted-foreground",
					)}
				>
					{loading ? (
						<span className="flex items-center gap-2">
							<div className="h-4 w-4 animate-spin rounded-full border-current border-b-2" />
							Loading...
						</span>
					) : selectedOption ? (
						renderValue ? (
							renderValue(selectedOption)
						) : (
							selectedOption.label
						)
					) : (
						placeholder
					)}
				</span>
				<ChevronDownIcon
					className={cn(
						"h-4 w-4 opacity-50 transition-transform",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div
					className={cn(
						"absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md",
						"fade-in-0 zoom-in-95 animate-in",
					)}
				>
					{/* Search Input */}
					{searchable && (
						<div className="border-b p-2">
							<input
								autoFocus
								className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								onChange={(e) => handleSearch(e.target.value)}
								placeholder="Search options..."
								type="text"
								value={searchQuery}
							/>
						</div>
					)}

					{/* Options List */}
					<div className="max-h-60 overflow-auto p-1">
						{clearable && selectedValue && (
							<button
								className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
								onClick={() => handleValueChange(null)}
								type="button"
							>
								Clear selection
							</button>
						)}

						{filteredOptions.length === 0 ? (
							<div className="px-2 py-1.5 text-muted-foreground text-sm">
								No options found
							</div>
						) : (
							filteredOptions.map((option) => (
								<button
									className={cn(
										"w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
										"flex items-center justify-between",
										option.disabled && "cursor-not-allowed opacity-50",
										selectedValue === option.value &&
											"bg-accent text-accent-foreground",
									)}
									disabled={option.disabled}
									key={option.value}
									onClick={() =>
										!option.disabled && handleValueChange(option.value)
									}
									type="button"
								>
									<div className="flex items-center gap-2">
										{option.icon && option.icon}
										<div>
											<div>
												{renderOption ? renderOption(option) : option.label}
											</div>
											{option.description && (
												<div className="text-muted-foreground text-xs">
													{option.description}
												</div>
											)}
										</div>
									</div>
									{selectedValue === option.value && (
										<CheckIcon className="h-4 w-4" />
									)}
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
};

/**
 * React Native select implementation (placeholder)
 * @deprecated Not used in PWA build - only for React Native
 */
// @ts-expect-error - Placeholder for React Native, not used in PWA build
const _NativeSelect = ({
	options = [],
	value,
	defaultValue,
	placeholder = "Select an option...",
	disabled = false,
	onValueChange,
	testID,
	accessibilityLabel,
	style,
	ref,
	...props
}: SelectProps & { ref?: React.RefObject<any | null> }) => {
	// TODO: Implement React Native select using Picker or custom modal
	// This is a placeholder for React Native implementation

	const [selectedValue, setSelectedValue] = useState(value || defaultValue);
	// const selectedOption = options.find(opt => opt.value === selectedValue) || null;

	const handleValueChange = (newValue: string | number | null) => {
		setSelectedValue(newValue ?? undefined);
		if (onValueChange) {
			onValueChange(newValue);
		}
	};

	return (
		<div
			aria-label={accessibilityLabel}
			data-testid={testID}
			ref={ref}
			style={{
				borderWidth: 1,
				borderColor: "#C7C7CC",
				borderRadius: 6,
				padding: 12,
				backgroundColor: "white",
				minHeight: 36,
				justifyContent: "center",
				opacity: disabled ? 0.5 : 1,
				...style,
			}}
			{...props}
		>
			<select
				disabled={disabled}
				onChange={(e) => handleValueChange(e.target.value || null)}
				style={{
					width: "100%",
					border: "none",
					outline: "none",
					backgroundColor: "transparent",
					fontSize: 14,
				}}
				value={selectedValue || ""}
			>
				{placeholder && (
					<option disabled value="">
						{placeholder}
					</option>
				)}
				{options.map((option) => (
					<option
						disabled={option.disabled}
						key={option.value}
						value={option.value}
					>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
};

/**
 * Universal Select component
 *
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app/shared/components/ui/universal/Select.native.tsx
 */
export const Select = WebSelect as typeof WebSelect & { displayName: string };

Select.displayName = "Select";

/**
 * Select utilities
 */
export const SelectUtils = {
	/**
	 * Create option from simple values
	 */
	createOptions: (values: (string | number)[]): SelectOption[] =>
		values.map((value) => ({
			label: String(value),
			value,
		})),

	/**
	 * Find option by value
	 */
	findOption: (
		options: SelectOption[],
		value: string | number,
	): SelectOption | null => options.find((opt) => opt.value === value) || null,

	/**
	 * Filter options by search query
	 */
	filterOptions: (options: SelectOption[], query: string): SelectOption[] => {
		const lowerQuery = query.toLowerCase();
		return options.filter(
			(opt) =>
				opt.label.toLowerCase().includes(lowerQuery) ||
				opt.description?.toLowerCase().includes(lowerQuery),
		);
	},

	/**
	 * Validate select props
	 */
	validateProps: (props: SelectProps) => {
		const errors: string[] = [];

		if (!Array.isArray(props.options)) {
			errors.push("Options must be an array");
		}

		if (props.value !== undefined && props.options.length > 0) {
			const hasValidValue = props.options.some(
				(opt) => opt.value === props.value,
			);
			if (!hasValidValue) {
				errors.push(`Value "${props.value}" not found in options`);
			}
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},
};

export default Select;
