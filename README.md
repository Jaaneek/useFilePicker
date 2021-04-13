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

function App() {
  const [filesContent, errors, openFileSelector, loading] = useFilePicker({
    multiple: true,
    readAs: 'Text', // default: "Text", availible formats: "Text" | "BinaryString" | "ArrayBuffer" | "DataURL"
    // accept: '.ics,.pdf',
    accept: ['.json', '.pdf'],
  });

  if (errors.length > 0) return <p>Error!</p>;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={() => openFileSelector()}>Reopen file selector</button>
      <pre>{JSON.stringify(filesContent)}</pre>
    </div>
  );
}
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
