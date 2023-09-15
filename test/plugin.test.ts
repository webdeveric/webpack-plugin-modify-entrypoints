import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import { ModifyEntryPoints } from '../src/plugin.js';

import { create } from './utils/create.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe.concurrent('ModifyEntryPoints', () => {
  it('Is a webpack plugin', () => {
    const plugin = new ModifyEntryPoints({
      modify: source => source,
    });

    expect(typeof plugin.apply).toEqual('function');
  });

  describe.concurrent('Modify entrypoint contents', () => {
    it('entry: string', async () => {
      const modifyFn = vi.fn(source => `import './demo2.js'; ${source.toString()}`);

      const { compiler, run } = create(
        {
          entry: resolve(__dirname, './fixtures/demo.js'),
          output: {
            clean: true,
            path: resolve(__dirname, './fixtures/dist'),
          },
        },
        {
          modify: modifyFn,
        },
      );

      await expect(run()).resolves.toBeDefined();

      const fileContents = await new Promise<string>((res, rej) => {
        compiler.outputFileSystem.readFile(resolve(__dirname, './fixtures/dist/main.js'), (error, contents) => {
          (error && rej(error)) || res(contents?.toString() ?? '');
        });
      });

      expect(modifyFn).toHaveBeenCalledOnce();
      expect(fileContents.includes("console.log('Demo2');")).toBeTruthy();
    });

    it('entry: [string]', async () => {
      const modifyFn = vi.fn(source => `import './demo2.js'; ${source.toString()}`);

      const { compiler, run } = create(
        {
          entry: [resolve(__dirname, './fixtures/demo.js')],
          output: {
            clean: true,
            path: resolve(__dirname, './fixtures/dist'),
          },
        },
        {
          modify: modifyFn,
        },
      );

      await expect(run()).resolves.toBeDefined();

      const fileContents = await new Promise<string>((res, rej) => {
        compiler.outputFileSystem.readFile(resolve(__dirname, './fixtures/dist/main.js'), (error, contents) => {
          (error && rej(error)) || res(contents?.toString() ?? '');
        });
      });

      expect(modifyFn).toHaveBeenCalledOnce();
      expect(fileContents.includes("console.log('Demo2');")).toBeTruthy();
    });

    it('entry: string[]', async () => {
      const modifyFn = vi.fn(source => `import './demo2.js'; ${source.toString()}`);

      const { compiler, run } = create(
        {
          entry: [resolve(__dirname, './fixtures/shared.js'), resolve(__dirname, './fixtures/common.js')],
          output: {
            clean: true,
            path: resolve(__dirname, './fixtures/dist'),
          },
        },
        {
          modify: modifyFn,
        },
      );

      await expect(run()).resolves.toBeDefined();

      const fileContents = await new Promise<string>((res, rej) => {
        compiler.outputFileSystem.readFile(resolve(__dirname, './fixtures/dist/main.js'), (error, contents) => {
          (error && rej(error)) || res(contents?.toString() ?? '');
        });
      });

      expect(modifyFn).toHaveBeenCalledOnce();
      expect(fileContents.includes("console.log('Demo2');")).toBeTruthy();
    });

    it('entry: Record<string, string>', async () => {
      const modifyFn = vi.fn(source => `import './demo2.js'; ${source.toString()}`);

      const { compiler, run } = create(
        {
          entry: {
            demo: resolve(__dirname, './fixtures/demo.js'),
          },
          output: {
            clean: true,
            path: resolve(__dirname, './fixtures/dist'),
          },
        },
        {
          modify: modifyFn,
        },
      );

      await expect(run()).resolves.toBeDefined();

      const fileContents = await new Promise<string>((res, rej) => {
        compiler.outputFileSystem.readFile(resolve(__dirname, './fixtures/dist/demo.js'), (error, contents) => {
          (error && rej(error)) || res(contents?.toString() ?? '');
        });
      });

      expect(modifyFn).toHaveBeenCalledOnce();
      expect(fileContents.includes("console.log('Demo2');")).toBeTruthy();
    });

    it('entry: Record<string, EntryDescriptor>', async () => {
      const modifyFn = vi.fn(source => `import './demo2.js'; ${source.toString()}`);

      const { compiler, run } = create(
        {
          entry: {
            demo: {
              import: resolve(__dirname, './fixtures/demo.js'),
              filename: 'demo-bundle.js',
            },
            shared: {
              import: [resolve(__dirname, './fixtures/shared.js'), resolve(__dirname, './fixtures/common.js')],
            },
          },
          output: {
            clean: true,
            path: resolve(__dirname, './fixtures/dist'),
          },
        },
        {
          modify: modifyFn,
        },
      );

      await expect(run()).resolves.toBeDefined();

      expect(modifyFn).toHaveBeenCalledTimes(2);

      const demoFileContents = await new Promise<string>((res, rej) => {
        compiler.outputFileSystem.readFile(resolve(__dirname, './fixtures/dist/demo-bundle.js'), (error, contents) => {
          (error && rej(error)) || res(contents?.toString() ?? '');
        });
      });

      expect(demoFileContents.includes("console.log('Demo2');")).toBeTruthy();

      const sharedFileContents = await new Promise<string>((res, rej) => {
        compiler.outputFileSystem.readFile(resolve(__dirname, './fixtures/dist/shared.js'), (error, contents) => {
          (error && rej(error)) || res(contents?.toString() ?? '');
        });
      });

      expect(sharedFileContents.includes("console.log('Demo2');")).toBeTruthy();
    });

    it('entry: () => EntryStatic', async () => {
      const modifyFn = vi.fn(source => `import './demo2.js'; ${source.toString()}`);

      const { compiler, run } = create(
        {
          entry: () => ({
            demo: resolve(__dirname, './fixtures/demo.js'),
          }),
          output: {
            clean: true,
            path: resolve(__dirname, './fixtures/dist'),
          },
        },
        {
          modify: modifyFn,
        },
      );

      await expect(run()).resolves.toBeDefined();

      expect(modifyFn).toHaveBeenCalledOnce();

      const demoFileContents = await new Promise<string>((res, rej) => {
        compiler.outputFileSystem.readFile(resolve(__dirname, './fixtures/dist/demo.js'), (error, contents) => {
          (error && rej(error)) || res(contents?.toString() ?? '');
        });
      });

      expect(demoFileContents.includes("console.log('Demo2');")).toBeTruthy();
    });

    it('entry: () => throws', async () => {
      const modifyFn = vi.fn(source => `import './demo2.js'; ${source.toString()}`);

      const { run } = create(
        {
          entry: () => {
            throw new Error('Entry error');
          },
          output: {
            clean: true,
            path: resolve(__dirname, './fixtures/dist'),
          },
        },
        {
          modify: modifyFn,
        },
      );

      await expect(run()).rejects.toBeInstanceOf(Error);
    });
  });
});
