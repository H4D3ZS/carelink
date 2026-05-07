"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Simple, accessible Select built on native <select>.
 * Keeps API surface compatible with our existing usage of Select/SelectItem,
 * while avoiding invalid DOM nesting that caused hydration warnings.
 */

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
};

const SelectItem = ({ value, children }: SelectItemProps) => (
  <option value={value}>{children}</option>
);
SelectItem.displayName = "SelectItem";

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  onValueChange?: (value: string) => void;
}

// Recursively find all SelectItem children
const findSelectItems = (children: React.ReactNode): React.ReactElement<SelectItemProps>[] => {
  const items: React.ReactElement<SelectItemProps>[] = [];
  
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    
    if (child.type === SelectItem || (child.type as any)?.displayName === "SelectItem") {
      items.push(child as React.ReactElement<SelectItemProps>);
    } else if (child.props?.children) {
      // Recursively search in child children
      items.push(...findSelectItems(child.props.children));
    }
  });
  
  return items;
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, onValueChange, children, defaultValue, value, ...props }, ref) => {
    // Recursively extract SelectItem nodes as <option>
    const options = findSelectItems(children);

    return (
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      >
        <option value="" disabled>Select your role</option>
        {options}
      </select>
    );
  }
);
Select.displayName = "Select";

// No-op wrappers for compatibility
const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ children }: { children?: React.ReactNode; placeholder?: string }) => (
  <>{children}</>
);
SelectValue.displayName = "SelectValue";

const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
SelectContent.displayName = "SelectContent";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
