// packages/ui/src/components/Card.stories.tsx

import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card'
import { Button } from './Button'

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    hover: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className='w-[350px]'>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card.</p>
      </CardContent>
      <CardFooter>
        <Button variant='primary'>Action</Button>
      </CardFooter>
    </Card>
  ),
}

export const Simple: Story = {
  args: {
    padding: 'md',
    children: 'Simple card with padding',
  },
}

export const WithHover: Story = {
  args: {
    padding: 'md',
    hover: true,
    children: 'Hover over me!',
  },
}

export const Clickable: Story = {
  render: () => (
    <Card padding='md' onClick={() => alert('Card clicked!')}>
      <p>Click this card to trigger an action</p>
    </Card>
  ),
}

export const NoPadding: Story = {
  render: () => (
    <Card padding='none' className='w-[350px]'>
      <div className='h-48 bg-gradient-to-br from-blue-500 to-purple-600' />
      <CardHeader>
        <CardTitle>Image Card</CardTitle>
        <CardDescription>Card with no default padding</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content goes here</p>
      </CardContent>
    </Card>
  ),
}

export const LargeShadow: Story = {
  args: {
    padding: 'lg',
    shadow: 'lg',
    children: 'Card with large shadow',
  },
}

export const Grid: Story = {
  render: () => (
    <div className='grid grid-cols-3 gap-4'>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} padding='md' hover>
          <CardHeader>
            <CardTitle>Card {i}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content {i}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
}
