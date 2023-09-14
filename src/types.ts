export type ModifyDetails = {
  userRequest: string;
  entryKey: string;
};

export type ModifyFn = (source: string, details: ModifyDetails) => string | Promise<string>;
