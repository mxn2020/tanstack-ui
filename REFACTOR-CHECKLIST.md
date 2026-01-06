# UI Package Refactor Checklist

This document tracks components that need updates to maintain homogeneous coding patterns.

## Established Pattern Standards

**Reference Components** (use these as templates):
- `Button.tsx` - Perfect example of all patterns
- `Input.tsx` - Perfect form component example
- `Card.tsx` - Perfect compound component example
- `Dialog.tsx` - Perfect complex compound component
- `Badge.tsx` - Perfect simple component

### Required Patterns

1. **Import Organization**:
   - React imports first: `forwardRef, memo, useCallback`
   - Type imports: `type { ElementRef, ReactNode }`
   - `cn` from `../lib/utils`
   - Type imports from `../lib/types`

2. **Component Structure**:
   - Wrapped with `memo(forwardRef<ElementRef<'element'>, Props>(...))`
   - `useCallback` for event handlers
   - `displayName` set after component

3. **TypeScript**:
   - Use `ElementRef<'element'>` for ref typing
   - Props extend appropriate HTML attributes

4. **Exports**:
   - Named exports: `export const ComponentName`

---

## Files Needing Updates

### High Priority (Missing Multiple Patterns)

#### 1. LoadingSpinner.tsx
**Status**: ❌ Needs Complete Rewrite

**Missing**:
- ❌ No `memo` wrapper
- ❌ No `forwardRef`
- ❌ No `displayName`
- ❌ Uses `export function` instead of `export const`
- ❌ No TypeScript `ElementRef` pattern
- ❌ Inconsistent className handling

**Action**: Complete rewrite to match Button.tsx pattern

---

#### 2. Modal.tsx
**Status**: ❌ Major Updates Needed

**Missing** (all components):
- ❌ No `forwardRef` on any component
- ❌ No `memo` wrapper on any component
- ❌ No `displayName` on any component
- ❌ Uses `export function` instead of `export const`
- ❌ No TypeScript `ElementRef` pattern
- ❌ Missing ref forwarding

**Action**: Align with Dialog.tsx pattern (compound components)

---

#### 3. EmptyState.tsx
**Status**: ❌ Pattern Mismatch

**Missing**:
- ❌ No `forwardRef`
- ❌ No `memo` wrapper on main component
- ❌ No `displayName`
- ⚠️ Uses `FC` type instead of standard pattern
- ⚠️ Uses `export const EmptyState: FC<...>` pattern

**Action**: Convert to standard pattern with `memo(forwardRef<...>)`

---

### Medium Priority (Missing forwardRef)

#### 4. Separator.tsx
**Status**: ⚠️ Partial Compliance

**Missing**:
- ❌ No `forwardRef`
- ⚠️ Uses `memo(function Separator(...))` syntax

**Has**:
- ✅ Has `displayName` via function name

**Action**: Add `forwardRef` for consistency

---

#### 5. Progress.tsx
**Status**: ⚠️ Partial Compliance

**Missing**:
- ❌ No `forwardRef`
- ⚠️ Uses `memo(function Progress(...))` syntax

**Has**:
- ✅ Has displayName via function name

**Action**: Add `forwardRef` for ref access

---

#### 6. Slider.tsx
**Status**: ⚠️ Partial Compliance

**Missing**:
- ❌ No `memo` wrapper
- ❌ No `displayName`

**Has**:
- ✅ Has `forwardRef`

**Action**: Wrap with `memo` and add `displayName`

---

#### 7. Tabs.tsx
**Status**: ⚠️ Sub-components Need Updates

**Missing**:
- ❌ No `forwardRef` on TabsList, TabsTrigger, TabsContent
- ⚠️ Uses `memo(function Tabs(...))` syntax

**Has**:
- ✅ Has displayName via function names

**Action**: Add `forwardRef` to all sub-components

---

### Low Priority (Partial Compliance)

#### 8. Skeleton.tsx
**Status**: ⚠️ Helper Components Need Updates

**Missing**:
- ❌ Helper components (`SkeletonText`, `SkeletonAvatar`, etc.) lack `forwardRef`
- ⚠️ Some have `memo`, some don't

**Has**:
- ✅ Main `Skeleton` component is perfect
- ✅ Has `displayName` on main component

**Action**: Add `forwardRef` to all skeleton variant components

---

#### 9. Table.tsx
**Status**: ⚠️ DataTable Function Needs Updates

**Missing**:
- ❌ `DataTable` function lacks `memo`, `forwardRef`, `displayName`
- ⚠️ Uses regular function instead of const pattern

**Has**:
- ✅ Most components have proper patterns

**Action**: Convert `DataTable` to match established pattern

---

#### 10. Tooltip.tsx
**Status**: ⚠️ Mixed Pattern

**Missing**:
- ❌ `TooltipRoot` - No `forwardRef`
- ❌ `TooltipTrigger` - No `forwardRef`

**Has**:
- ✅ `LegacyTooltip` is perfect
- ✅ `TooltipContent` is perfect

**Action**: Add `forwardRef` to TooltipRoot and TooltipTrigger

---

## Well-Structured Components ✅

These components follow all patterns perfectly:

- ✅ Alert.tsx
- ✅ AlertDialog.tsx
- ✅ Avatar.tsx
- ✅ Badge.tsx
- ✅ Breadcrumb.tsx
- ✅ Button.tsx
- ✅ Calendar.tsx
- ✅ CalendarInput.tsx
- ✅ Card.tsx
- ✅ Checkbox.tsx
- ✅ Chip.tsx
- ✅ Collapsible.tsx
- ✅ CostDisplay.tsx
- ✅ DatePicker.tsx
- ✅ DateTimePicker.tsx
- ✅ Dialog.tsx
- ✅ DropdownMenu.tsx
- ✅ Input.tsx
- ✅ Label.tsx
- ✅ List.tsx
- ✅ Loading.tsx
- ✅ Popover.tsx
- ✅ RadioGroup.tsx
- ✅ Resizable.tsx
- ✅ ScrollArea.tsx
- ✅ Section.tsx
- ✅ Select.tsx
- ✅ Switch.tsx
- ✅ Textarea.tsx
- ✅ Toggle.tsx
- ✅ ToggleGroup.tsx
- ✅ ViewSwitcher.tsx

---

## Pattern Template

```tsx
// packages/ui/src/components/ComponentName.tsx

import { forwardRef, memo, useCallback } from 'react'
import type { HTMLAttributes, ElementRef, ReactNode } from 'react'
import { cn } from '../lib/utils'
import type { ComponentVariant, ComponentSize } from '../lib/types'

interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: ComponentVariant
  size?: ComponentSize
}

const variantClasses: Record<ComponentVariant, string> = {
  // ... variants
}

export const ComponentName = memo(
  forwardRef<ElementRef<'div'>, ComponentProps>(
    ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
      return (
        <div
          ref={ref}
          className={cn('base-classes', variantClasses[variant], className)}
          {...props}
        >
          {children}
        </div>
      )
    }
  )
)

ComponentName.displayName = 'ComponentName'
```

---

## Progress Tracker

- **Total Components**: 42
- **Perfect Compliance**: 32 (76%)
- **Need Updates**: 10 (24%)
  - High Priority: 3
  - Medium Priority: 4
  - Low Priority: 3
