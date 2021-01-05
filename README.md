<h1 align="center">Welcome to use-file-picker 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.2-blue.svg?cacheSeconds=2592000" />
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

Usage

```jsx
import { useFilePicker } from 'use-file-picker';

function App() {
  const [filesContent, errors, openFileSelector] = useFilePicker({
    multiple: true,
    accept: '.ics,.pdf',
  });

  if (errors.length > 0) return <p>Error!</p>;

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
- LinkedIn: [@https:\/\/www.linkedin.com\/in\/mi%C5%82osz-jankiewicz-554562168\/](https://www.linkedin.com/in/mi%C5%82osz-jankiewicz-554562168/)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Jaaneek/useFilePicker/issues).

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
