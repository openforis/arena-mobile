export {default} from 'navigation';

import {connectToDevTools} from 'react-devtools-core';

if (__DEV__) {
  connectToDevTools({
    host: 'localhost',
    port: 8081,
  });
}
