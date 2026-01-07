// ComponentTemplate.tsx - Use this as a template for creating new components in SolidJS

import { Component, JSX, splitProps, mergeProps } from 'solid-js'
import { cn } from '../lib/utils'
import type { ComponentVariant, ComponentSize } from '../lib/types'

// 1. Define component-specific types
interface ComponentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
  variant?: ComponentVariant
  size?: ComponentSize
  // Add component-specific props here
  customProp?: string
  // For form components, include these:
  // error?: string
  // helpText?: string
  // disabled?: boolean
  // Ref prop
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

// 2. Define variant and size mappings
const variantClasses: Record<ComponentVariant, string> = {
  default: 'bg-surface text-foreground border-border',
  primary: 'bg-blue-100 text-blue-900 border-blue-200',
  secondary: 'bg-surface text-foreground border-border',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  destructive: 'bg-red-100 text-red-800 border-red-200'
}

const sizeClasses: Record<ComponentSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
  xl: 'px-6 py-4 text-xl',
  '2xl': 'px-8 py-6 text-2xl'
}

// 3. Create the component with proper typing
export const ComponentExample: Component<ComponentProps> = (props) => {
  // 4. Split props and set defaults using mergeProps
  const merged = mergeProps(
    { variant: 'default' as ComponentVariant, size: 'md' as ComponentSize },
    props
  )
  
  const [local, others] = splitProps(merged, [
    'children',
    'variant',
    'size',
    'customProp',
    'class',
    'ref',
    // For form components, include these:
    // 'error',
    // 'helpText',
    // 'disabled',
  ])

  // 5. Component logic here (using signals if needed)
  // const hasError = () => Boolean(local.error)

  // 6. Compute className using a function for reactivity
  const componentClassName = () => cn(
    // Base classes
    'inline-flex items-center justify-center rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
    // Variant classes
    variantClasses[local.variant],
    // Size classes
    sizeClasses[local.size],
    // Conditional classes
    // local.disabled && 'opacity-50 cursor-not-allowed',
    // hasError() && 'border-red-300 focus:ring-red-500',
    // Custom class override
    local.class
  )

  return (
    <div
      ref={local.ref}
      class={componentClassName()}
      // Add accessibility attributes
      // aria-invalid={hasError()}
      // aria-disabled={local.disabled}
      {...others}
    >
      {local.children}
    </div>
  )
}

// 7. Export patterns to follow:

// Single component export:
// export { ComponentExample }

// Multiple related components:
// export { ComponentExample, ComponentVariant, ComponentSize }

// With compound components:
// export { 
//   ComponentExample, 
//   ComponentTrigger, 
//   ComponentContent,
//   ComponentHeader,
//   ComponentBody,
//   ComponentFooter
// }

/*
CHECKLIST FOR NEW SOLIDJS COMPONENTS:

✅ Uses Component<Props> type
✅ Extends appropriate JSX HTML element props (JSX.HTMLAttributes<T>)
✅ Uses mergeProps for default values
✅ Uses splitProps to separate reactive from non-reactive props
✅ Follows consistent prop naming (variant, size, error, helpText, disabled)
✅ Uses cn() utility for className merging (not twMerge directly)
✅ Uses 'class' instead of 'className'
✅ Includes proper TypeScript types
✅ Has accessibility attributes where needed
✅ Follows consistent export pattern
✅ Has consistent variant/size systems
✅ Includes proper error handling for form components
✅ Includes ref prop with proper typing
✅ Spreads remaining props with {...others}
✅ Uses functions for reactive computed values

KEY SOLIDJS DIFFERENCES FROM REACT:

1. NO memo() or forwardRef() - Components are already optimized
2. NO displayName needed
3. Use splitProps() to separate props
4. Use mergeProps() for default values
5. Use createSignal() for state instead of useState()
6. Use createEffect() instead of useEffect()
7. Use createMemo() instead of useMemo()
8. Callbacks don't need useCallback - they're stable by default
9. Use 'class' prop instead of 'className'
10. Use JSX.Element instead of ReactNode
11. Computed values should be functions: () => value
12. Conditional rendering uses <Show> component
13. List rendering uses <For> component

REACTIVITY CONSIDERATIONS:

- Props are already reactive - don't destructure in component body
- Use splitProps to separate props you need to track
- Computed values must be functions: const x = () => props.value
- Event handlers are automatically stable
- Effects automatically track dependencies
- Use createMemo for expensive calculations
- Avoid inline object/function creation in JSX where possible

PERFORMANCE CONSIDERATIONS:

- Components don't re-render, only reactive parts update
- No need for memo() - fine-grained reactivity handles this
- Callbacks are stable by default - no useCallback needed
- Use createMemo() for expensive derived values
- Use untrack() to read values without tracking them
- Use batch() to batch multiple updates
- Effects only run when dependencies actually change

ACCESSIBILITY CONSIDERATIONS:

- Include proper ARIA attributes
- Support keyboard navigation where appropriate
- Provide screen reader friendly content
- Use semantic HTML elements
- Include proper focus management
- Support high contrast mode
- Provide proper error messaging

TESTING CONSIDERATIONS:

- Test with different prop combinations
- Test accessibility with screen readers
- Test keyboard navigation
- Test error states
- Test responsive behavior
- Test with different content lengths
- Test reactive updates work correctly
*/

