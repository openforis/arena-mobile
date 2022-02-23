import {createSelector} from 'reselect'
import initialState from './initial.state'

const getState = state => state?.app

const getAccessData = createSelector(
  getState,
  app => app?.accessData || initialState.accessData,
)

const getUi = createSelector(getState, app => app?.ui || initialState.ui)
const getIsLoading = createSelector(getUi, ui => ui?.isLoading)

export default {
  getAccessData,
  getIsLoading,
}
