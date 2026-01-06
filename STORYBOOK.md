# Storybook Setup

This UI package includes Storybook for component development and documentation.

## Running Storybook

```bash
# From the packages/ui directory
pnpm storybook

# Or from the root of the monorepo
pnpm --filter @repo/ui storybook
```

Storybook will start on `http://localhost:6006`

## Building Storybook

```bash
# Build static Storybook
pnpm build-storybook

# The output will be in storybook-static/
```

## Writing Stories

Stories are located alongside components in `src/components/` with the `.stories.tsx` extension.

### Example Story

```tsx
// src/components/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { MyComponent } from './MyComponent'

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
}
```

## Existing Stories

- ✅ Button.stories.tsx - All button variants, sizes, states
- ✅ Card.stories.tsx - Card layouts and compositions
- ✅ Input.stories.tsx - Form input variations

## Configuration

### Files

- `.storybook/main.ts` - Storybook configuration
- `.storybook/preview.ts` - Global preview settings
- `.storybook/tailwind.css` - Tailwind CSS with theme variables
- `tailwind.config.ts` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

### Addons

- `@storybook/addon-links` - Link between stories
- `@storybook/addon-essentials` - Essential addons bundle (controls, actions, viewport, etc.)
- `@storybook/addon-interactions` - Test user interactions

## Tips

1. **Use autodocs**: Add `tags: ['autodocs']` to generate automatic documentation
2. **Layout options**: Use `parameters.layout` to control story positioning:
   - `'centered'` - Center the component
   - `'fullscreen'` - Full viewport
   - `'padded'` - Default with padding
3. **Controls**: ArgTypes provide interactive controls for component props
4. **Actions**: Use `@storybook/addon-interactions` to test user interactions

## Todo: Additional Stories

Components that still need stories:

### High Priority
- Alert.tsx
- AlertDialog.tsx
- Badge.tsx
- Checkbox.tsx
- Dialog.tsx
- DropdownMenu.tsx
- Select.tsx
- Switch.tsx
- Tabs.tsx
- Textarea.tsx

### Medium Priority
- Avatar.tsx
- Breadcrumb.tsx
- Calendar.tsx
- DatePicker.tsx
- Label.tsx
- Loading.tsx
- Modal.tsx
- Popover.tsx
- Progress.tsx
- RadioGroup.tsx
- Skeleton.tsx
- Slider.tsx
- Table.tsx
- Toggle.tsx
- ToggleGroup.tsx
- Tooltip.tsx

### Low Priority (Complex)
- Collapsible.tsx
- DateTimePicker.tsx
- List.tsx
- Resizable.tsx
- ScrollArea.tsx
- Section.tsx
- ViewSwitcher.tsx

### Utility Components
- CalendarInput.tsx
- Chip.tsx
- CostDisplay.tsx
- EmptyState.tsx
- LoadingSpinner.tsx
- Separator.tsx

## Resources

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [Writing Stories](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Storybook Addons](https://storybook.js.org/docs/react/configure/storybook-addons)
