// packages/ui/src/components/Input.stories.tsx

import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'
import { Mail, Search, Lock } from 'lucide-react'

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'john@example.com',
    type: 'email',
  },
}

export const WithDescription: Story = {
  args: {
    label: 'Username',
    description: 'This will be your public username',
    placeholder: 'johndoe',
  },
}

export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Invalid email address',
    defaultValue: 'invalid-email',
  },
}

export const WithHelpText: Story = {
  args: {
    label: 'Password',
    helpText: 'Must be at least 8 characters',
    type: 'password',
  },
}

export const WithIcon: Story = {
  args: {
    label: 'Email',
    icon: <Mail />,
    placeholder: 'john@example.com',
  },
}

export const WithEndIcon: Story = {
  args: {
    label: 'Search',
    endIcon: <Search />,
    placeholder: 'Search...',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled Field',
    defaultValue: 'Cannot edit this',
  },
}

export const Required: Story = {
  args: {
    label: 'Required Field',
    required: true,
    placeholder: 'This field is required',
  },
}

export const LoginForm: Story = {
  render: () => (
    <div className='w-80 space-y-4'>
      <Input
        label='Email'
        type='email'
        icon={<Mail />}
        placeholder='john@example.com'
        required
      />
      <Input
        label='Password'
        type='password'
        icon={<Lock />}
        placeholder='Enter your password'
        helpText='Must be at least 8 characters'
        required
      />
    </div>
  ),
}
