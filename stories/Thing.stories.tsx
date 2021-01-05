import React, { useEffect } from 'react';
import { Meta, Story } from '@storybook/react';
import { useFilePicker } from '../src';

const TemporaryComponent = () => {
  const [files, errors, reopen] = useFilePicker({ multiple: false });
  useEffect(() => {
    reopen();
  });
  if (files) return <div>success</div>;
  if (errors) return <div>error</div>;
  return <div>test</div>;
};

const meta: Meta = {
  title: 'Welcome',
  component: TemporaryComponent,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<any> = args => <div {...args} />;

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
