// packages/ui/src/solid/components/Label.tsx

import { splitProps, type JSX, type Component, type ParentComponent } from 'solid-js'
import { cn } from '../lib/utils'

export interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: ParentComponent<LabelProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'className', 'children'])

  return (
    <label
      class={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        local.class || local.className
      )}
      {...others}
    >
      {local.children}
    </label>
  )
}
