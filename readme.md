# `webpack-plugin-modify-entrypoints`

## Install

`pnpm add webpack-plugin-modify-entrypoints -D`

## Example usage

Add this to your webpack plugins array.

```js
new ModifyEntryPoints({
  modify(source, details) {
    return `
      // Before
      ${source}
      // After
    `;
  }
});
```
