import {combineReducers} from 'redux'

import {createActions} from 'redux-actions'

import {reducer as app} from './app'

export const RESET_STATE = 'root/RESET_STATE'

const appReducers = combineReducers({
  app,
})

export default (state, action) => {
  if (action.type === RESET_STATE) {
    state = undefined
  }

  return appReducers(state, action)
}
