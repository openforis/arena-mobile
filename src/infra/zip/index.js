import * as ZIP from 'react-native-zip-archive';

import {BASE_PATH} from 'infra/fs';

export const zip = async ({
  source = '',
  destination,
  base = BASE_PATH,
  baseOutput,
}) =>
  ZIP.zip(
    `${base}${source !== '' ? '/' : ''}${source}`,
    `${baseOutput || base}/${destination}`,
  );
