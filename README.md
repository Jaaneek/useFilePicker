# <center>Welcome to use-file-picker 👋</center>

## _Simple react hook to open browser file selector._

[![alt Version](https://img.shields.io/npm/v/use-file-picker?color=blue)](https://www.npmjs.com/package/use-file-picker) ![alt License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) [![alt Twitter: twitter.com/jaaneek/](https://img.shields.io/twitter/follow/jaaneek.svg?style=social)](https://twitter.com/twitter.com/jaaneek)

**🏠 [Homepage](https://github.com/Jaaneek/useFilePicker 'use-file-picker Github')**

## Documentation

- [Install](#install)
- [Usage](#usage)
  - [Simple txt file content reading](#simple-txt-file-content-reading)
  - [Reading and rendering Images](#reading-and-rendering-images)
  - [On change callbacks](#on-change-callbacks)
  - [Advanced usage](#advanced-usage)
  - [Callbacks](#callbacks)
  - [Keeping the previously selected files and removing them from selection on demand](#keeping-the-previously-selected-files-and-removing-them-from-selection-on-demand)
- [API](#api)
  - [Props](#props)
  - [Returns](#returns)
  - [Built-in validators](#built-in-validators)
  - [Custom validation](#custom-validation)
    - [Example validator](#example-validator)
- [Authors](#authors)
- [🤝 Contributing](#-contributing)
- [Show your support](#show-your-support)

## Install

`npm i use-file-picker`
or
`yarn add use-file-picker`

## Usage

### Simple txt file content reading

```jsx
import { useFilePicker } from 'use-file-picker';
import React from 'react';

export default function App() {
  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: '.txt',
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={() => openFilePicker()}>Select files</button>
      <br />
      {filesContent.map((file, index) => (
        <div>
          <h2>{file.name}</h2>
          <div key={index}>{file.content}</div>
          <br />
        </div>
      ))}
    </div>
  );
}
```

### Reading and rendering Images

```ts
import { useFilePicker } from 'use-file-picker';
import {
  FileAmountLimitValidator,
  FileTypeValidator,
  FileSizeValidator,
  ImageDimensionsValidator,
} from 'use-file-picker/validators';

export default function App() {
  const { openFilePicker, filesContent, loading, errors } = useFilePicker({
    readAs: 'DataURL',
    accept: 'image/*',
    multiple: true,
    validators: [
      new FileAmountLimitValidator({ max: 1 }),
      new FileTypeValidator(['jpg', 'png']),
      new FileSizeValidator({ maxFileSize: 50 * 1024 * 1024 /* 50 MB */ }),
      new ImageDimensionsValidator({
        maxHeight: 900, // in pixels
        maxWidth: 1600,
        minHeight: 600,
        minWidth: 768,
      }),
    ],
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (errors.length) {
    return <div>Error...</div>;
  }

  return (
    <div>
      <button onClick={() => openFilePicker()}>Select files </button>
      <br />
      {filesContent.map((file, index) => (
        <div key={index}>
          <h2>{file.name}</h2>
          <img alt={file.name} src={file.content}></img>
          <br />
        </div>
      ))}
    </div>
  );
}
```

### On change callbacks

```ts
import { useFilePicker } from 'use-file-picker';

export default function App() {
  const { openFilePicker, filesContent, loading, errors } = useFilePicker({
    readAs: 'DataURL',
    accept: 'image/*',
    multiple: true,
    onFilesSelected: ({ plainFiles, filesContent, errors }) => {
      // this callback is always called, even if there are errors
      console.log('onFilesSelected', plainFiles, filesContent, errors);
    },
    onFilesRejected: ({ errors }) => {
      // this callback is called when there were validation errors
      console.log('onFilesRejected', errors);
    },
    onFilesSuccessfullySelected: ({ plainFiles, filesContent }) => {
      // this callback is called when there were no validation errors
      console.log('onFilesSuccessfullySelected', plainFiles, filesContent);
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (errors.length) {
    return <div>Error...</div>;
  }

  return (
    <div>
      <button onClick={() => openFilePicker()}>Select files </button>
      <br />
      {filesContent.map((file, index) => (
        <div key={index}>
          <h2>{file.name}</h2>
          <img alt={file.name} src={file.content}></img>
          <br />
        </div>
      ))}
    </div>
  );
}
```

### Advanced usage

```ts
import { useFilePicker } from 'use-file-picker';
import React from 'react';

export default function App() {
  const { openFilePicker, filesContent, loading, errors, plainFiles, clear } = useFilePicker({
    multiple: true,
    readAs: 'DataURL', // availible formats: "Text" | "BinaryString" | "ArrayBuffer" | "DataURL"
    // accept: '.ics,.pdf',
    accept: ['.json', '.pdf'],
    validators: [new FileAmountLimitValidator({ min: 2, max: 3 })],
    // readFilesContent: false, // ignores file content
  });

  if (errors.length) {
    return (
      <div>
        <button onClick={() => openFilePicker()}>Something went wrong, retry! </button>
        {errors.map(err => (
          <div>
            {err.name}: {err.reason}
            /* e.g. "name":"FileAmountLimitError", "reason":"MAX_AMOUNT_OF_FILES_EXCEEDED" */
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={() => openFilePicker()}>Select file </button>
      <button onClick={() => clear()}>Clear</button>
      <br />
      Number of selected files:
      {plainFiles.length}
      <br />
      {/* If readAs is set to DataURL, You can display an image */}
      {!!filesContent.length && <img src={filesContent[0].content} />}
      <br />
      {plainFiles.map(file => (
        <div key={file.name}>{file.name}</div>
      ))}
    </div>
  );
}
```

### Callbacks

You can hook your logic into callbacks that will be fired at specific events during the lifetime of the hook. useFilePicker accepts these callbacks:

- onFilesSelected
- onFilesRejected
- onFilesSuccessfullySelected
- onClear

These are described in more detail in the [Props](#props) section.

```ts
import { useFilePicker } from 'use-file-picker';

export default function App() {
  const { openFilePicker, filesContent, loading, errors, plainFiles, clear } = useFilePicker({
    multiple: true,
    readAs: 'DataURL',
    accept: ['.json', '.pdf'],
    onFilesSelected: ({ plainFiles, filesContent, errors }) => {
      // this callback is always called, even if there are errors
      console.log('onFilesSelected', plainFiles, filesContent, errors);
    },
    onFilesRejected: ({ errors }) => {
      // this callback is called when there were validation errors
      console.log('onFilesRejected', errors);
    },
    onFilesSuccessfullySelected: ({ plainFiles, filesContent }) => {
      // this callback is called when there were no validation errors
      console.log('onFilesSuccessfullySelected', plainFiles, filesContent);
    },
    onClear: () => {
      // this callback is called when the selection is cleared
      console.log('onClear');
    },
  });
}
```

`useImperativePicker` hook also accepts the callbacks listed above. Additionally, it accepts the `onFileRemoved` callback, which is called when a file is removed from the list of selected files.

```ts
import { useImperativeFilePicker } from 'use-file-picker';

export default function App() {
  const { openFilePicker, filesContent, loading, errors, plainFiles, clear } = useImperativeFilePicker({
    onFileRemoved: (removedFile, removedIndex) => {
      // this callback is called when a file is removed from the list of selected files
      console.log('onFileRemoved', removedFile, removedIndex);
    },
  });
}
```

### Keeping the previously selected files and removing them from selection on demand

If you want to keep the previously selected files and remove them from the selection, you can use a separate hook called `useImperativeFilePicker` that is also exported in this package. For files removal, you can use `removeFileByIndex` or `removeFileByReference` functions.

```ts
import React from 'react';
import { useImperativeFilePicker } from 'use-file-picker';

const Imperative = () => {
  const { openFilePicker, filesContent, loading, errors, plainFiles, clear, removeFileByIndex, removeFileByReference } =
    useImperativeFilePicker({
      multiple: true,
      readAs: 'Text',
      readFilesContent: true,
    });

  if (errors.length) {
    return (
      <div>
        <button onClick={() => openFilePicker()}>Something went wrong, retry! </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {console.log(errors)}
          {errors.map(err => (
            <div>
              {err.name}: {err.reason}
              /* e.g. "name":"FileAmountLimitError", "reason":"MAX_AMOUNT_OF_FILES_EXCEEDED" */
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={async () => openFilePicker()}>Select file</button>
      <button onClick={() => clear()}>Clear</button>
      <br />
      Amount of selected files:
      {plainFiles.length}
      <br />
      Amount of filesContent:
      {filesContent.length}
      <br />
      {plainFiles.map((file, i) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }} key={file.name}>
            <div>{file.name}</div>
            <button style={{ marginLeft: 24 }} onClick={() => removeFileByReference(file)}>
              Remove by reference
            </button>
            <button style={{ marginLeft: 24 }} onClick={() => removeFileByIndex(i)}>
              Remove by index
            </button>
          </div>
          <div>{filesContent[i]?.content}</div>
        </div>
      ))}
    </div>
  );
};
```

## API

### Props

| Prop name                      | Description                                                                                                                                                                                                                    | Default value | Example values                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------ |
| multiple                       | Allow user to pick multiple files at once                                                                                                                                                                                      | true          | true, false                                      |
| accept                         | Set type of files that user can choose from the list                                                                                                                                                                           | "\*"          | [".png", ".txt"], "image/\*", ".txt"             |
| readAs                         | Set a return type of [filesContent](#returns)                                                                                                                                                                                  | "Text"        | "DataURL", "Text", "BinaryString", "ArrayBuffer" |
| readFilesContent               | Ignores files content and omits reading process if set to false                                                                                                                                                                | true          | true, false                                      |
| validators                     | Add validation logic. You can use some of the [built-in validators](#built-in-validators) like FileAmountLimitValidator or create your own [custom validation](#custom-validation) logic                                       | []            | [MyValidator, MySecondValidator]                 |
| initializeWithCustomParameters | allows for customization of the input element that is created by the file picker. It accepts a function that takes in the input element as a parameter and can be used to set any desired attributes or styles on the element. | n/a           | (input) => input.setAttribute("disabled", "")    |
| onFilesSelected                | A callback function that is called when files are successfully selected. The function is passed an array of objects with information about each successfully selected file                                                     | n/a           | (data) => console.log(data)                      |
| onFilesSuccessfullySelected    | A callback function that is called when files are successfully selected. The function is passed an array of objects with information about each successfully selected file                                                     | n/a           | (data) => console.log(data)                      |
| onFilesRejected                | A callback function that is called when files are rejected due to validation errors or other issues. The function is passed an array of objects with information about each rejected file                                      | n/a           | (data) => console.log(data)                      |
| onClear                        | A callback function that is called when the selection is cleared.                                                                                                                                                              | n/a           | () => console.log('selection cleared')           |

### Returns

| Name           | Description                                                                              |
| -------------- | ---------------------------------------------------------------------------------------- |
| openFilePicker | Opens file selector                                                                      |
| clear          | Clears all files and errors                                                              |
| filesContent   | Get files array of type FileContent                                                      |
| plainFiles     | Get array of the [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) objects |
| loading        | True if the reading files is in progress, otherwise False                                |
| errors         | Get errors array of type FileError if any appears                                        |

### Built-in validators

useFilePicker has some built-in validators that can be used out of the box. These are:

- FileAmountLimitValidator - allows to select a specific number of files (min and max) that will pass validation. This will work great with simple useFilePicker use cases, it will run on every file selection.
- FileTypeValidator - allows to select files with a specific extension that will pass validation.
- FileSizeValidator - allows to select files of a specific size (min and max) in bytes that will pass validation.
- ImageDimensionsValidator - allows to select images of a specific size (min and max) that will pass validation.
- PersistentFileAmountLimitValidator - allows to select a specific number of files (min and max) that will pass validation but it takes into consideration the previously selected files. This will work great with useImperativeFilePicker hook when you want to keep track of how many files are selected even when user is allowed to trigger selection multiple times before submitting the files.

### Custom validation

useFilePicker allows for injection of custom validation logic. Validation is divided into two steps:

- **validateBeforeParsing** - takes place before parsing. You have access to config passed as argument to useFilePicker hook and all plain file objects of selected files by user. Called once for all files after selection.
- **validateAfterParsing** - takes place after parsing (or is never called if readFilesContent is set to false).You have access to config passed as argument to useFilePicker hook, FileWithPath object that is currently being validated and the reader object that has loaded that file. Called individually for every file.

```ts
interface Validator {
  validateBeforeParsing(config: UseFilePickerConfig, plainFiles: File[]): Promise<void>;
  validateAfterParsing(config: UseFilePickerConfig, file: FileWithPath, reader: FileReader): Promise<void>;
}
```

Validators must return Promise object - resolved promise means that file passed validation, rejected promise means that file did not pass.

Since version 2.0, validators also have optional callback handlers that will be run when an important event occurs during the selection process. These are:

```ts
 /**
   * lifecycle method called after user selection (regardless of validation result)
   */
  onFilesSelected(
    _data: SelectedFilesOrErrors<ExtractContentTypeFromConfig<ConfigType>, CustomErrors>
  ): Promise<void> | void {}
  /**
   * lifecycle method called after successful validation
   */
  onFilesSuccessfullySelected(_data: SelectedFiles<ExtractContentTypeFromConfig<ConfigType>>): Promise<void> | void {}
  /**
   * lifecycle method called after failed validation
   */
  onFilesRejected(_data: FileErrors<CustomErrors>): Promise<void> | void {}
  /**
   * lifecycle method called after the selection is cleared
   */
  onClear(): Promise<void> | void {}

  /**
   * This method is called when file is removed from the list of selected files.
   * Invoked only by the useImperativeFilePicker hook
   * @param _removedFile removed file
   * @param _removedIndex index of removed file
   */
  onFileRemoved(_removedFile: File, _removedIndex: number): Promise<void> | void {}
```

#### Example validator

```ts
/**
 * validateBeforeParsing allows the user to select only an even number of files
 * validateAfterParsing allows the user to select only files that have not been modified in the last 24 hours
 */
class CustomValidator extends Validator {
  async validateBeforeParsing(config: ConfigType, plainFiles: File) {
    return new Promise<void>((res, rej) => (plainFiles.length % 2 === 0 ? res() : rej({ oddNumberOfFiles: true })));
  }
  async validateAfterParsing(config: ConfigType, file: FileWithPath, reader: FileReader) {
    return new Promise<void>((res, rej) =>
      file.lastModified < new Date().getTime() - 24 * 60 * 60 * 1000
        ? res()
        : rej({ fileRecentlyModified: true, lastModified: file.lastModified })
    );
  }
  onFilesSuccessfullySelected(data: SelectedFiles<ExtractContentTypeFromConfig<ConfigType>>) {
    console.log(data);
  }
}
```

## Authors

👤 **Milosz Jankiewicz**

- Twitter: [@twitter.com/jaaneek/](https://twitter.com/jaaneek)
- Github: [@Jaaneek](https://github.com/Jaaneek)
- LinkedIn: [@https://www.linkedin.com/in/jaaneek](https://www.linkedin.com/in/mi%C5%82osz-jankiewicz-554562168/)

👤 **Kamil Planer**

- Github: [@MrKampla](https://github.com/MrKampla)
- LinkedIn: [@https://www.linkedin.com/in/kamil-planer/](https://www.linkedin.com/in/kamil-planer/)

👤 **Adam Dobrzeniewski**

- Twitter: [@twitter.com/xForsect](https://twitter.com/xForsect)
- Github: [@Forsect](https://github.com/Forsect)
- LinkedIn: [@https://www.linkedin.com/in/adam-dobrzeniewski](https://www.linkedin.com/in/adam-dobrzeniewski)

## [](https://github.com/Jaaneek/useFilePicker#-contributing)🤝 Contributing

Contributions, issues and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/Jaaneek/useFilePicker/issues).

## [](https://github.com/Jaaneek/useFilePicker#show-your-support)Show your support

Give a ⭐️ if this project helped you!

![cooldoge Discord & Slack Emoji](https://emoji.gg/assets/emoji/cooldoge.gif)
