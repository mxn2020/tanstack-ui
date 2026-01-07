// packages/ui/src/react/components/Breadcrumb.tsx

import { Fragment } from 'react'
import type { FC, ReactNode, ComponentType } from 'react'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: ComponentType<{ className?: string }>
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
  homeHref?: string
  renderLink?: (item: BreadcrumbItem, content: ReactNode) => ReactNode
}

export const Breadcrumb: FC<BreadcrumbProps> = ({
  items,
  className = '',
  showHome = true,
  homeHref = '/',
  renderLink,
}) => {
  return (
    <nav aria-label='Breadcrumb' className={`flex items-center space-x-2 text-sm ${className}`}>
      {showHome && (
        <>
          {renderLink ? (
            renderLink(
              { label: 'Home', href: homeHref },
              <span className='flex items-center text-muted-foreground hover:text-foreground transition-colors'>
                <Home className='h-4 w-4' />
              </span>
            )
          ) : (
            <a
              href={homeHref}
              className='flex items-center text-muted-foreground hover:text-foreground transition-colors'
              aria-label='Home'
            >
              <Home className='h-4 w-4' />
            </a>
          )}
          {items.length > 0 && <ChevronRight className='h-4 w-4 text-muted-foreground flex-shrink-0' />}
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const IconComponent = item.icon

        return (
          <Fragment key={index}>
            {item.href && !isLast ? (
              renderLink ? (
                renderLink(
                  item,
                  <span className='flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors'>
                    {IconComponent && <IconComponent className='h-4 w-4' />}
                    <span className='font-medium'>{item.label}</span>
                  </span>
                )
              ) : (
                <a href={item.href} className='flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors'>
                  {IconComponent && <IconComponent className='h-4 w-4' />}
                  <span className='font-medium'>{item.label}</span>
                </a>
              )
            ) : (
              <div
                className={`flex items-center space-x-1 ${isLast ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
                {...(isLast && { 'aria-current': 'page' })}
              >
                {IconComponent && <IconComponent className='h-4 w-4' />}
                <span>{item.label}</span>
              </div>
            )}

            {!isLast && <ChevronRight className='h-4 w-4 text-muted-foreground flex-shrink-0' />}
          </Fragment>
        )
      })}
    </nav>
  )
}

export const useProjectBreadcrumbs = (
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
