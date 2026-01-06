// packages/ui/src/components/Tabs.tsx

import { createContext, useContext, useState, useCallback, ReactNode, memo } from 'react';
import { cn } from '../lib/utils';

// Context for managing tab state
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs component');
  }
  return context;
};

// Root Tabs component
interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
}

export const Tabs = memo(function Tabs({ 
  value: controlledValue, 
  defaultValue = '', 
  onValueChange, 
  className, 
  children 
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  
  const handleValueChange = useCallback((newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  }, [isControlled, onValueChange]);

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});

// TabsList component - container for tab triggers
interface TabsListProps {
  className?: string;
  children: ReactNode;
}

export const TabsList = memo(function TabsList({ className, children }: TabsListProps) {
  return (
    <div 
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-surface p-1 text-muted-foreground',
        className
      )}
      role='tablist'
    >
      {children}
    </div>
  );
});

// TabsTrigger component - individual tab button
interface TabsTriggerProps {
  value: string;
  className?: string;
  disabled?: boolean;
  children: ReactNode;
}

export const TabsTrigger = memo(function TabsTrigger({ 
  value, 
  className, 
  disabled = false, 
  children 
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isSelected = selectedValue === value;

  const handleClick = useCallback(() => {
    if (!disabled) {
      onValueChange(value);
    }
  }, [disabled, onValueChange, value]);

  return (
    <button
      type='button'
      role='tab'
      aria-selected={isSelected}
      aria-controls={`tabpanel-${value}`}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
        isSelected
          ? 'bg-card text-popover-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-card/50 hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  );
});

// TabsContent component - content panel for each tab
interface TabsContentProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export const TabsContent = memo(function TabsContent({ value, className, children }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;

  if (!isSelected) {
    return null;
  }

  return (
    <div
      role='tabpanel'
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={cn(
        'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        className
      )}
      tabIndex={0}
    >
      {children}
    </div>
  );
});
