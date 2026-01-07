// packages/ui/src/solid/components/ViewSwitcher.tsx

import { Component, For, splitProps } from 'solid-js'
import { cn } from '../lib/utils'

export type ViewMode = 'grid' | 'table' | 'list'

interface ViewSwitcherProps {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  availableViews?: ViewMode[]
  class?: string
}

const viewIcons = {
  grid: (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),
  table: (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={2}
        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  ),
  list: (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
}

const viewTitles = {
  grid: 'Grid view',
  table: 'Table view',
  list: 'List view',
}

export const ViewSwitcher: Component<ViewSwitcherProps> = (props) => {
  const [local, _] = splitProps(props, ['view', 'onViewChange', 'availableViews', 'class'])
  const availableViews = () => local.availableViews ?? ['grid', 'table', 'list']

  return (
    <div class={cn('flex items-center gap-1 border rounded-lg p-1', local.class)}>
      <For each={availableViews()}>
        {(viewMode) => (
          <button
            onClick={() => local.onViewChange(viewMode)}
            class={cn(
              'p-2 rounded transition-colors cursor-pointer',
              local.view === viewMode
                ? 'bg-foreground text-background dark:bg-surface text-foreground'
                : 'hover:bg-surface'
            )}
            title={viewTitles[viewMode]}
          >
            {viewIcons[viewMode]}
          </button>
        )}
      </For>
    </div>
  )
}
