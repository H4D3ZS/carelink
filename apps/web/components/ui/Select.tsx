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

// No-op wrappers that render nothing - just for API compatibility
const SelectTrigger = ({ children }: { children: React.ReactNode }) => null;
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ children, placeholder }: { children?: React.ReactNode; placeholder?: string }) => null;
SelectValue.displayName = "SelectValue";

const SelectContent = ({ children }: { children: React.ReactNode }) => null;
SelectContent.displayName = "SelectContent";

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, onValueChange, children, defaultValue, value, placeholder, ...props }, ref) => {
    // Extract only SelectItem children from the component tree
    const extractItems = (node: React.ReactNode): React.ReactElement<SelectItemProps>[] => {
      const items: React.ReactElement<SelectItemProps>[] = [];
      
      React.Children.forEach(node, (child) => {
        if (!React.isValidElement(child)) return;
        
        const childType = child.type as any;
        const displayName = childType?.displayName || childType?.name;
        
        // Found a SelectItem
        if (displayName === "SelectItem" || childType === SelectItem) {
          items.push(child as React.ReactElement<SelectItemProps>);
          return;
        }
        
        // Search inside SelectContent only
        if (displayName === "SelectContent" || childType === SelectContent) {
          if (child.props?.children) {
            items.push(...extractItems(child.props.children));
          }
          return;
        }
        
        // For any other wrapper, check if it contains SelectContent
        if (child.props?.children) {
          items.push(...extractItems(child.props.children));
        }
      });
      
      return items;
    };

    const options = extractItems(children);
    const hasValue = value !== undefined && value !== "";

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm",
            "text-slate-900 placeholder:text-slate-400",
            "focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
            className
          )}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onValueChange?.(e.target.value)}
          {...props}
        >
          {placeholder && !hasValue && !defaultValue && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options}
        </select>
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
