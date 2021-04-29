<h1 align="center">Welcome to use-file-picker 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/use-file-picker" target="_blank">
  <img alt="Version" src="https://img.shields.io/npm/v/use-file-picker?color=blue" />
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://twitter.com/twitter.com/JankiewiczMi" target="_blank">
    <img alt="Twitter: twitter.com/JankiewiczMi/" src="https://img.shields.io/twitter/follow/JankiewiczMi.svg?style=social" />
  </a>
</p>

> Simple react hook to open browser file selector.

### 🏠 [Homepage](https://github.com/Jaaneek/useFilePicker)

## Install

```console
npm i use-file-picker
```

## Example

https://codesandbox.io/s/pedantic-joliot-8nkn7?file=/src/App.js

## Usage

```jsx
import { useFilePicker } from 'use-file-picker';

const App = () => {
  const [openFileSelector, { filesContent, loading, errors, plainFiles }] = useFilePicker({
    multiple: true,
    readAs: 'DataURL', // availible formats: "Text" | "BinaryString" | "ArrayBuffer" | "DataURL"
    // accept: '.ics,.pdf',
    accept: ['.json', '.pdf'],
    limitFilesConfig: { min: 2, max: 3 },
    // minFileSize: 1, // in megabytes
    // maxFileSize: 1,
    // maxImageHeight: 1024, // in pixels
    // minImageHeight: 1024,
    // maxImageWidth: 768,
    // minImageWidth: 768
    // readFilesContent: false, // ignores file content
  });

  if (errors.length) {
    return (
      <div>
        <button onClick={() => openFileSelector()}>Something went wrong, retry! </button>
        {errors[0].fileSizeTooSmall && 'File size is too small!'}
        {errors[0].fileSizeToolarge && 'File size is too large!'}
        {errors[0].readerError && 'Problem occured while reading file!'}
        {errors[0].maxLimitExceeded && 'Too many files'}
        {errors[0].minLimitNotReached && 'Not enought files'}
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={() => openFileSelector()}>Select file </button>
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
};
```

## Author

👤 **Milosz Jankiewicz**

- Twitter: [@twitter.com\/JankiewiczMi\/](https://twitter.com/JankiewiczMi/)
- Github: [@Jaaneek ](https://github.com/Jaaneek)
- LinkedIn: [@https:\/\/www.linkedin.com\/in\/jaaneek](https://www.linkedin.com/in/mi%C5%82osz-jankiewicz-554562168/)

👤 **Kamil Planer**

- Github: [@MrKampla ](https://github.com/MrKampla)
- LinkedIn: [@https://www.linkedin.com/in/kamil-planer/](https://www.linkedin.com/in/kamil-planer/)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Jaaneek/useFilePicker/issues).

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
