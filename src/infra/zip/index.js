import * as ZIP from 'react-native-zip-archive';

import {BASE_PATH} from 'infra/fs';

export const zip = async ({source, destination}) =>
  ZIP.zip(`${BASE_PATH}/${source}`, `${BASE_PATH}/${destination}`);
