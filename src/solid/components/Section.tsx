// packages/ui/src/solid/components/Section.tsx

import { type JSX, splitProps, mergeProps } from 'solid-js';
import { cn } from '../lib/utils';

// Root Section component
interface SectionProps {
  children: JSX.Element;
  class?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
  ref?: HTMLElement | ((el: HTMLElement) => void);
}

const spacingClasses = {
  none: '',
  sm: 'mb-4',
  md: 'mb-6',
  lg: 'mb-8',
  xl: 'mb-12'
};

export function Section(props: SectionProps) {
  const merged = mergeProps({ spacing: 'none' as const }, props);
  const [local, others] = splitProps(merged, ['children', 'class', 'spacing', 'ref']);

  return (
    <section
      ref={local.ref}
      class={cn(
        'w-full',
        spacingClasses[local.spacing],
        local.class
      )}
      {...others}
    >
      {local.children}
    </section>
  );
}

// SectionHeader component
interface SectionHeaderProps {
  children: JSX.Element;
  class?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

const headerSpacingClasses = {
  none: '',
  sm: 'mb-2',
  md: 'mb-4',
  lg: 'mb-6'
};

export function SectionHeader(props: SectionHeaderProps) {
  const merged = mergeProps({ spacing: 'md' as const }, props);
  const [local, others] = splitProps(merged, ['children', 'class', 'spacing', 'ref']);

  return (
    <div
      ref={local.ref}
      class={cn(
        'flex flex-col',
        headerSpacingClasses[local.spacing],
        local.class
      )}
      {...others}
    >
      {local.children}
    </div>
  );
}

// SectionTitle component
interface SectionTitleProps {
  children: JSX.Element;
  class?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  ref?: HTMLHeadingElement | ((el: HTMLHeadingElement) => void);
}

const titleSizeClasses = {
  sm: 'text-lg font-semibold',
  md: 'text-xl font-semibold',
  lg: 'text-2xl font-bold',
  xl: 'text-3xl font-bold'
};

export function SectionTitle(props: SectionTitleProps) {
  const merged = mergeProps({ size: 'md' as const, as: 'h2' as const }, props);
  const [local, others] = splitProps(merged, ['children', 'class', 'size', 'as', 'ref']);

  const Component = local.as;

  return (
    <Component
      ref={local.ref}
      class={cn(
        'text-foreground',
        titleSizeClasses[local.size],
        local.class
      )}
      {...others}
    >
      {local.children}
    </Component>
  );
}

// SectionDescription component
interface SectionDescriptionProps {
  children: JSX.Element;
  class?: string;
  size?: 'sm' | 'md' | 'lg';
  ref?: HTMLParagraphElement | ((el: HTMLParagraphElement) => void);
}

const descriptionSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
};

export function SectionDescription(props: SectionDescriptionProps) {
  const merged = mergeProps({ size: 'md' as const }, props);
  const [local, others] = splitProps(merged, ['children', 'class', 'size', 'ref']);

  return (
    <p
      ref={local.ref}
      class={cn(
        'text-muted-foreground mt-2',
        descriptionSizeClasses[local.size],
        local.class
      )}
      {...others}
    >
      {local.children}
    </p>
  );
}

// SectionContent component
interface SectionContentProps {
  children: JSX.Element;
  class?: string;
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

export function SectionContent(props: SectionContentProps) {
  const [local, others] = splitProps(props, ['children', 'class', 'ref']);

  return (
    <div
      ref={local.ref}
      class={cn('w-full', local.class)}
      {...others}
    >
      {local.children}
    </div>
  );
}

// CompoundSection - convenience component with header and content
interface CompoundSectionProps {
  children: JSX.Element;
  title?: string;
  description?: string;
  titleSize?: 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  class?: string;
  id?: string;
  ref?: HTMLElement | ((el: HTMLElement) => void);
}

export function CompoundSection(props: CompoundSectionProps) {
  const merged = mergeProps({ titleSize: 'md' as const, spacing: 'lg' as const }, props);
  const [local, others] = splitProps(merged, [
    'children',
    'title',
    'description',
    'titleSize',
    'spacing',
    'class',
    'ref'
  ]);

  return (
    <Section ref={local.ref} spacing={local.spacing} class={local.class} {...others}>
      {(local.title || local.description) && (
        <SectionHeader>
          {local.title && <SectionTitle size={local.titleSize}>{local.title}</SectionTitle>}
          {local.description && <SectionDescription>{local.description}</SectionDescription>}
        </SectionHeader>
      )}
      <SectionContent>{local.children}</SectionContent>
    </Section>
  );
}
