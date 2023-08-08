import {handleActions} from 'redux-actions';

import actions from '../../actionCreators';
import initialState from '../../initial.state';

const _serverUrl = handleActions(
  {
    [actions.setServerUrl]: (_, {payload: {serverUrl = ''}}) => serverUrl,
  },

  initialState.preferences?.serverUrl,
);

export default _serverUrl;
