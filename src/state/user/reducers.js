import {handleActions} from 'redux-actions'
import initialState from './initial.state'

import actions from './actionCreators'

const data = handleActions(
  {
    [actions.setUser]: (state, {payload: {user}}) => user || state,
  },
  initialState || {},
)

export default data
