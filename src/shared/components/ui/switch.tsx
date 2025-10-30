"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import type React from "react";

import { cn } from "./utils";

function Switch({
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			className={cn(
				"peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			data-slot="switch"
			style={{
				backgroundColor: props.checked ? "#007aff" : "#e5e5ea",
			}}
			{...props}
		>
			<SwitchPrimitive.Thumb
				className={cn(
					"pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
				)}
				data-slot="switch-thumb"
				style={{
					backgroundColor: "#ffffff",
				}}
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
