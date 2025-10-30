/**
 * Universal Switch Component - Web Implementation
 *
 * Uses Radix UI Switch for web platform
 *
 * @module components/ui/universal/Switch.web
 */

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../utils";

// ============================================================================
// TYPES
// ============================================================================

export type SwitchProps = {
	/** Checked state */
	checked?: boolean;
	/** Callback when checked state changes */
	onCheckedChange?: (checked: boolean) => void;
	/** Default checked state (uncontrolled) */
	defaultChecked?: boolean;
	/** Disabled state */
	disabled?: boolean;
	/** Custom className */
	className?: string;
	/** Accessibility label */
	"aria-label"?: string;
};

// ============================================================================
// COMPONENTS
// ============================================================================

export function Switch({
	checked,
	onCheckedChange,
	defaultChecked,
	disabled,
	className,
	"aria-label": ariaLabel,
}: SwitchProps) {
	return (
		<SwitchPrimitive.Root
			aria-label={ariaLabel}
			checked={checked}
			className={cn(
				"peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			defaultChecked={defaultChecked}
			disabled={disabled}
			onCheckedChange={onCheckedChange}
			style={{
				backgroundColor: checked ? "#007aff" : "#e5e5ea",
			}}
		>
			<SwitchPrimitive.Thumb
				className={cn(
					"pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
				)}
				style={{
					backgroundColor: "#ffffff",
				}}
			/>
		</SwitchPrimitive.Root>
	);
}

// ============================================================================
// UTILITIES
// ============================================================================

export const SwitchUtils = {
	/**
	 * Validate Switch props
	 */
	validateProps: (props: SwitchProps) => {
		const errors: string[] = [];

		if (props.checked !== undefined && props.defaultChecked !== undefined) {
			errors.push("Switch cannot have both checked and defaultChecked");
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
	Switch,
	SwitchUtils,
};
