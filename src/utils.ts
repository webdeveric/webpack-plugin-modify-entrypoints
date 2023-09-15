import { createHash } from 'node:crypto';

import type { ModifyEntryPointsLoaderOptions } from './loader.js';

export function makeIdent(options: ModifyEntryPointsLoaderOptions): string {
  return createHash('md5')
    .update(JSON.stringify(options, (_, value) => (typeof value === 'function' ? value.toString() : value), 0))
    .digest('hex');
}
