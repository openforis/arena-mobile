// Web replacement of @lodev09/react-native-exify: no EXIF data handling in the browser
export const read = (_uri: string): Promise<undefined> =>
  Promise.resolve(undefined);

export const write = (_uri: string, _data: any): Promise<undefined> =>
  Promise.resolve(undefined);
