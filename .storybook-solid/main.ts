// packages/ui/.storybook-solid/main.ts

import type { StorybookConfig } from 'storybook-solidjs-vite'

const config: StorybookConfig = {
  stories: ['../src/solid/**/*.mdx', '../src/solid/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
  ],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
}

export default config
