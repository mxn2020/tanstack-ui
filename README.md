# @repo/ui

Shared UI component library for the TanStack Start + Convex + Better-Auth boilerplate.

## Structure

```
src/
├── components/        # React components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Label.tsx
│   └── index.ts
├── hooks/            # Custom React hooks
│   └── index.ts
├── lib/              # Utilities
│   └── utils.ts
└── index.ts          # Main entry point
```

## Installation

This package is part of the monorepo and uses workspace protocol:

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

## Usage

### In Your App

```tsx
import { Button, Input, Card } from '@repo/ui'

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Email" />
      <Button>Submit</Button>
    </Card>
  )
}
```

### Direct Component Import

```tsx
// Import specific components
import { Button } from '@repo/ui/components/Button'
import { Input } from '@repo/ui/components/Input'
```

## Adding New Components

1. **Create component file** with capital letter:
   ```
   src/components/Select.tsx
   ```

2. **Export from components/index.ts**:
   ```typescript
   export * from './Select'
   ```

3. **Component automatically available** via main package:
   ```typescript
   import { Select } from '@repo/ui'
   ```

## Component Conventions

### File Naming
- **Components**: PascalCase with `.tsx` extension
  - ✅ `Button.tsx`, `Input.tsx`, `Dialog.tsx`
  - ❌ `button.tsx`, `input.tsx`

- **Utilities**: camelCase with `.ts` extension
  - ✅ `utils.ts`, `formatters.ts`
  - ❌ `Utils.ts`, `Formatters.ts`

- **Hooks**: camelCase with `use-` prefix
  - ✅ `use-toast.ts`, `use-media-query.ts`
  - ❌ `useToast.ts`, `toast.ts`

### Component Structure

```tsx
import * as React from 'react'
import { cn } from '../lib/utils'

export interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // Your props
}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('base-classes', className)}
        {...props}
      />
    )
  }
)
Component.displayName = 'Component'

export { Component }
```

## Styling

This package uses:
- **Tailwind CSS** for styling
- **class-variance-authority** for variant management
- **clsx** + **tailwind-merge** for class composition

### The `cn()` Utility

```tsx
import { cn } from '@repo/ui'

// Merge classes with proper Tailwind precedence
<div className={cn('bg-red-500', 'bg-blue-500')} />
// Result: bg-blue-500 (last wins)

// Conditional classes
<div className={cn('base-class', isActive && 'active-class')} />

// With variants
<Button className={cn(buttonVariants({ variant, size }), 'custom-class')} />
```

## Variants with CVA

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'base classes',
  {
    variants: {
      variant: {
        default: 'default classes',
        destructive: 'destructive classes',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  // ...
}
```

## TypeScript

The package is fully typed with TypeScript. All components export their prop types:

```tsx
import type { ButtonProps } from '@repo/ui'

const myButtonProps: ButtonProps = {
  variant: 'default',
  size: 'lg',
  onClick: () => {},
}
```

## Development

```bash
# Type check
pnpm type-check

# Lint
pnpm lint
```

## Examples

### Button

```tsx
import { Button } from '@repo/ui'

<Button variant="default" size="lg">
  Click Me
</Button>

<Button variant="destructive">
  Delete
</Button>

<Button variant="outline" disabled>
  Disabled
</Button>
```

### Input

```tsx
import { Input } from '@repo/ui'

<Input
  type="email"
  placeholder="Email address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

## Next Steps

1. **Add your components** following the conventions above
2. **Export from components/index.ts**
3. **Use in your apps** via `import { Component } from '@repo/ui'`

The structure is ready - just add your components!
