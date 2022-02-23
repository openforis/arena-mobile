import {combineReducers} from 'redux'

import {reducer as app} from './app'
import {reducer as user} from './user'

export const RESET_STATE = 'root/RESET_STATE'

const appReducers = combineReducers({
  app,
  user,
})

export default (state, action) => {
  if (action.type === RESET_STATE) {
    state = undefined
  }

  return appReducers(state, action)
}
