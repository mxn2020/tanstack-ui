// packages/ui/src/solid/components/EmptyState.tsx

import { Component, JSX, Show, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import {
  Inbox,
  FileText,
  Users,
  FolderOpen,
  Search,
  Filter,
  ListTodo,
  CalendarDays,
  MessageSquare,
  Bell,
  AlertCircle,
  CheckCircle2,
  LucideIcon,
} from 'lucide-solid'
import { Button } from './Button'
import { Card, CardContent } from './Card'

export type EmptyStateVariant =
  | 'default'
  | 'search'
  | 'filter'
  | 'projects'
  | 'tasks'
  | 'users'
  | 'files'
  | 'messages'
  | 'notifications'
  | 'calendar'
  | 'success'
  | 'error'

export interface EmptyStateProps {
  /**
   * Variant determines the default icon and styling
   */
  variant?: EmptyStateVariant

  /**
   * Custom icon to override variant default
   */
  icon?: Component<{ class?: string }>

  /**
   * Main title text
   */
  title?: string

  /**
   * Description/subtitle text
   */
  description?: string

  /**
   * Primary action button
   */
  action?: {
    label: string
    onClick: () => void
    icon?: Component<{ class?: string }>
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  }

  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: Component<{ class?: string }>
  }

  /**
   * Custom content to render below description
   */
  children?: JSX.Element

  /**
   * Compact mode (smaller, less padding)
   */
  compact?: boolean

  /**
   * Show border around card
   */
  bordered?: boolean

  /**
   * Custom illustration/image
   */
  illustration?: JSX.Element

  /**
   * Show decorative elements
   */
  showDecoration?: boolean
}

/**
 * Empty State Component
 *
 * Displays when there's no content to show with helpful guidance.
 * Supports various contexts (search, filters, projects, etc.)
 *
 * @example
 * ```tsx
 * <EmptyState
 *   variant='projects'
 *   title='No projects yet'
 *   description='Create your first project to get started'
 *   action={{
 *     label: 'Create Project',
 *     onClick: () => navigate('/projects/new'),
 *     icon: Plus
 *   }}
 * />
 * ```
 */
const defaultCopy: Record<EmptyStateVariant, { title: string; description: string }> = {
  default: {
    title: 'Nothing to show yet',
    description: 'Add some content or adjust your filters to see results.',
  },
  search: {
    title: 'No results found',
    description: 'Try adjusting your search or using different keywords.',
  },
  filter: {
    title: 'No matches for these filters',
    description: 'Relax your filters to broaden the results.',
  },
  projects: {
    title: 'No projects yet',
    description: 'Create your first project to get started.',
  },
  tasks: {
    title: 'No tasks yet',
    description: 'Add a task to begin tracking work.',
  },
  users: {
    title: 'No users found',
    description: 'Invite teammates or adjust your filters.',
  },
  files: {
    title: 'No files here',
    description: 'Upload a file to see it listed.',
  },
  messages: {
    title: 'No messages yet',
    description: 'Start a conversation to see it show up here.',
  },
  notifications: {
    title: 'All caught up',
    description: 'We will let you know when there is something new.',
  },
  calendar: {
    title: 'No events scheduled',
    description: 'Add an event to fill your calendar.',
  },
  success: {
    title: 'Everything looks good',
    description: 'There is nothing left to do right now.',
  },
  error: {
    title: 'Nothing to display',
    description: 'We could not find any content to show here.',
  },
}

export const EmptyState: Component<EmptyStateProps> = (props) => {
  const merged = {
    variant: 'default' as EmptyStateVariant,
    compact: false,
    bordered: true,
    showDecoration: true,
    ...props,
  }

  // Get default icon based on variant
  const getDefaultIcon = (): Component<{ class?: string }> => {
    const iconMap: Record<EmptyStateVariant, Component<{ class?: string }>> = {
      default: Inbox,
      search: Search,
      filter: Filter,
      projects: FolderOpen,
      tasks: ListTodo,
      users: Users,
      files: FileText,
      messages: MessageSquare,
      notifications: Bell,
      calendar: CalendarDays,
      success: CheckCircle2,
      error: AlertCircle,
    }
    return iconMap[merged.variant]
  }

  // Get default colors based on variant
  const getColors = () => {
    const colorMap: Record<
      EmptyStateVariant,
      { bg: string; icon: string; accent: string }
    > = {
      default: {
        bg: 'bg-surface',
        icon: 'text-muted-foreground',
        accent: 'text-muted-foreground',
      },
      search: {
        bg: 'bg-blue-100',
        icon: 'text-blue-500',
        accent: 'text-blue-600',
      },
      filter: {
        bg: 'bg-purple-100',
        icon: 'text-purple-500',
        accent: 'text-purple-600',
      },
      projects: {
        bg: 'bg-indigo-100',
        icon: 'text-indigo-500',
        accent: 'text-indigo-600',
      },
      tasks: {
        bg: 'bg-green-100',
        icon: 'text-green-500',
        accent: 'text-green-600',
      },
      users: {
        bg: 'bg-cyan-100',
        icon: 'text-cyan-500',
        accent: 'text-cyan-600',
      },
      files: {
        bg: 'bg-orange-100',
        icon: 'text-orange-500',
        accent: 'text-orange-600',
      },
      messages: {
        bg: 'bg-pink-100',
        icon: 'text-pink-500',
        accent: 'text-pink-600',
      },
      notifications: {
        bg: 'bg-yellow-100',
        icon: 'text-yellow-600',
        accent: 'text-yellow-700',
      },
      calendar: {
        bg: 'bg-teal-100',
        icon: 'text-teal-500',
        accent: 'text-teal-600',
      },
      success: {
        bg: 'bg-[color:var(--tone-success-surface)]',
        icon: 'text-success',
        accent: 'text-success',
      },
      error: {
        bg: 'bg-red-100',
        icon: 'text-red-500',
        accent: 'text-red-600',
      },
    }
    return colorMap[merged.variant]
  }

  const Icon = () => merged.icon || getDefaultIcon()
  const colors = getColors()

  // Get default title and description if not provided
  const defaultTitle = () => merged.title || defaultCopy[merged.variant].title
  const defaultDescription = () => merged.description || defaultCopy[merged.variant].description

  const containerClass = () =>
    merged.compact
      ? 'flex items-center justify-center p-4'
      : 'flex items-center justify-center min-h-[300px] p-6'

  const content = () => (
    <div class='text-center space-y-6 max-w-md mx-auto'>
      {/* Illustration or Icon */}
      <Show
        when={merged.illustration}
        fallback={
          <div class='flex justify-center relative'>
            {/* Main Icon */}
            <div
              class={`rounded-full ${colors.bg} p-4 relative z-10 ${
                merged.compact ? 'w-16 h-16' : 'w-20 h-20'
              } flex items-center justify-center`}
            >
              <Dynamic
                component={Icon()}
                class={`${colors.icon} ${merged.compact ? 'w-8 h-8' : 'w-10 h-10'}`}
              />
            </div>

            {/* Decorative Elements */}
            <Show when={merged.showDecoration && !merged.compact}>
              {/* Floating circles */}
              <div
                class={`absolute top-0 right-0 w-3 h-3 ${colors.bg} rounded-full opacity-60 animate-pulse`}
                style={{ 'animation-delay': '0.5s' }}
              />
              <div
                class={`absolute bottom-0 left-0 w-4 h-4 ${colors.bg} rounded-full opacity-40 animate-pulse`}
                style={{ 'animation-delay': '1s' }}
              />
              <div
                class={`absolute top-1/2 -left-4 w-2 h-2 ${colors.bg} rounded-full opacity-50 animate-pulse`}
                style={{ 'animation-delay': '1.5s' }}
              />
            </Show>
          </div>
        }
      >
        <div class='flex justify-center'>{merged.illustration}</div>
      </Show>

      {/* Title & Description */}
      <div class='space-y-2'>
        <h3
          class={`font-semibold text-foreground ${
            merged.compact ? 'text-lg' : 'text-xl'
          }`}
        >
          {defaultTitle()}
        </h3>
        <Show when={defaultDescription()}>
          <p class={`text-muted-foreground ${merged.compact ? 'text-sm' : 'text-base'}`}>
            {defaultDescription()}
          </p>
        </Show>
      </div>

      {/* Custom Children Content */}
      <Show when={merged.children}>
        <div class='text-sm text-muted-foreground'>{merged.children}</div>
      </Show>

      {/* Actions */}
      <Show when={merged.action || merged.secondaryAction}>
        <div class='flex flex-col sm:flex-row gap-3 justify-center items-center'>
          <Show when={merged.action}>
            {(action) => (
              <Button
                onClick={action().onClick}
                variant={action().variant || 'primary'}
                class='w-full sm:w-auto'
              >
                <Show when={action().icon}>
                  {(IconComp) => <Dynamic component={IconComp()} class='w-4 h-4 mr-2' />}
                </Show>
                {action().label}
              </Button>
            )}
          </Show>

          <Show when={merged.secondaryAction}>
            {(secondaryAction) => (
              <Button
                onClick={secondaryAction().onClick}
                variant='outline'
                class='w-full sm:w-auto'
              >
                <Show when={secondaryAction().icon}>
                  {(IconComp) => <Dynamic component={IconComp()} class='w-4 h-4 mr-2' />}
                </Show>
                {secondaryAction().label}
              </Button>
            )}
          </Show>
        </div>
      </Show>
    </div>
  )

  // Return with or without Card wrapper based on bordered prop
  return (
    <Show
      when={merged.bordered}
      fallback={<div class={containerClass()}>{content()}</div>}
    >
      <div class={containerClass()}>
        <Card class='w-full'>
          <CardContent class={merged.compact ? 'py-8' : 'py-12'}>
            {content()}
          </CardContent>
        </Card>
      </div>
    </Show>
  )
}

/**
 * Specialized Empty States for Common Use Cases
 */

export const NoSearchResults: Component<
  Omit<EmptyStateProps, 'variant' | 'icon'>
> = (props) => (
  <EmptyState
    {...props}
    variant='search'
    title={props.title || 'No results found'}
    description={
      props.description || "Try adjusting your search or filters to find what you're looking for"
    }
  />
)

export const NoFilterResults: Component<
  Omit<EmptyStateProps, 'variant' | 'icon'>
> = (props) => (
  <EmptyState
    {...props}
    variant='filter'
    title={props.title || 'No matches'}
    description={
      props.description || 'No items match your current filters. Try clearing some filters.'
    }
  />
)

export const NoProjects: Component<Omit<EmptyStateProps, 'variant' | 'icon'>> = (
  props
) => (
  <EmptyState
    {...props}
    variant='projects'
    title={props.title || 'No projects yet'}
    description={
      props.description || 'Create your first project to start organizing your work'
    }
  />
)

export const NoTasks: Component<Omit<EmptyStateProps, 'variant' | 'icon'>> = (
  props
) => (
  <EmptyState
    {...props}
    variant='tasks'
    title={props.title || 'No tasks yet'}
    description={
      props.description || 'Add your first task to get started on your project'
    }
  />
)

export const NoNotifications: Component<Omit<EmptyStateProps, 'variant' | 'icon'>> = (
  props
) => (
  <EmptyState
    {...props}
    variant='notifications'
    title={props.title || 'All caught up!'}
    description={
      props.description || 'You have no new notifications at the moment'
    }
  />
)
