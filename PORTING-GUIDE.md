# React to Solid Component Porting Guide

This guide explains how to port React components to Solid.

## Key Differences

### 1. No Hooks - Use Signals

**React:**
```tsx
const [count, setCount] = useState(0)
const [name, setName] = useState('')
```

**Solid:**
```tsx
const [count, setCount] = createSignal(0)
const [name, setName] = createSignal('')
// Access: count() - function call
// Set: setCount(5) - same as React
```

### 2. No forwardRef - Direct Refs

**React:**
```tsx
export const Button = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  return <button ref={ref} {...props} />
})
```

**Solid:**
```tsx
export const Button: Component<Props> = (props) => {
  return <button ref={props.ref} {...props} />
}
```

### 3. Use splitProps Instead of Destructuring

**React:**
```tsx
const Button = ({ variant, size, className, children, ...rest }) => {
  return <button className={cn(variant, size, className)} {...rest}>{children}</button>
}
```

**Solid:**
```tsx
const Button: Component<Props> = (props) => {
  const [local, others] = splitProps(props, ['variant', 'size', 'class', 'children'])
  return <button class={cn(local.variant, local.size, local.class)} {...others}>{local.children}</button>
}
```

### 4. Control Flow Components

**React:**
```tsx
{loading ? <Spinner /> : children}
{items.map(item => <Item key={item.id} {...item} />)}
```

**Solid:**
```tsx
<Show when={loading} fallback={children}>
  <Spinner />
</Show>
<For each={items}>
  {(item) => <Item {...item} />}
</For>
```

### 5. className → class

**React:**
```tsx
<button className="btn primary">Click</button>
```

**Solid:**
```tsx
<button class="btn primary">Click</button>
```

### 6. Event Handlers - No Synthetic Events

**React:**
```tsx
onClick={(e: React.MouseEvent) => { /* ... */ }}
```

**Solid:**
```tsx
onClick={(e: MouseEvent) => { /* ... */ }}
```

### 7. Component Types

**React:**
```tsx
import type { FC, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

const Component: FC<Props> = ({ children }) => {
  return <div>{children}</div>
}
```

**Solid:**
```tsx
import type { Component, ParentComponent, JSX } from 'solid-js'

interface Props {
  children?: JSX.Element
}

const Component: ParentComponent<Props> = (props) => {
  return <div>{props.children}</div>
}
```

## Porting Checklist

When porting a component:

- [ ] Replace `import React` with `import { Component, splitProps, Show, For } from 'solid-js'`
- [ ] Change `className` to `class`
- [ ] Remove `forwardRef` wrapper
- [ ] Replace `useState` with `createSignal`
- [ ] Replace `useEffect` with `createEffect`
- [ ] Replace `useMemo` with `createMemo`
- [ ] Replace `useCallback` - not needed in Solid (functions don't re-create)
- [ ] Use `splitProps()` for prop handling
- [ ] Replace `{condition && <Component />}` with `<Show when={condition}><Component /></Show>`
- [ ] Replace `.map()` with `<For each={array}>{(item) => <Component />}</For>`
- [ ] Update types: `ReactNode` → `JSX.Element`, `FC` → `Component`, etc.
- [ ] Test the component in isolation

## Example: Complete Port

### React Button
```tsx
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn('btn', variant, className)}
        disabled={loading}
        {...props}
      >
        {loading ? <Spinner /> : children}
      </button>
    )
  }
)
```

### Solid Button
```tsx
import { Show, splitProps, type Component, type JSX } from 'solid-js'
import { cn } from '../lib/utils'

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, ['variant', 'loading', 'class', 'children'])

  return (
    <button
      class={cn('btn', local.variant || 'primary', local.class)}
      disabled={local.loading}
      {...others}
    >
      <Show when={local.loading} fallback={local.children}>
        <Spinner />
      </Show>
    </button>
  )
}
```

## Components Already Ported

✅ Button
✅ Input
✅ Label
✅ Checkbox
✅ Card (+ CardHeader, CardTitle, CardDescription, CardContent, CardFooter)

## Components To Port (Priority Order)

### High Priority
- [ ] Textarea
- [ ] Switch
- [ ] RadioGroup
- [ ] Loading
- [ ] Skeleton
- [ ] Badge
- [ ] Separator

### Medium Priority
- [ ] Dialog
- [ ] Modal
- [ ] Tabs
- [ ] Select
- [ ] Table
- [ ] List
- [ ] Tooltip

### Low Priority
- [ ] DatePicker
- [ ] Calendar
- [ ] Avatar
- [ ] Popover
- [ ] DropdownMenu
- [ ] All remaining components

## Resources

- [Solid Docs](https://www.solidjs.com/docs/latest)
- [Solid Tutorial](https://www.solidjs.com/tutorial/introduction_basics)
- [Reactivity in Solid](https://www.solidjs.com/guides/reactivity)
