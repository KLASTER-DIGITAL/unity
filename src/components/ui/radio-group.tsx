"use client";

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use the Universal RadioGroup component from '@/shared/components/ui/universal/RadioGroup' instead.
 *
 * Migration guide:
 * - Old (compositional API):
 *   <RadioGroup value={value} onValueChange={onChange}>
 *     <div className="flex items-center space-x-2">
 *       <RadioGroupItem value="option1" id="r1" />
 *       <Label htmlFor="r1">Option 1</Label>
 *     </div>
 *   </RadioGroup>
 *
 * - New (props-based API):
 *   <RadioGroup
 *     value={value}
 *     onValueChange={onChange}
 *     options={[
 *       { value: 'option1', label: 'Option 1' },
 *       { value: 'option2', label: 'Option 2' }
 *     ]}
 *   />
 *
 * Benefits of Universal RadioGroup:
 * - Works on both web (Radix UI) and React Native (TouchableOpacity)
 * - Simpler API with options array
 * - Better performance with Platform Adapter
 * - Ready for React Native migration
 */

import React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";

import { cn } from "@/shared/components/ui/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
