# `webpack-plugin-modify-entrypoints`

[![Node.js CI](https://github.com/webdeveric/webpack-plugin-modify-entrypoints/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/webdeveric/webpack-plugin-modify-entrypoints/actions/workflows/node.js.yml)

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
