import { ModifyEntryPoints, type ModifyEntryPointsOptions } from '../../src/plugin.js';

import { makeCompiler } from './makeCompiler.js';

import type { Compiler, Configuration, Stats } from 'webpack';

export function create(
  config: Configuration,
  pluginOptions: ModifyEntryPointsOptions,
): {
  compiler: Compiler;
  plugin: ModifyEntryPoints;
  run: () => Promise<Stats | undefined>;
} {
  const plugin = new ModifyEntryPoints(pluginOptions);

  config.plugins ??= [];
  config.plugins.push(plugin);

  const compiler = makeCompiler(config);

  const run = (): Promise<Stats | undefined> =>
    new Promise((resolve, reject) => {
      compiler.run((err, stats) => (err ? reject(err) : resolve(stats)));
    });

  return { compiler, plugin, run };
}
