// packages/ui/src/solid/components/Breadcrumb.tsx

import { Component, For, Show, JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { ChevronRight, House } from 'lucide-solid'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: Component<{ class?: string }>
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  class?: string
  showHome?: boolean
  homeHref?: string
  renderLink?: (item: BreadcrumbItem, content: JSX.Element) => JSX.Element
}

export const Breadcrumb: Component<BreadcrumbProps> = (props) => {
  const showHome = () => props.showHome ?? true
  const homeHref = () => props.homeHref ?? '/'

  return (
    <nav aria-label="Breadcrumb" class={`flex items-center space-x-2 text-sm ${props.class ?? ''}`}>
      <Show when={showHome()}>
        <Show
          when={props.renderLink}
          fallback={
            <a
              href={homeHref()}
              class="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <House class="h-4 w-4" />
            </a>
          }
        >
          {props.renderLink!(
            { label: 'Home', href: homeHref() },
            <span class="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <House class="h-4 w-4" />
            </span>
          )}
        </Show>
        <Show when={props.items.length > 0}>
          <ChevronRight class="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </Show>
      </Show>

      <For each={props.items}>
        {(item, index) => {
          const isLast = () => index() === props.items.length - 1
          const IconComponent = item.icon

          return (
            <>
              <Show
                when={item.href && !isLast()}
                fallback={
                  <div
                    class={`flex items-center space-x-1 ${isLast() ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
                    {...(isLast() && { 'aria-current': 'page' })}
                  >
                    <Show when={IconComponent}>
                      <Dynamic component={IconComponent!} class="h-4 w-4" />
                    </Show>
                    <span>{item.label}</span>
                  </div>
                }
              >
                <Show
                  when={props.renderLink}
                  fallback={
                    <a href={item.href} class="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                      <Show when={IconComponent}>
                        <Dynamic component={IconComponent!} class="h-4 w-4" />
                      </Show>
                      <span class="font-medium">{item.label}</span>
                    </a>
                  }
                >
                  {props.renderLink!(
                    item,
                    <span class="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                      <Show when={IconComponent}>
                        <Dynamic component={IconComponent!} class="h-4 w-4" />
                      </Show>
                      <span class="font-medium">{item.label}</span>
                    </span>
                  )}
                </Show>
              </Show>

              <Show when={!isLast()}>
                <ChevronRight class="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </Show>
            </>
          )
        }}
      </For>
    </nav>
  )
}

export const createProjectBreadcrumbs = (
  projectName?: string,
  projectId?: string,
  additionalItems?: BreadcrumbItem[]
): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [{ label: 'Projects', href: '/projects' }]

  if (projectName && projectId) {
    items.push({ label: projectName, href: `/projects/${projectId}` })
  }

  if (additionalItems) items.push(...additionalItems)

  return items
}
