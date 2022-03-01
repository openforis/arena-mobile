import {handleActions} from 'redux-actions'

import actions from '../actionCreators'
import initialState from '../initial.state'

const appPreferences = handleActions(
  {
    [actions.setServerUrl]: (state, {payload: {serverUrl}}) => ({
      ...state,
      serverUrl,
    }),
  },
  initialState.preferences || {},
)

export default appPreferences
