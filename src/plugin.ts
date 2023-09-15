import { fileURLToPath } from 'node:url';

import { makeIdent } from './utils.js';

import type { ModifyEntryPointsLoaderOptions } from './loader.js';
import type { ModifyFn } from './types.js';
import type { SyncBailHook } from 'tapable';
import type { Compiler, EntryNormalized, WebpackPluginInstance } from 'webpack';

export const PLUGIN_NAME = 'modify-entrypoints';

type EntrypointDetails = {
  processed: boolean;
  entryKey: string;
};

export type ModifyEntryPointsOptions = {
  modify: ModifyFn;
};

export class ModifyEntryPoints implements WebpackPluginInstance {
  constructor(protected readonly options: ModifyEntryPointsOptions) {}

  apply(compiler: Compiler): void {
    const entryPoints = new Map<string, EntrypointDetails>();

    const infraLogger = compiler.getInfrastructureLogger(PLUGIN_NAME);

    // webpack types are wrong. It should allow `undefined` to be returned.
    (compiler.hooks.entryOption as unknown as SyncBailHook<[string, EntryNormalized], undefined>).tap(
      PLUGIN_NAME,
      (_, entry) => {
        Promise.resolve()
          .then(() => (typeof entry === 'function' ? entry() : entry))
          .then(entryNormalized => {
            Object.entries(entryNormalized).forEach(([key, value]) => {
              value.import?.forEach((importPath, index, imports) => {
                infraLogger.status(`Recording imports: ${key} - ${index + 1} of ${imports.length}`);

                entryPoints.set(importPath, {
                  processed: false,
                  entryKey: key,
                });
              });
            });
          })
          .catch(error => {
            infraLogger.error(error);
          });
      },
    );

    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      const loaderPath = fileURLToPath(new URL('loader.js', import.meta.url));

      infraLogger.debug(`Loader path: ${loaderPath}`);

      compiler.webpack.NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(
        PLUGIN_NAME,
        (loaders, normalModule) => {
          const entryDetails = entryPoints.get(normalModule.userRequest);

          if (entryDetails?.processed === false) {
            const options: ModifyEntryPointsLoaderOptions = {
              modify: this.options.modify,
              details: {
                userRequest: normalModule.userRequest,
                entryKey: entryDetails.entryKey,
              },
            };

            const loaderItem: (typeof loaders)[number] = {
              loader: loaderPath,
              options,
              ident: makeIdent(options),
              type: 'module',
            };

            loaders.push(loaderItem);

            infraLogger.status(`Loader added to entrypoint: ${entryDetails.entryKey}`);

            infraLogger.debug({
              loaderItem,
              userRequest: normalModule.userRequest,
              entryDetails,
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
