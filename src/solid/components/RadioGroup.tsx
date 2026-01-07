// packages/ui/src/solid/components/RadioGroup.tsx

import {
  createContext,
  useContext,
  createUniqueId,
  type Component,
  type JSX,
  type ParentProps
} from 'solid-js';
import { cn } from '../lib/utils';
import type { FormComponentProps } from '../lib/types';

// ============================================================================
// CONTEXT
// ============================================================================

interface RadioGroupContextValue {
  value: () => string | undefined;
  name: () => string;
  disabled: () => boolean;
  onChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue>();

const useRadioGroupContext = () => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }
  return context;
};

// ============================================================================
// RADIO GROUP
// ============================================================================

interface RadioGroupProps extends Omit<FormComponentProps, 'disabled'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  class?: string;
  orientation?: 'horizontal' | 'vertical';
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

export const RadioGroup: Component<ParentProps<RadioGroupProps>> = (props) => {
  const generatedId = createUniqueId();
  const groupName = () => props.name ?? generatedId;
  const hasError = () => Boolean(props.error);
  const disabled = () => props.disabled ?? false;
  const orientation = () => props.orientation ?? 'vertical';
  
  // Handle controlled/uncontrolled state
  const currentValue = () => props.value ?? props.defaultValue;

  const handleChange = (newValue: string) => {
    props.onValueChange?.(newValue);
  };

  const contextValue: RadioGroupContextValue = {
    value: currentValue,
    name: groupName,
    disabled,
    onChange: handleChange,
  };

  return (
    <div ref={props.ref}>
      <RadioGroupContext.Provider value={contextValue}>
        <div
          class={cn(
            'flex',
            orientation() === 'vertical' ? 'flex-col gap-2' : 'flex-row gap-4',
            props.class
          )}
          role="radiogroup"
          aria-invalid={hasError()}
          aria-describedby={
            props.error ? `${groupName()}-error` :
            props.helpText ? `${groupName()}-help` : undefined
          }
        >
          {props.children}
        </div>

        {props.error && (
          <p id={`${groupName()}-error`} class="mt-2 text-sm text-red-600">
            {props.error}
          </p>
        )}

        {props.helpText && !props.error && (
          <p id={`${groupName()}-help`} class="mt-2 text-sm text-muted-foreground">
            {props.helpText}
          </p>
        )}
      </RadioGroupContext.Provider>
    </div>
  );
};

// ============================================================================
// RADIO GROUP ITEM
// ============================================================================

interface RadioGroupItemProps {
  value: string;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  class?: string;
  id?: string;
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
}

const sizeClasses = {
  sm: {
    radio: 'w-3.5 h-3.5',
    dot: 'w-1.5 h-1.5',
    text: 'text-xs'
  },
  md: {
    radio: 'w-4 h-4',
    dot: 'w-2 h-2',
    text: 'text-sm'
  },
  lg: {
    radio: 'w-5 h-5',
    dot: 'w-2.5 h-2.5',
    text: 'text-base'
  }
};

export const RadioGroupItem: Component<RadioGroupItemProps> = (props) => {
  const context = useRadioGroupContext();
  const generatedId = createUniqueId();
  const radioId = () => props.id ?? generatedId;
  const size = () => props.size ?? 'md';

  const isDisabled = () => props.disabled ?? context.disabled();
  const isChecked = () => context.value() === props.value;
  const sizes = () => sizeClasses[size()];

  const handleChange = () => {
    if (!isDisabled()) {
      context.onChange(props.value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled()) {
      e.preventDefault();
      context.onChange(props.value);
    }
  };

  return (
    <div class={cn('flex items-start', props.class)}>
      <div class="flex items-center h-5">
        <div class="relative">
          <input
            ref={props.ref}
            id={radioId()}
            type="radio"
            name={context.name()}
            value={props.value}
            checked={isChecked()}
            disabled={isDisabled()}
            onChange={handleChange}
            class="sr-only"
          />
          <div
            class={cn(
              'border rounded-full transition-all cursor-pointer flex items-center justify-center',
              sizes().radio,
              isChecked()
                ? 'bg-blue-600 border-blue-600'
                : 'bg-card border-border hover:border-muted-foreground',
              'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
              isDisabled() && 'opacity-50 cursor-not-allowed'
            )}
            onClick={handleChange}
            role="radio"
            aria-checked={isChecked()}
            tabIndex={isDisabled() ? -1 : 0}
            onKeyDown={handleKeyDown}
          >
            {isChecked() && (
              <div
                class={cn(
                  'bg-card rounded-full transition-transform',
                  sizes().dot
                )}
              />
            )}
          </div>
        </div>
      </div>

      {(props.label || props.description) && (
        <div class={cn('ml-2', sizes().text)}>
          {props.label && (
            <label
              for={radioId()}
              class={cn(
                'block font-medium cursor-pointer text-foreground',
                isDisabled() && 'cursor-not-allowed opacity-50'
              )}
            >
              {props.label}
            </label>
          )}

          {props.description && (
            <p class={cn(
              'mt-0.5 text-muted-foreground',
              isDisabled() && 'opacity-50'
            )}>
              {props.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
