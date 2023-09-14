import type { ModifyDetails, ModifyFn } from './types.js';
import type { LoaderContext } from 'webpack';

export const raw = false;

export type ModifyEntryPointsLoaderOptions = {
  modify: ModifyFn;
  details: ModifyDetails;
};

type ModifyEntryPointsLoaderContext = LoaderContext<ModifyEntryPointsLoaderOptions>;

/**
 * @todo Update types package
 * @see https://github.com/webpack/loader-utils/issues/234
 */
// type FixedGetOptions = (loaderContext: ModifyEntryPointsLoaderContext) => Readonly<ModifyEntryPointsLoaderOptions>;

export default function modifyEntryPointsLoader(this: ModifyEntryPointsLoaderContext, source: string): void {
  const callback = this.async();
  const options = this.getOptions();

  Promise.resolve()
    .then(() => options.modify(source, options.details))
    .then(modifiedSource => callback(null, modifiedSource), callback);
}
