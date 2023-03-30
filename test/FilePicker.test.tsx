import React from 'react';
import * as ReactDOM from 'react-dom';
import { DefaultPicker } from '../stories/FilePicker.stories';

describe('DefaultPicker', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<DefaultPicker />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
