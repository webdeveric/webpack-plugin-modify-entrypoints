# `webpack-plugin-modify-entrypoints`

## Install

`pnpm add webpack-plugin-modify-entrypoints -D`

## Example usage

Import plugin in your webpack config.

```js
import { ModifyEntryPoints } from 'webpack-plugin-modify-entrypoints';
```

Add this to your plugins array.

```js
new ModifyEntryPoints({
  modify(source, details) {
    return `
      // Before
      ${source}
      // After
    `;
  },
});
```
