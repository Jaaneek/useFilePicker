import React from 'react';
import { Meta, Story } from '@storybook/react';
import { useFilePicker } from '../src';
import { Validator } from '../src/validators';
import { FileContent, ReadType, UseFilePickerConfig } from '../src/interfaces';
import { FileWithPath } from 'file-selector';

const renderDependingOnReaderType = (file: FileContent<string>, readAs: ReadType) => {
  switch (readAs) {
    case 'DataURL':
      return (
        <div style={{ margin: '8px' }}>
          success! <br />
          File name: {file.name}
          <br />
          Image:
          <br />
          <img alt={file.name} src={file.content} />
        </div>
      );
    default:
      return (
        <div style={{ margin: '8px' }}>
          success! <br />
          File name: {file.name}
          <br />
          content:
          <br />
          {file.content}
        </div>
      );
  }
};

const FilePickerComponent = (props: UseFilePickerConfig & { storyTitle: string }) => {
  const { openFilePicker, filesContent, errors, plainFiles, loading } = useFilePicker({ ...props });

  return (
    <>
      {props.storyTitle}
      <br />
      {loading && <h1>Loading...</h1>}
      {errors.length ? (
        <div>
          errors:
          <br />
          {errors.map((error, index) => (
            <div key={error.name}>
              <span>{index + 1}.</span>
              {Object.entries(error).map(([key, value]) => (
                <div key={key}>
                  {key}: {typeof value === 'string' ? value : Array.isArray(value) ? value.join(', ') : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}
      <br />
      <button onClick={openFilePicker}>Open File Picker</button>
      {filesContent?.map(file => (file ? renderDependingOnReaderType(file, props.readAs!) : null))}
      {plainFiles?.map(file => (
        <div style={{ margin: '8px' }}>
          File name: {file.name}
          <br />
          File size: {file.size} bytes
          <br />
          File type: {file.type}
          <br />
          Last modified: {new Date(file.lastModified).toISOString()}
        </div>
      ))}
    </>
  );
};

const meta: Meta = {
  title: 'use-file-picker',
  component: FilePickerComponent,
  argTypes: {
    multiple: {
      defaultValue: true,
      control: {
        type: 'boolean',
      },
      description: 'Allow user to pick multiple files at once',
    },
    accept: {
      defaultValue: '*',
      control: {
        type: 'text',
      },
      description: 'Set type of files that user can choose from the list',
    },
    readAs: {
      defaultValue: 'Text',
      control: {
        options: ['Text', 'BinaryString', 'ArrayBuffer', 'DataURL'],
        type: 'select',
      },
      description: 'Set a return type of filesContent',
    },
    readFilesContent: {
      defaultValue: true,
      control: {
        type: 'boolean',
      },
      description: 'Ignores files content and omits reading process if set to false',
    },
    onFilesRejected: {
      description: 'Callback that is invoked when selected files are rejected due to an error',
    },
    onFilesSuccessfulySelected: {
      description: 'Callback that is invoked when selected files are successfully selected',
    },
    onFilesSelected: {
      description:
        'Callback that is invoked when selected files are selected, regardless of whether they are to be rejected or not',
    },
    initializeWithCustomParameters: {
      description:
        'Callback that is invoked with the HTMLInputElement as an argument when the file input is initialized. This function can be used to customize the input element as needed, such as adding additional attributes or event listeners',
    },
    storyTitle: {
      name: '',
      control: {
        type: 'none',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<any> = args => <FilePickerComponent {...args} />;

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const DefaultPicker = Template.bind({});
DefaultPicker.args = {
  storyTitle: 'Picker with default props',
  multiple: true,
  accept: '*',
  readAs: 'Text',
  readFilesContent: true,
};

export const SingleFilePicker = Template.bind({}, { storyTitle: 'Allows to pick only one file', multiple: false });
export const PickCertainFileType = Template.bind({}, { storyTitle: 'Selects only .txt files', accept: '.txt' });
export const ReadContentAsImage = Template.bind(
  {},
  { storyTitle: 'Reads selected files as DataURLs so they can be displayed by a browser', readAs: 'DataURL' }
);
export const LimitAmountOfFiles = Template.bind(
  {},
  {
    storyTitle: 'Limit max and min amount of files. In this example picker allows to choose between 2 to 3 files.',
    limitFilesConfig: {
      max: 3,
      min: 2,
    },
  }
);
export const DontReadFileContent = Template.bind(
  {},
  {
    storyTitle: 'Selected files are not read, plainFiles array contains File objects for selected files',
    readFilesContent: false,
  }
);
(DontReadFileContent as any).story = {
  name: "Don't Read File Content",
};
export const MaximumFileSize = Template.bind(
  {},
  {
    storyTitle: 'File size can be restricted. Picker allows only files that are smaller than 1 megabyte',
    maxFileSize: 1,
  }
);
export const ImageSizeRestrictions = Template.bind(
  {},
  {
    storyTitle:
      'When selecting images (readAs must be set to "DataURL"), image dimensions can be restricted. In this example picker allows only files that are more than 500px wide and less than 600px high',
    imageSizeRestrictions: {
      minWidth: 500,
      maxHeight: 600,
    },
    readAs: 'DataURL',
  }
);

class CustomValidator extends Validator {
  validateBeforeParsing(_config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    return new Promise((res, rej) => (plainFiles.length % 2 === 0 ? res() : rej({ oddNumberOfFiles: true })));
  }
  validateAfterParsing(_config: UseFilePickerConfig, file: FileWithPath, _reader: FileReader): Promise<void> {
    return new Promise((res, rej) =>
      file.lastModified < new Date().getTime() - 24 * 60 * 60 * 1000
        ? res()
        : rej({ fileRecentlyModified: true, lastModified: file.lastModified })
    );
  }
}
export const CustomValidators = Template.bind(
  {},
  {
    storyTitle:
      'If there is specific validation logic needed, custom validator can be passed to the hook. In this example, custom validator allows only to select files that have not been modified in the last 24 hours and the number of selected files must be even.',
    validators: [new CustomValidator()],
  }
);
export const customParameters = Template.bind(
  {},
  {
    storyTitle: 'Allows for adding custom parameters. In this example the button was initialized as disabled',
    initializeWithCustomParameters: (input: HTMLInputElement) => input.setAttribute('disabled', ''),
  }
);
export const onFilesSelected = Template.bind(
  {},
  {
    storyTitle:
      'Triggers when user selects files. The onFilesSelected callback runs with selected files, regardless of whether they are to be rejected or not',
    onFilesSelected: (data: any) => {
      alert(data.errors ? `found ${data.errors.length} errors` : `selected ${data.plainFiles.length} files`);
    },
  }
);
export const onFilesSuccessfulySelected = Template.bind(
  {},
  {
    storyTitle:
      'Triggers when user selects files without errors. The onFilesSuccessfulySelected callback runs with sucessfuly selected files',
    onFilesSuccessfulySelected: (data: any) => alert(`successfuly selected ${data.plainFiles.length} files`),
  }
);

export const onFilesRejected = Template.bind(
  {},
  {
    storyTitle:
      'Triggers when user selects files that do not meet file picker criteria. The onFilesRejected callback runs with errors of rejected files',
    onFilesRejected: (data: any) => alert(`rejected ${data.FileError.length} files`),
  }
);
