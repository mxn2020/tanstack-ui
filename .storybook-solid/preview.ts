// packages/ui/.storybook-solid/preview.ts

import type { Preview } from 'storybook-solidjs'
import './tailwind.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
