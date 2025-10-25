/**
 * Universal Select Component for UNITY-v2
 * 
 * Cross-platform select that works on both Web and React Native
 * Replaces @radix-ui/react-select
 * 
 * @author UNITY Team
 * @date 2025-01-18
 */

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Platform } from '../../../lib/platform';
import { cn } from '../utils';
import { ChevronDownIcon, CheckIcon } from 'lucide-react';
import {
  UniversalEventHandlers,
  FormFieldProps,
  SelectOption
} from './types';

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
const WebSelect = forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    options = [],
    value,
    defaultValue,
    placeholder = 'Select an option...',
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
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedValue, setSelectedValue] = useState(value || defaultValue);
    const selectRef = useRef<HTMLDivElement>(null);

    // Find selected option
    const selectedOption = options.find(opt => opt.value === selectedValue) || null;

    // Filter options based on search
    const filteredOptions = searchable && searchQuery
      ? options.filter(opt => 
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Handle value change
    const handleValueChange = (newValue: string | number | null) => {
      setSelectedValue(newValue ?? undefined);
      if (onValueChange) onValueChange(newValue);
      setIsOpen(false);
      setSearchQuery('');
    };

    // Handle search
    const handleSearch = (query: string) => {
      setSearchQuery(query);
      if (onSearch) onSearch(query);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div 
        ref={ref || selectRef}
        className={cn('relative w-full', className)}
        data-testid={testID}
        {...props}
      >
        {/* Select Trigger */}
        <button
          type="button"
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border border-input',
            'bg-background px-3 py-2 text-sm ring-offset-background',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isOpen && 'ring-1 ring-ring'
          )}
          disabled={disabled || loading}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={accessibilityLabel}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={cn(
            'block truncate',
            !selectedOption && 'text-muted-foreground'
          )}>
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                Loading...
              </span>
            ) : selectedOption ? (
              renderValue ? renderValue(selectedOption) : selectedOption.label
            ) : (
              placeholder
            )}
          </span>
          <ChevronDownIcon 
            className={cn(
              'h-4 w-4 opacity-50 transition-transform',
              isOpen && 'rotate-180'
            )} 
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className={cn(
            'absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md',
            'animate-in fade-in-0 zoom-in-95'
          )}>
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b">
                <input
                  type="text"
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-auto p-1">
              {clearable && selectedValue && (
                <button
                  type="button"
                  className="w-full px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground rounded-sm"
                  onClick={() => handleValueChange(null)}
                >
                  Clear selection
                </button>
              )}
              
              {filteredOptions.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      'w-full px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground rounded-sm',
                      'flex items-center justify-between',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      selectedValue === option.value && 'bg-accent text-accent-foreground'
                    )}
                    disabled={option.disabled}
                    onClick={() => !option.disabled && handleValueChange(option.value)}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon && option.icon}
                      <div>
                        <div>{renderOption ? renderOption(option) : option.label}</div>
                        {option.description && (
                          <div className="text-xs text-muted-foreground">
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
  }
);

/**
 * React Native select implementation (placeholder)
 */
const NativeSelect = forwardRef<any, SelectProps>(
  ({ 
    options = [],
    value,
    defaultValue,
    placeholder = 'Select an option...',
    disabled = false,
    onValueChange,
    testID,
    accessibilityLabel,
    style,
    ...props 
  }, ref) => {
    // TODO: Implement React Native select using Picker or custom modal
    // This is a placeholder for React Native implementation
    
    const [selectedValue, setSelectedValue] = useState(value || defaultValue);
    // const selectedOption = options.find(opt => opt.value === selectedValue) || null;

    const handleValueChange = (newValue: string | number | null) => {
      setSelectedValue(newValue ?? undefined);
      if (onValueChange) onValueChange(newValue);
    };

    return (
      <div
        ref={ref}
        style={{
          borderWidth: 1,
          borderColor: '#C7C7CC',
          borderRadius: 6,
          padding: 12,
          backgroundColor: 'white',
          minHeight: 36,
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
          ...style
        }}
        data-testid={testID}
        aria-label={accessibilityLabel}
        {...props}
      >
        <select
          value={selectedValue || ''}
          onChange={(e) => handleValueChange(e.target.value || null)}
          disabled={disabled}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: 14
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

/**
 * Universal Select component
 */
export const Select = Platform.select({
  web: WebSelect,
  native: NativeSelect,
  default: WebSelect
});

Select.displayName = 'Select';

/**
 * Select utilities
 */
export const SelectUtils = {
  /**
   * Create option from simple values
   */
  createOptions: (values: (string | number)[]): SelectOption[] => {
    return values.map(value => ({
      label: String(value),
      value: value
    }));
  },

  /**
   * Find option by value
   */
  findOption: (options: SelectOption[], value: string | number): SelectOption | null => {
    return options.find(opt => opt.value === value) || null;
  },

  /**
   * Filter options by search query
   */
  filterOptions: (options: SelectOption[], query: string): SelectOption[] => {
    const lowerQuery = query.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(lowerQuery) ||
      opt.description?.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Validate select props
   */
  validateProps: (props: SelectProps) => {
    const errors: string[] = [];
    
    if (!Array.isArray(props.options)) {
      errors.push('Options must be an array');
    }
    
    if (props.value !== undefined && props.options.length > 0) {
      const hasValidValue = props.options.some(opt => opt.value === props.value);
      if (!hasValidValue) {
        errors.push(`Value "${props.value}" not found in options`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default Select;
