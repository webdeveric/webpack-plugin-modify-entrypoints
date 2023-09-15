import type { ModifyDetails, ModifyFn } from './types.js';
import type { LoaderDefinitionFunction } from 'webpack';

export const raw = false;

export type ModifyEntryPointsLoaderOptions = {
  modify: ModifyFn;
  details: ModifyDetails;
};

const modifyEntryPointsLoader: LoaderDefinitionFunction<ModifyEntryPointsLoaderOptions> = async function (source) {
  const options = this.getOptions();

  return await options.modify(source, options.details);
};

export default modifyEntryPointsLoader;
