// packages/ui/src/solid/components/Checkbox.tsx

import { splitProps, Show, type JSX, type Component } from 'solid-js'
import { cn } from '../lib/utils'

export interface CheckboxProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean
  indeterminate?: boolean
}

export const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'className', 'checked', 'indeterminate'])

  return (
    <div class="relative inline-flex items-center">
      <input
        type="checkbox"
        checked={local.checked}
        class={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          local.class || local.className
        )}
        {...others}
      />
      <Show when={local.checked || local.indeterminate}>
        <svg
          class="absolute left-0 top-0 h-4 w-4 text-primary-foreground pointer-events-none"
          viewBox="0 0 16 16"
          fill="none"
        >
          <Show
            when={local.checked && !local.indeterminate}
            fallback={
              <path
                d="M3 8h10"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            }
          >
            <path
              d="M13 4L6 11L3 8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </Show>
        </svg>
      </Show>
    </div>
  )
}
