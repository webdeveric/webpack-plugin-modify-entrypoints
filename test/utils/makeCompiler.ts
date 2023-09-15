import path from 'node:path';

import { createFsFromVolume, Volume } from 'memfs';
import { type Compiler, type Configuration, webpack } from 'webpack';

export function makeCompiler(config: Configuration): Compiler {
  const compiler = webpack({
    mode: 'development',
    infrastructureLogging: {
      level: 'none',
      debug: false,
    },
    ...config,
  });

  compiler.outputFileSystem = createFsFromVolume(new Volume());
  compiler.outputFileSystem.join = path.join.bind(path);

  return compiler;
}
