import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ModifyEntryPointsLoaderOptions } from './loader.js';
import type { ModifyFn } from './types.js';
import type { SyncBailHook } from 'tapable';
import type { Compiler, EntryNormalized, WebpackPluginInstance } from 'webpack';

export const PLUGIN_NAME = 'modify-entrypoints';

export type ModifyEntryPointsOptions = {
  modify: ModifyFn;
};

export class ModifyEntryPoints implements WebpackPluginInstance {
  constructor(protected readonly options: ModifyEntryPointsOptions) {}

  apply(compiler: Compiler): void {
    const entryPoints = new Map<string, { processed: boolean; entryKey: string }>();

    (compiler.hooks.entryOption as unknown as SyncBailHook<[string, EntryNormalized], undefined>).tap(
      PLUGIN_NAME,
      (context, entry) => {
        if (typeof entry === 'object') {
          Object.entries(entry).forEach(([key, value]) => {
            value.import?.forEach(importPath =>
              entryPoints.set(resolve(context, importPath), {
                processed: false,
                entryKey: key,
              }),
            );
          });
        }

        // console.log(entryPoints);
      },
    );

    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      const loaderPath = fileURLToPath(new URL('loader.js', import.meta.url));

      compiler.webpack.NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(
        PLUGIN_NAME,
        (loaders, normalModule) => {
          const entryDetails = entryPoints.get(normalModule.userRequest);

          // console.dir({ userRequest: normalModule.userRequest, entryDetails });

          if (entryDetails?.processed === false) {
            loaders.push({
              loader: loaderPath,
              options: {
                modify: this.options.modify,
                details: {
                  userRequest: normalModule.userRequest,
                  entryKey: entryDetails.entryKey,
                },
              } satisfies ModifyEntryPointsLoaderOptions,
              ident: null,
              type: 'module',
            });

            entryPoints.set(normalModule.userRequest, {
              ...entryDetails,
              processed: true,
            });
          }
        },
      );
    });
  }
}
